import { ArrowLeft, ArrowRight, Check, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHardwareScan } from "@/features/system/hooks";
import { formatRam } from "@/lib/format";
import { errorMessage } from "@/lib/errors";
import { FactRow, StepFrame } from "./StepFrame";

/** What this PC means for the user, in plain words (instead of a "tier" grade). */
function capability(hw) {
  const gpu = hw.best_gpu?.usable ? hw.best_gpu : null;
  if (gpu && gpu.vram_mb >= 3500) return "Search and chat will run on your graphics card, so answers come quickly.";
  if (gpu) return "Search and chat will use your graphics card where it helps. Answers take a few seconds.";
  return "Search and chat will run on the processor. Answers take a little longer, but everything works.";
}

export default function HardwareStep({ onNext, onBack }) {
  const hw = useHardwareScan();
  const data = hw.data;
  const gpu = data?.best_gpu?.usable ? data.best_gpu : data?.gpus?.find((g) => g.usable);

  return (
    <StepFrame
      title="Checking your PC"
      lead="Smart Space picks AI models that run well on this computer."
      back={
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft /> Back
        </Button>
      }
      action={
        <>
          {hw.isError && (
            <Button variant="outline" onClick={() => hw.refetch()}>
              <RefreshCw /> Try again
            </Button>
          )}
          {/* Unavailable = plain graphite, never a faded yellow. */}
          <Button onClick={onNext} disabled={!data} variant={data ? "default" : "secondary"} className="disabled:opacity-100 disabled:text-muted-foreground">
            Continue <ArrowRight />
          </Button>
        </>
      }
    >
      {hw.isPending && (
        <p className="flex items-center gap-2 border-y py-6 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-ink-blue" /> Checking processor, memory and graphics card…
        </p>
      )}

      {hw.isError && <p className="border-y py-4 text-sm text-ink-pink">{errorMessage(hw.error)}</p>}

      {data && (
        <>
          <div className="border-t">
            <FactRow label="Processor">{data.cpu_name}</FactRow>
            <FactRow label="Memory">
              <span className="tabular-nums">{formatRam(data.ram_total_mb)}</span>
            </FactRow>
            <FactRow label="Graphics card">
              {gpu ? (
                <>
                  {gpu.name} <span className="text-muted-foreground tabular-nums">· {formatRam(gpu.vram_mb)}</span>
                </>
              ) : (
                <span className="text-muted-foreground">None the AI can use</span>
              )}
            </FactRow>
          </div>
          <p className="mt-5 flex items-start gap-2 text-[15px] leading-relaxed">
            <Check className="mt-1 size-4 shrink-0 text-ink-green" aria-hidden />
            {capability(data)}
          </p>
        </>
      )}
    </StepFrame>
  );
}
