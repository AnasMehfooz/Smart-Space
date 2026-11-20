import { useState } from "react";
import { ArrowLeft, ArrowRight, Check, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { plainModelName, useCatalog, useDownloadProgress, useRecommendations } from "@/features/models/hooks";
import { cancelDownload, downloadModel } from "@/features/models/api";
import { useHardwareScan } from "@/features/system/hooks";
import { formatBytes, formatDuration } from "@/lib/format";
import { errorMessage } from "@/lib/errors";
import { StepFrame } from "./StepFrame";

/** What each part of the recommended set does, in plain words. */
const ROLE = {
  embedding: { title: "Search", text: "Finds files by what they mean" },
  llm: { title: "Answers and summaries", text: "Writes summaries and answers questions" },
};

/**
 * One recommendation for this PC = the search model + the language model, downloaded with one button.
 * Everything the user needs to decide is visible before the click: total size, free space, that it resumes.
 * (OCR for photos and scans is bundled with the app.)
 */
export default function ModelStep({ onNext, onBack }) {
  const rec = useRecommendations();
  const catalog = useCatalog();
  const hw = useHardwareScan().data;
  const live = useDownloadProgress(true);
  const [startError, setStartError] = useState(null);
  const [starting, setStarting] = useState(false);

  const ids = rec.data ? [rec.data.recommended.embedding, rec.data.recommended.llm].filter(Boolean) : [];
  const models = ids.map((id) => catalog.data?.find((m) => m.id === id)).filter(Boolean);
  const loading = rec.isPending || catalog.isPending || models.length < ids.length;

  const installed = (m) => m.status === "installed";
  const failed = models.filter((m) => m.status === "failed" || live[m.id]?.state === "failed");
  const allInstalled = models.length > 0 && models.every(installed);
  const downloading =
    !allInstalled && models.some((m) => m.status === "downloading" || ["queued", "progress"].includes(live[m.id]?.state));
  const busy = downloading && failed.length === 0;

  const total = models.reduce((sum, m) => sum + (m.size_bytes ?? 0), 0);
  const remaining = models.filter((m) => !installed(m)).reduce((sum, m) => sum + (m.size_bytes ?? 0), 0);
  const done = models.reduce((sum, m) => {
    if (installed(m)) return sum + (m.size_bytes ?? 0);
    return sum + (live[m.id]?.bytes_done ?? m.download?.bytes_done ?? 0);
  }, 0);
  const active = models.map((m) => live[m.id]).find((p) => p?.state === "progress");
  const percent = total ? Math.min(100, (done / total) * 100) : 0;
  const free = hw?.disk_free_mb != null ? hw.disk_free_mb * 2 ** 20 : null;
  const tooBig = free != null && remaining > free;
  // The backend found identical copies already on this PC (another Smart Space, Hugging Face cache, Downloads…):
  // they are checked and installed without the internet.
  const missing = models.filter((m) => !installed(m));
  const onThisPc = missing.length > 0 && missing.every((m) => m.local_copy);

  async function startDownload() {
    setStartError(null);
    setStarting(true);
    try {
      for (const m of models) if (!installed(m)) await downloadModel(m.id); // the backend queues them
      await catalog.refetch();
    } catch (e) {
      setStartError(e);
    } finally {
      setStarting(false);
    }
  }

  async function cancel() {
    for (const m of models) if (!installed(m)) await cancelDownload(m.id).catch(() => {});
    await catalog.refetch();
  }

  let action;
  if (allInstalled) {
    action = (
      <Button onClick={onNext}>
        Continue <ArrowRight />
      </Button>
    );
  } else if (busy) {
    action = (
      <>
        <Button variant="ghost" onClick={cancel}>
          Cancel
        </Button>
        <Button variant="secondary" disabled className="disabled:opacity-100 disabled:text-muted-foreground">
          <Loader2 className="animate-spin text-ink-blue" /> Downloading…
        </Button>
      </>
    );
  } else {
    action = (
      <Button onClick={startDownload} disabled={loading || starting || tooBig}>
        {starting ? <Loader2 className="animate-spin" /> : <Download />}
        {failed.length ? "Try again" : onThisPc ? "Install from this PC" : `Download ${formatBytes(remaining)}`}
      </Button>
    );
  }

  return (
    <StepFrame
      title={allInstalled ? "The AI models are ready" : "Download the AI models"}
      lead="Picked for this PC. Downloaded once from Hugging Face; after that, everything works offline."
      back={
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft /> Back
        </Button>
      }
      action={action}
    >
      {loading ? (
        <p className="flex items-center gap-2 border-y py-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-ink-blue" /> Finding the best models for your PC…
        </p>
      ) : (
        <>
          <ul className="border-t">
            {models.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-6 border-b py-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{ROLE[m.role]?.title ?? m.role}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {ROLE[m.role]?.text} · {plainModelName(m.display_name)}
                  </p>
                </div>
                {installed(m) ? (
                  <span className="flex shrink-0 items-center gap-1.5 text-sm">
                    <Check className="size-4 text-ink-green" aria-hidden /> Installed
                  </span>
                ) : (
                  <span className="shrink-0 text-sm text-muted-foreground tabular-nums">{formatBytes(m.size_bytes)}</span>
                )}
              </li>
            ))}
          </ul>

          {!allInstalled && !busy && done === 0 && onThisPc && (
            <p className="mt-4 text-sm text-muted-foreground">
              Smart Space found these models on this PC already. It checks them and installs them, no download needed.
            </p>
          )}
          {!allInstalled && !busy && done === 0 && !onThisPc && (
            <p className="mt-4 text-sm text-muted-foreground tabular-nums">
              {formatBytes(remaining)} in total
              {free != null && ` · ${formatBytes(free)} free on this PC`} · resumes by itself if the connection drops.
            </p>
          )}
          {tooBig && (
            <p className="mt-2 text-sm text-ink-pink">
              Not enough free space. Free up {formatBytes(remaining - free)} and try again.
            </p>
          )}

          {(busy || (done > 0 && !allInstalled)) && (
            <div className="mt-5 space-y-2">
              <Progress value={percent} className="ink-progress" />
              <div className="flex justify-between text-sm text-muted-foreground tabular-nums">
                <span>
                  {formatBytes(done)} of {formatBytes(total)}
                </span>
                {active && (
                  <span>
                    {formatBytes(active.speed_bps)}/s · {formatDuration(active.eta_s)} left
                  </span>
                )}
              </div>
              {busy && <p className="text-sm text-muted-foreground">You can go back meanwhile; the download continues.</p>}
            </div>
          )}

          {failed.length > 0 && (
            <p className="mt-4 text-sm text-ink-pink">
              The download stopped{live[failed[0].id]?.message ? `: ${live[failed[0].id].message}` : ""}. Check the
              internet connection and try again; it continues where it stopped.
            </p>
          )}
          {startError && <p className="mt-4 text-sm text-ink-pink">{errorMessage(startError)}</p>}
        </>
      )}
    </StepFrame>
  );
}
