/**
 * @level molecule
 * @spacing internal: gap-atom-md p-pad-mol | external: none
 */
"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export type LandingMissionStep = {
  title: string;
  reward: number;
  done?: boolean;
};

export type LandingMissionCardProps = {
  title: string;
  subtitle: string;
  totalLabel: string;
  steps: LandingMissionStep[];
};

function pn(n: number) {
  return n.toLocaleString("fa-IR");
}

export function LandingMissionCard({
  title,
  subtitle,
  totalLabel,
  steps,
}: LandingMissionCardProps) {
  const [doneMap, setDoneMap] = useState(() => steps.map((s) => !!s.done));

  return (
    <article className="border-border bg-background gap-mol p-pad-mol flex flex-col rounded-2xl border">
      <div className="gap-atom-md flex flex-wrap items-start justify-between">
        <div>
          <h3 className="text-foreground text-sm font-bold">{title}</h3>
          <p className="text-muted mt-atom text-xs">{subtitle}</p>
        </div>
        <span className="text-primary text-sm font-black">{totalLabel}</span>
      </div>
      <ul className="gap-atom-md flex flex-col">
        {steps.map((step, i) => {
          const on = doneMap[i] ?? false;
          return (
            <li key={step.title}>
              <button
                type="button"
                onClick={() => setDoneMap((prev) => prev.map((v, idx) => (idx === i ? !v : v)))}
                className={cn(
                  "border-border gap-atom-md px-pad-atom-md py-pad-atom-md flex w-full items-center rounded-xl border text-start transition",
                  on ? "border-success/30 bg-success/5" : "bg-surface hover:bg-surface-2",
                )}
                aria-pressed={on}
              >
                {on ? (
                  <CheckCircle2 className="text-success size-5 shrink-0" />
                ) : (
                  <Circle className="text-muted size-5 shrink-0" />
                )}
                <span className="text-foreground min-w-0 flex-1 text-xs font-semibold sm:text-sm">
                  {step.title}
                </span>
                <span className="text-primary shrink-0 text-xs font-bold tabular-nums">
                  {pn(step.reward)} تنوین
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </article>
  );
}
