import { useState } from "react";
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
  { label: "AI model", Component: ModelStep },
  { label: "Folder", Component: FolderStep },
];

/** Welcome → hardware check → recommended model + download → pick folder → Home. */
export default function Onboarding() {
  const [step, setStep] = useState(0);
  const { Component } = STEPS[step];
  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <main className="flex min-h-screen flex-col bg-muted/40">
      {step > 0 && (
        <header className="flex items-center justify-between px-8 py-5">
          <Logo />
          <StepIndicator current={step} />
          <div className="w-32" />
        </header>
      )}
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-xl">
          <Component onNext={next} onBack={back} />
        </div>
      </div>
    </main>
  );
}

function StepIndicator({ current }) {
  return (
    <ol className="flex items-center gap-2 text-sm">
      {STEPS.slice(1).map((s, i) => {
        const index = i + 1;
        const done = index < current;
        const active = index === current;
        return (
          <li key={s.label} className="flex items-center gap-2">
            {i > 0 && <span className="h-px w-8 bg-border" />}
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full border text-xs",
                done && "border-primary bg-primary text-primary-foreground",
                active && "border-primary text-foreground",
                !done && !active && "text-muted-foreground",
              )}
            >
              {done ? <Check className="size-3.5" /> : index}
            </span>
            <span className={cn(active ? "font-medium" : "text-muted-foreground")}>{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
