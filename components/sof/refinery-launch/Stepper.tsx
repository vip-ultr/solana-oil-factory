"use client";

import { cn } from "@/lib/cn";

const STEPS = [
  { id: 1, label: "Token", state: "done" as const },
  { id: 2, label: "Mechanics", state: "done" as const },
  { id: 3, label: "Funding", state: "active" as const },
  { id: 4, label: "Review & sign", state: "pending" as const },
];

/**
 * Launch wizard stepper. The wizard is a single-page stacked form
 * — clicking a step scrolls to the corresponding card. State pre-set
 * to mid-flow (steps 1-2 done, step 3 active) per the locked design;
 * production version will derive state from form validation.
 */
export function Stepper() {
  function scrollToStep(stepId: number) {
    const el = document.querySelector(`[data-step="${stepId}"]`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="sof-lw-stepper" role="tablist" aria-label="Launch wizard steps">
      {STEPS.map((s, i) => (
        <>
          <button
            key={`step-${s.id}`}
            type="button"
            role="tab"
            aria-selected={s.state === "active"}
            className={cn(
              "sof-lw-step",
              s.state === "done" && "done",
              s.state === "active" && "active",
            )}
            onClick={() => scrollToStep(s.id)}
          >
            <span className="num">{s.id}</span>
            <span className="lab">{s.label}</span>
          </button>
          {i < STEPS.length - 1 && (
            <span
              key={`conn-${s.id}`}
              className={cn(
                "sof-lw-conn",
                STEPS[i].state === "done" && STEPS[i + 1].state !== "pending" && "done",
              )}
            />
          )}
        </>
      ))}
    </div>
  );
}
