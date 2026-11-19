import { FolderSearch } from "lucide-react";
import { cn } from "@/lib/utils";

/** Smart Space mark (a folder on a highlighter swipe) + name. size: "sm" for the app, "lg" for the welcome screen. */
export function Logo({ size = "sm", className }) {
  const big = size === "lg";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex -rotate-3 items-center justify-center rounded-[0.35rem_0.7rem_0.4rem_0.6rem] bg-ink-yellow text-[var(--ink-on)]",
          big ? "size-12" : "size-7",
        )}
      >
        <FolderSearch className={big ? "size-6" : "size-4"} strokeWidth={2.25} />
      </div>
      <span className={cn("font-semibold tracking-[-0.02em]", big ? "text-3xl" : "text-[15px]")}>Smart Space</span>
    </div>
  );
}
