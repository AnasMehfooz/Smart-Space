import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import { sse } from "@/lib/sse";
import { getCatalog, getRecommendations } from "./api";

export function useCatalog() {
  return useQuery({ queryKey: qk.models, queryFn: ({ signal }) => getCatalog({ signal }) });
}

export function useRecommendations() {
  return useQuery({ queryKey: qk.recommendations, queryFn: ({ signal }) => getRecommendations({ signal }) });
}

/** True when an embedding model is installed and active (search needs it). */
export const hasActiveEmbedding = (catalog) =>
  !!catalog?.some((m) => m.role === "embedding" && m.is_active && m.status === "installed");

/**
 * Live download progress while `enabled`: {[model_id]: {bytes_done, bytes_total, speed_bps, eta_s, state, message}}.
 * Refreshes the catalog when a download finishes, fails or is cancelled.
 */
export function useDownloadProgress(enabled = true) {
  const qc = useQueryClient();
  const [progress, setProgress] = useState({});

  useEffect(() => {
    if (!enabled) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        for await (const { event, data } of sse("/models/downloads/events", { signal: ctrl.signal })) {
          const id = data.model_id;
          if (!id) continue;
          if (event === "progress" || event === "queued") {
            setProgress((p) => ({ ...p, [id]: { ...p[id], ...data, state: event } }));
          } else if (["completed", "failed", "cancelled"].includes(event)) {
            setProgress((p) => ({ ...p, [id]: { ...p[id], state: event, message: data.message } }));
            qc.invalidateQueries({ queryKey: qk.models });
          }
        }
      } catch (e) {
        if (e.name !== "AbortError") console.warn("download events stopped", e);
      }
    })();
    return () => ctrl.abort();
  }, [enabled, qc]);

  return progress;
}
