import { useCallback, useRef, useState } from "react";
import { createSession, stopGeneration, streamMessage } from "./api";
import { errorMessage } from "@/lib/errors";

/**
 * One chat conversation. messages: [{role: "user"|"assistant", text, citations, files, error, pending, searchOnly}]
 */
export function useChat() {
  const [messages, setMessages] = useState([]);
  const sessionRef = useRef(null);
  const abortRef = useRef(null);
  const busy = messages.some((m) => m.pending);

  const updateLast = (fn) =>
    setMessages((list) => {
      const copy = list.slice();
      copy[copy.length - 1] = fn(copy[copy.length - 1]);
      return copy;
    });

  const send = useCallback(
    async (text) => {
      const content = text.trim();
      if (!content || busy) return;
      setMessages((list) => [
        ...list,
        { role: "user", text: content },
        { role: "assistant", text: "", citations: [], files: [], pending: true },
      ]);
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      try {
        sessionRef.current ??= (await createSession()).id;
        for await (const { event, data } of streamMessage(sessionRef.current, content, ctrl.signal)) {
          if (event === "meta") updateLast((m) => ({ ...m, searchOnly: data.search_only }));
          else if (event === "files") updateLast((m) => ({ ...m, files: data.results ?? [] }));
          else if (event === "token") updateLast((m) => ({ ...m, text: m.text + data.t }));
          else if (event === "sources") updateLast((m) => ({ ...m, citations: data.citations ?? [] }));
          else if (event === "error") updateLast((m) => ({ ...m, error: data.message }));
          else if (event === "done") updateLast((m) => ({ ...m, pending: false, stopped: data.stopped }));
        }
      } catch (e) {
        if (e.name !== "AbortError") updateLast((m) => ({ ...m, error: errorMessage(e) }));
      } finally {
        updateLast((m) => ({ ...m, pending: false }));
        abortRef.current = null;
      }
    },
    [busy],
  );

  const stop = useCallback(async () => {
    if (sessionRef.current) await stopGeneration(sessionRef.current).catch(() => {});
  }, []);

  /** Starts a fresh conversation. */
  const reset = useCallback(() => {
    abortRef.current?.abort();
    sessionRef.current = null;
    setMessages([]);
  }, []);

  return { messages, busy, send, stop, reset };
}
