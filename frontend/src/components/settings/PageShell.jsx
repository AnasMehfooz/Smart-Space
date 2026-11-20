import { Link, NavLink } from "react-router";
import { ArrowLeft, Settings2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

/**
 * Settings and Privacy: the same margin index as Home (logo, then navigation instead of the folder tree)
 * and one readable column of hairline-ruled rows. The open page gets the yellow mark, like the open folder.
 * back: {to, label}, e.g. {to: "/", label: "Back to files"}.
 */
export function PageShell({ title, lead, back, showSettings = true, children }) {
  const pages = [
    showSettings && { to: "/settings", label: "Settings", Icon: Settings2 },
    { to: "/privacy", label: "Privacy", Icon: ShieldCheck },
  ].filter(Boolean);

  return (
    <div className="flex h-screen bg-background">
      <aside className="flex w-[clamp(13.5rem,19.5vw,17.5rem)] shrink-0 flex-col border-r">
        <div className="px-5 pt-5 pb-6">
          <Logo />
        </div>
        <nav aria-label="Pages" className="flex flex-col gap-0.5 px-3">
          <Link
            to={back.to}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> {back.label}
          </Link>
          <div className="my-3 h-px bg-border" />
          {pages.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              state={back.to === "/onboarding" ? { from: "/onboarding" } : undefined}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted",
                  isActive ? "font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  {isActive ? <span className="mark">{label}</span> : label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[46rem] px-8 pt-10 pb-16">
          <h1 className="text-[22px] font-semibold tracking-[-0.02em]">{title}</h1>
          {lead && <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">{lead}</p>}
          {children}
        </div>
      </main>
    </div>
  );
}

/** A titled group of rows. */
export function Section({ title, description, children, id }) {
  return (
    <section aria-labelledby={id} className="mt-10">
      <h2 id={id} className="text-[15px] font-semibold tracking-[-0.01em]">
        {title}
      </h2>
      {description && <p className="mt-1 max-w-[60ch] text-sm text-muted-foreground">{description}</p>}
      <div className="mt-3 border-t">{children}</div>
    </section>
  );
}

/** One setting or fact: title and description on the left, its value or controls on the right. */
export function Row({ title, description, Icon, children, className }) {
  return (
    <div className={cn("flex items-center gap-6 border-b py-3.5", className)}>
      {Icon && <Icon className="size-4 shrink-0 self-start mt-0.5 text-muted-foreground" aria-hidden />}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{title}</div>
        {description && <div className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{description}</div>}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
    </div>
  );
}
