import { Fragment, useState } from "react";
import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { useWorkspace } from "@/features/workspace/hooks";
import { hasActiveEmbedding, useCatalog } from "@/features/models/hooks";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import WelcomeStep from "./WelcomeStep";
import HardwareStep from "./HardwareStep";
import ModelStep from "./ModelStep";
import FolderStep from "./FolderStep";

const STEPS = [
  { label: "Welcome", Component: WelcomeStep },
  { label: "Your PC", Component: HardwareStep },
  { label: "AI models", Component: ModelStep },
  { label: "Folder", Component: FolderStep },
];

/** Welcome → hardware check → recommended models + download → pick a folder → Home. Same ground and rules as Home. */
export default function Onboarding() {
  const [step, setStep] = useState(0);
  const { Component } = STEPS[step];
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));
  // Run again from Settings: Smart Space is already set up, so offer the way back.
  // Both hooks run on every render (a short-circuit here would skip one and crash React after a reset).
  const workspace = useWorkspace().data;
  const catalog = useCatalog().data;
  const ready = !!workspace && hasActiveEmbedding(catalog);

  return (
    <main className="relative flex min-h-screen flex-col bg-background">
      {ready && (
        <Link
          to="/"
          className="absolute top-4 right-6 z-10 flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to files
        </Link>
      )}
      {step > 0 && (
        <header className="grid grid-cols-[1fr_auto_1fr] items-center border-b px-6 py-4">
          <Logo />
          <StepIndicator current={step} />
          <span />
        </header>
      )}
      <div className="flex flex-1 items-center justify-center px-6 py-10 short:py-4">
        <div className="w-full max-w-[34rem]">
          <Component onNext={next} onBack={back} />
        </div>
      </div>
    </main>
  );
}

/** Done steps: green check (done). Current step: the yellow mark (selected). Later steps: muted. */
function StepIndicator({ current }) {
  return (
    <ol className="flex items-center gap-3 text-sm" aria-label="Setup steps">
      {STEPS.slice(1).map((s, i) => {
        const index = i + 1;
        const done = index < current;
        const active = index === current;
        return (
          <Fragment key={s.label}>
            {i > 0 && <li aria-hidden className="h-px w-6 bg-border" />}
            <li className="flex items-center gap-1.5" aria-current={active ? "step" : undefined}>
              {done ? (
                <Check className="size-4 text-ink-green" aria-label="Done:" />
              ) : (
                <span className={cn("text-xs tabular-nums", !active && "text-muted-foreground")}>{index}</span>
              )}
              <span className={cn(done && "text-foreground", !done && !active && "text-muted-foreground")}>
                {active ? <span className="mark font-medium">{s.label}</span> : s.label}
              </span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
