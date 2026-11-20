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
          This is taking longer than usual. If nothing happens within a minute, quit Smart Space from the tray icon and
          open it again.
          {import.meta.env.DEV && (
            <span className="mt-2 block text-xs">
              Developers: look for a [smart-space] error in the npm run tauri dev terminal.
            </span>
          )}
        </p>
      )}
    </FullScreenMessage>
  );
}
