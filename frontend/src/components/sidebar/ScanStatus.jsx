import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, PauseCircle, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { pauseIndexing, resumeIndexing } from "@/features/index/api";
import { qk } from "@/lib/queryKeys";
import { formatDuration } from "@/lib/format";
import { errorMessage } from "@/lib/errors";

const PAUSE_TEXT = {
  battery: "Waiting for the charger",
  cpu: "Waiting while the PC is busy",
};

/**
 * Sidebar block: what the scanner is doing. Files that can't be read (empty, unsupported, …) count as done,
 * so the scan ends with "Scanning completed" instead of looking stuck. Stop / Resume only while there is work.
 */
export function ScanStatus({ status, current }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  if (!status) return null;

  const stoppedByUser = status.state === "paused" && status.paused_reason === "user";
  const working = status.state === "scanning" || status.state === "indexing";
  const summarizing = !working && status.state !== "paused" && status.summaries_pending > 0;
  const completed = !working && !summarizing && status.state === "idle";
  const done = status.indexed + status.skipped + status.errors;
  const percent = status.total ? (done / status.total) * 100 : 0;
  const unreadable = status.skipped + status.errors;

  let title;
  let detail = null;
  if (stoppedByUser) title = "Scanning stopped";
  else if (status.state === "paused") title = PAUSE_TEXT[status.paused_reason] ?? "Paused";
  else if (status.state === "scanning") title = "Looking for files…";
  else if (working) {
    title = "Scanning…";
    detail = current?.rel_path ? `Reading ${current.rel_path.split("/").pop()}` : null;
  } else if (summarizing) title = `Writing summaries · ${status.summaries_pending} left`;
  else title = "Scanning completed";

  async function toggle() {
    setBusy(true);
    setError(null);
    try {
      const next = stoppedByUser ? await resumeIndexing() : await pauseIndexing();
      qc.setQueryData(qk.indexStatus, next);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="scan-status" data-state={completed ? "done" : stoppedByUser ? "stopped" : "working"}>
      <div className="flex items-start gap-2.5">
        {status.state === "paused" ? (
          <PauseCircle className="scan-status__icon" />
        ) : completed ? (
          <CheckCircle2 className="scan-status__icon is-done" />
        ) : (
          <Loader2 className="scan-status__icon animate-spin" />
        )}
        <div className="min-w-0">
          <p className="scan-status__title">{completed ? <span className="mark mark--green">{title}</span> : title}</p>
          {detail && (
            <p className="scan-status__meta truncate" title={current?.rel_path}>
              {detail}
            </p>
          )}
        </div>
      </div>

      {!completed && <Progress value={percent} className="scan-status__bar" />}

      <p className="scan-status__meta">
        {status.indexed} indexed
        {unreadable > 0 && ` · ${unreadable} can’t be read`}
        {working && status.eta_s > 0 && ` · ~${formatDuration(status.eta_s)}`}
      </p>
      {completed && <p className="scan-status__meta">New and changed files are picked up automatically.</p>}

      {(working || summarizing || stoppedByUser) && (
        <Button variant="outline" size="sm" className="w-full" onClick={toggle} disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : stoppedByUser ? <Play /> : <Square />}
          {stoppedByUser ? "Resume scanning" : "Stop scanning"}
        </Button>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
