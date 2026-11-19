import { Loader2 } from "lucide-react";
import { Logo } from "./Logo";

/** Centered logo + message, used while connecting or loading. */
export function FullScreenMessage({ title, children, spinner = true }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-6 text-center">
      <Logo size="lg" />
      <div className="flex items-center gap-2 text-muted-foreground">
        {spinner && <Loader2 className="size-4 animate-spin" />}
        <span>{title}</span>
      </div>
      {children}
    </main>
  );
}
