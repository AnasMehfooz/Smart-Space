import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { qk } from "@/lib/queryKeys";
import { sse } from "@/lib/sse";
import { getIndexStatus } from "./api";

/** Index status. Kept live by useIndexEvents; the slow poll is only a safety net. */
export function useIndexStatus() {
  return useQuery({
    queryKey: qk.indexStatus,
    queryFn: ({ signal }) => getIndexStatus({ signal }),
    refetchInterval: (q) => {
      const s = q.state.data;
      return s && s.state === "idle" && s.pending === 0 && s.summaries_pending === 0 ? false : 5000;
    },
  });
}

// file_processing is included so a new or changed file shows up ("Reading") right away, not only when finished.
const FILE_EVENTS = [
  "file_processing",
  "file_indexed",
  "file_skipped",
  "file_removed",
  "file_error",
  "summary_done",
  "summary_failed",
];

/**
 * Subscribes to /index/events while mounted: updates the status cache, refreshes the file list when files change,
 * and returns the file being read right now ({file_id, rel_path} or null).
 */
export function useIndexEvents() {
  const qc = useQueryClient();
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    let refreshTimer = null;
    const refreshFiles = () => {
      // Many events arrive close together while indexing; refresh at most twice a second.
      if (refreshTimer) return;
      refreshTimer = setTimeout(() => {
        refreshTimer = null;
        qc.invalidateQueries({ queryKey: ["files"] });
      }, 500);
    };
    const merge = (data) => qc.setQueryData(qk.indexStatus, (old) => ({ ...old, ...data }));

    (async () => {
      while (!ctrl.signal.aborted) {
        try {
          for await (const { event, data } of sse("/index/events", { signal: ctrl.signal })) {
            if (event === "progress") {
              // The total changes when the watcher finds a new or deleted file: show it in the list.
              if (qc.getQueryData(qk.indexStatus)?.total !== data.total) refreshFiles();
              merge(data);
            }
            else if (event === "state_changed") {
              merge(data);
              if (data.state === "idle") setCurrent(null);
            } else if (event === "file_processing") setCurrent(data);
            if (FILE_EVENTS.includes(event)) refreshFiles();
          }
        } catch (e) {
          if (e.name === "AbortError") return;
        }
        await new Promise((r) => setTimeout(r, 2000)); // stream dropped: reconnect
      }
    })();

    return () => {
      ctrl.abort();
      clearTimeout(refreshTimer);
    };
  }, [qc]);

  return current;
}
