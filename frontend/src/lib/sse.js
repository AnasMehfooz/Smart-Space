// Server-Sent Events over fetch, so the Bearer token header can be sent (EventSource cannot).
import { ApiError, backend } from "./apiClient";

/**
 * Yields {event, data} for each event of a stream. Stop it with the AbortSignal.
 * @param {string} path e.g. "/index/events"
 * @param {{body?: object, signal?: AbortSignal}} [opts] body → POST (chat), otherwise GET
 */
export async function* sse(path, { body, signal } = {}) {
  const { base, token } = await backend();
  const res = await fetch(base + path, {
    method: body ? "POST" : "GET",
    signal,
    headers: { Authorization: `Bearer ${token}`, ...(body && { "Content-Type": "application/json" }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new ApiError(err?.error?.code ?? "HTTP_" + res.status, err?.error?.message ?? "Stream failed", err?.error?.details, res.status);
  }
  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buf = "";
  let event = "message";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) return;
    buf += value;
    let i;
    while ((i = buf.indexOf("\n")) >= 0) {
      const line = buf.slice(0, i).replace(/\r$/, "");
      buf = buf.slice(i + 1);
      if (line.startsWith("event:")) event = line.slice(6).trim();
      else if (line.startsWith("data:")) yield { event, data: JSON.parse(line.slice(5)) };
      else if (line === "") event = "message";
    }
  }
}
