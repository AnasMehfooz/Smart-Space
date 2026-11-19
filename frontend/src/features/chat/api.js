import { api } from "@/lib/apiClient";
import { sse } from "@/lib/sse";

/** → {id, title, ...} */
export const createSession = () => api.post("/chat/sessions", {});

/**
 * Asks a question. Yields the stream in this order:
 * meta {search_only} → files {results} → token {t}… → sources {citations: [{n, file_id, name, rel_path, page}]} → done
 * (or error {code, message} then done).
 */
export const streamMessage = (sessionId, content, signal) =>
  sse(`/chat/sessions/${sessionId}/messages`, { body: { content }, signal });

export const stopGeneration = (sessionId) => api.post(`/chat/sessions/${sessionId}/stop`);
