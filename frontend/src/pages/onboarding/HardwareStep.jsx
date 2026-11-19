import { ArrowLeft, ArrowRight, Cpu, Loader2, MemoryStick, MonitorSmartphone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useHardwareScan } from "@/features/system/hooks";
import { formatRam } from "@/lib/format";
import { errorMessage } from "@/lib/errors";

export default function HardwareStep({ onNext, onBack }) {
  const hw = useHardwareScan();
  const gpu = hw.data?.gpus?.find((g) => g.usable);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Checking your PC</CardTitle>
        <CardDescription>Smart Space picks AI models that run well on this computer.</CardDescription>
      </CardHeader>

      <CardContent>
        {hw.isPending && (
          <div className="flex items-center gap-2 py-8 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Scanning processor, memory and graphics card…
          </div>
        )}

        {hw.isError && <p className="py-4 text-sm text-destructive">{errorMessage(hw.error)}</p>}

        {hw.data && (
          <div className="space-y-3">
            <Row Icon={Cpu} label="Processor" value={hw.data.cpu_name} />
            <Row Icon={MemoryStick} label="Memory" value={`${formatRam(hw.data.ram_total_mb)} RAM`} />
            <Row
              Icon={MonitorSmartphone}
              label="Graphics card"
              value={gpu ? `${gpu.name} · ${formatRam(gpu.vram_mb)}` : "No usable graphics card, the AI runs on the processor"}
            />
            <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
              <span className="text-sm text-muted-foreground">Performance tier</span>
              <Badge>Tier {hw.data.tier} of 4</Badge>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft /> Back
        </Button>
        <div className="flex gap-2">
          {hw.isError && (
            <Button variant="outline" onClick={() => hw.refetch()}>
              <RefreshCw /> Try again
            </Button>
          )}
          <Button onClick={onNext} disabled={!hw.data}>
            Continue <ArrowRight />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

function Row({ Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
      <Icon className="size-5 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
