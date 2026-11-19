import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Download, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useCatalog, useDownloadProgress, useRecommendations } from "@/features/models/hooks";
import { downloadModel } from "@/features/models/api";
import { formatBytes, formatDuration } from "@/lib/format";
import { errorMessage } from "@/lib/errors";

/** What each part of the recommended set is for, in plain words. */
const ROLE_TEXT = { embedding: "Search model", llm: "AI model for summaries and chat" };

/**
 * One recommendation for this PC = the search model + the language model, downloaded with one button.
 * (OCR for photos and scans is bundled with the app.)
 */
export default function ModelStep({ onNext, onBack }) {
  const rec = useRecommendations();
  const catalog = useCatalog();
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

  const total = models.reduce((sum, m) => sum + (m.size_bytes ?? 0), 0);
  const done = models.reduce((sum, m) => {
    if (installed(m)) return sum + (m.size_bytes ?? 0);
    return sum + (live[m.id]?.bytes_done ?? m.download?.bytes_done ?? 0);
  }, 0);
  const active = models.map((m) => live[m.id]).find((p) => p?.state === "progress");
  const percent = total ? Math.min(100, (done / total) * 100) : 0;

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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Your AI model</CardTitle>
        <CardDescription>Recommended for this PC. It runs completely offline once downloaded.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Finding the best model for your PC…
          </div>
        ) : (
          <>
            <div className="rounded-xl border p-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium">
                  <Sparkles className="size-4" /> Recommended set
                </div>
                <Badge variant={allInstalled ? "default" : "secondary"}>
                  {allInstalled ? "Installed" : formatBytes(total)}
                </Badge>
              </div>
              <ul className="space-y-2">
                {models.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-4 text-sm">
                    <div className="min-w-0">
                      <p className="font-medium">{ROLE_TEXT[m.role] ?? m.role}</p>
                      <p className="truncate text-muted-foreground">{m.display_name}</p>
                    </div>
                    <span className="flex shrink-0 items-center gap-1 text-muted-foreground">
                      {installed(m) ? <CheckCircle2 className="size-4 text-primary" /> : formatBytes(m.size_bytes)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {(downloading || (done > 0 && !allInstalled)) && (
              <div className="space-y-2">
                <Progress value={percent} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {formatBytes(done)} of {formatBytes(total)}
                  </span>
                  {active && (
                    <span>
                      {formatBytes(active.speed_bps)}/s · {formatDuration(active.eta_s)} left
                    </span>
                  )}
                </div>
              </div>
            )}

            {failed.length > 0 && (
              <p className="text-sm text-destructive">
                The download stopped{live[failed[0].id]?.message ? `: ${live[failed[0].id].message}` : ""}. Check the
                internet connection and try again; it continues where it stopped.
              </p>
            )}
            {startError && <p className="text-sm text-destructive">{errorMessage(startError)}</p>}
          </>
        )}
      </CardContent>

      <CardFooter className="justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft /> Back
        </Button>
        {allInstalled ? (
          <Button onClick={onNext}>
            Continue <ArrowRight />
          </Button>
        ) : (
          <Button onClick={startDownload} disabled={loading || starting || (downloading && failed.length === 0)}>
            {downloading && failed.length === 0 ? <Loader2 className="animate-spin" /> : <Download />}
            {downloading && failed.length === 0 ? "Downloading…" : failed.length ? "Try again" : "Download"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
