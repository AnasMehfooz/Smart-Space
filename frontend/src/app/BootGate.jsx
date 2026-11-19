import { useHealth } from "@/features/system/hooks";
import { FullScreenMessage } from "@/components/FullScreenMessage";

/** Shows "Connecting…" until the backend answers /health with ready: true, then renders the app. */
export function BootGate({ children }) {
  const health = useHealth();
  if (health.data?.ready) return children;

  const slow = health.errorUpdateCount >= 30; // about 30 s without an answer (the first start takes ~10 s)
  return (
    <FullScreenMessage title={health.data ? "Smart Space is starting…" : "Starting Smart Space…"}>
      {slow && (
        <p className="max-w-md text-sm text-muted-foreground">
          This is taking longer than usual. The app starts its backend by itself; check the{" "}
          <code className="rounded bg-muted px-1 py-0.5">npm run tauri dev</code> terminal for a{" "}
          <code className="rounded bg-muted px-1 py-0.5">[smart-space]</code> error. This screen continues by itself
          once the backend answers.
        </p>
      )}
    </FullScreenMessage>
  );
}
