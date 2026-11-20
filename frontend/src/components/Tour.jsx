import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const PAD = 6; // space between the highlighted element and the spotlight edge
const CARD_W = 320;
const GAP = 14;

/**
 * First-time tour over the real Home window: a spotlight moves from step to step (the one authored motion,
 * left-to-right like the highlighter), with a small card beside it. Nothing is blocked: the window stays usable.
 * steps: [{target: CSS selector or null (centred card), title, body, place: "right" | "left" | "below" | "inside"}]
 * Esc skips, Enter / → next, ← back.
 */
export function Tour({ steps, onClose }) {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState(null);
  const nextRef = useRef(null);
  const cardRef = useRef(null);
  const [cardH, setCardH] = useState(210);
  const step = steps[i];
  const last = i === steps.length - 1;

  const measure = useCallback(() => {
    const el = step.target && document.querySelector(step.target);
    if (!el) return setRect(null);
    // Spotlight around the element, kept inside the window.
    const r = el.getBoundingClientRect();
    const top = Math.max(4, r.top - PAD);
    const left = Math.max(4, r.left - PAD);
    const bottom = Math.min(window.innerHeight - 4, r.bottom + PAD);
    const right = Math.min(window.innerWidth - 4, r.right + PAD);
    setRect({ top, left, width: right - left, height: bottom - top });
  }, [step.target]);

  useLayoutEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  useEffect(() => nextRef.current?.focus(), [i]);
  // The card height depends on the step text; measure it so the card never touches the window edge.
  useLayoutEffect(() => {
    if (cardRef.current) setCardH(cardRef.current.offsetHeight);
  }, [i]);

  const next = () => (last ? onClose() : setI(i + 1));
  const back = () => setI(Math.max(0, i - 1));

  function onKeyDown(e) {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") back();
  }

  return (
    <div className="tour" onKeyDown={onKeyDown}>
      {rect ? <div className="tour__spot" style={rect} aria-hidden /> : <div className="tour__scrim" aria-hidden />}
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        ref={cardRef}
        className="tour__card"
        style={cardPosition(rect, step.place, cardH)}
      >
        <p className="text-xs text-muted-foreground tabular-nums">
          {i + 1} of {steps.length}
        </p>
        <h2 id="tour-title" className="mt-1 text-[15px] font-semibold tracking-[-0.01em]">
          {step.title}
        </h2>
        <p id="tour-body" className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {step.body}
        </p>
        <div className="mt-4 flex items-center gap-2">
          <Button variant="ghost" size="sm" className="-ml-2 text-muted-foreground" onClick={onClose}>
            Skip tour
          </Button>
          <span className="flex-1" />
          {i > 0 && (
            <Button variant="ghost" size="sm" onClick={back}>
              Back
            </Button>
          )}
          <Button ref={nextRef} size="sm" onClick={next}>
            {last ? "Done" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/** Puts the card beside the spotlight, kept inside the window. */
function cardPosition(r, place, cardH) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (!r) return { top: (vh - cardH) / 2, left: vw / 2 - CARD_W / 2 };
  let top;
  let left;
  if (place === "left") {
    left = r.left - CARD_W - GAP;
    top = r.top + 64;
  } else if (place === "right") {
    left = r.left + r.width + GAP;
    top = r.top + 64;
  } else if (place === "below") {
    left = r.left + r.width - CARD_W;
    top = r.top + r.height + GAP;
  } else {
    // inside, near the bottom: for a large area such as the file list
    left = r.left + (r.width - CARD_W) / 2;
    top = r.top + r.height - cardH - 24;
  }
  return {
    top: Math.max(12, Math.min(top, vh - cardH - 16)),
    left: Math.max(12, Math.min(left, vw - CARD_W - 12)),
  };
}
