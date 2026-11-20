import { cn } from "@/lib/utils";

/** The shared frame of a setup step: heading, plain-language lead, content, then Back / primary action. */
export function StepFrame({ title, lead, children, back, action }) {
  return (
    <div>
      <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-balance">{title}</h1>
      {lead && <p className="mt-2 max-w-[52ch] text-[15px] leading-relaxed text-muted-foreground">{lead}</p>}
      <div className="mt-8">{children}</div>
      <div className="mt-10 flex items-center justify-between gap-3">
        {back ?? <span />}
        <div className="flex items-center gap-2">{action}</div>
      </div>
    </div>
  );
}

/** One fact in a hairline-ruled list: label left, value right. */
export function FactRow({ label, children, className }) {
  return (
    <div className={cn("flex items-baseline justify-between gap-6 border-b py-3 text-sm", className)}>
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 text-right">{children}</span>
    </div>
  );
}
