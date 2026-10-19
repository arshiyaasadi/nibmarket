/**
 * @level organism
 * @spacing internal: gap-mol p-pad-org | external: none
 */
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/atoms/Button";
import { LandingSectionHeader } from "@/components/molecules/landing/LandingSectionHeader";
import {
  CALC_PRESETS,
  avgFromSlider,
  computeShare,
  faNum,
  sliderFromAvg,
} from "@/features/landing-tanvin/landing-calc";
import { cn } from "@/lib/utils";

export type LandingCalcProps = {
  onStartMarketing: () => void;
};

function CalcSlider({
  label,
  valueLabel,
  min,
  max,
  value,
  onChange,
}: {
  label: string;
  valueLabel: string;
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="gap-atom-md flex flex-col">
      <span className="gap-atom-md flex items-center justify-between">
        <span className="text-foreground text-sm font-medium">{label}</span>
        <span className="bg-primary/10 text-primary px-pad-atom-md py-pad-atom-xs rounded-lg text-xs font-bold tabular-nums">
          {valueLabel}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="tanvin-range w-full"
      />
    </label>
  );
}

export function LandingCalc({ onStartMarketing }: LandingCalcProps) {
  const [avg, setAvg] = useState(105);
  const [n1, setN1] = useState(10);
  const [n2, setN2] = useState(0);
  const [n3, setN3] = useState(0);
  const [preset, setPreset] = useState(-1);
  const [flash, setFlash] = useState(false);

  const result = useMemo(() => computeShare(avg, n1, n2, n3), [avg, n1, n2, n3]);

  function applyPreset(i: number) {
    const p = CALC_PRESETS[i]!;
    setAvg(p.avg);
    setN1(p.n1);
    setN2(0);
    setN3(0);
    setPreset(i);
    setFlash(true);
    window.setTimeout(() => setFlash(false), 500);
  }

  return (
    <section id="calc" className="bg-background py-pad-org">
      <div className="gap-org px-pad-mol sm:px-pad-mol-md lg:px-org mx-auto flex max-w-6xl flex-col">
        <LandingSectionHeader
          eyebrow="ماشین‌حساب"
          title="محاسبه سهم بازاریاب"
          lead="با انتخاب یک نمونه یا وارد کردن عددها، سهم ماهانه و روزانه بازاریاب محاسبه می‌شود. مبنای محاسبه، ارزش فعلی سکه تنوین (حدود ۵۲۳ تومان) است."
        />

        <div className="gap-atom-md grid grid-cols-1 sm:grid-cols-3 sm:items-stretch">
          {CALC_PRESETS.map((p, i) => (
            <button
              key={p.avgLabel}
              type="button"
              aria-pressed={preset === i}
              onClick={() => applyPreset(i)}
              className={cn(
                "px-pad-mol py-pad-mol flex h-full min-h-[4.5rem] flex-col justify-center rounded-xl border text-start text-xs leading-relaxed transition",
                preset === i
                  ? "border-primary bg-primary/10 text-foreground shadow-primary/10 shadow-sm"
                  : "border-border bg-surface text-muted hover:border-primary/30 hover:bg-surface-2",
              )}
            >
              معرفی {faNum(p.n1)} سرمایه‌گذار مستقیم با میانگین {p.avgLabel}
            </button>
          ))}
        </div>

        <div className="gap-mol grid items-stretch lg:grid-cols-2">
          <div className="border-border bg-surface gap-mol p-pad-mol-md flex flex-col rounded-2xl border">
            <CalcSlider
              label="میانگین سرمایه هر سرمایه‌گذار (میلیون تومان)"
              valueLabel={faNum(avg)}
              min={0}
              max={1000}
              value={sliderFromAvg(avg)}
              onChange={(v) => {
                setAvg(avgFromSlider(v));
                setPreset(-1);
              }}
            />
            {(
              [
                ["سطح یک: معرفی‌های مستقیم", n1, setN1, 100],
                ["سطح دو: معرفی‌های سطح یک", n2, setN2, 200],
                ["سطح سه: معرفی‌های سطح دو", n3, setN3, 500],
              ] as const
            ).map(([label, val, setVal, max]) => (
              <CalcSlider
                key={label}
                label={label}
                valueLabel={faNum(val)}
                min={0}
                max={max}
                value={val}
                onChange={(v) => {
                  setVal(v);
                  setPreset(-1);
                }}
              />
            ))}
          </div>

          <div className="bg-primary p-pad-mol-md relative flex flex-col overflow-hidden rounded-2xl text-white">
            <div
              aria-hidden
              className="pointer-events-none absolute -end-10 -top-10 size-40 rounded-full bg-white/10 blur-2xl"
            />
            <div className="gap-mol relative flex flex-1 flex-col">
              <div>
                <span className="text-xs font-medium text-white/70">سهم ماهانه تقریبی</span>
                <p
                  className={cn(
                    "mt-atom text-3xl font-black tabular-nums transition duration-300 sm:text-4xl",
                    flash && "scale-[1.03]",
                  )}
                >
                  {faNum(result.monthlyToman)}
                  <span className="ms-atom text-base font-medium text-white/80">تومان</span>
                </p>
              </div>

              <div className="gap-atom-md grid grid-cols-2">
                <div className="px-pad-mol py-pad-atom-md rounded-xl bg-white/10 backdrop-blur-sm">
                  <span className="text-[11px] text-white/70">سکه تنوین در ماه</span>
                  <p className="mt-atom text-lg font-black tabular-nums">
                    {faNum(result.monthlyCoins)}
                    <span className="ms-atom text-xs font-medium text-white/75">تنوین</span>
                  </p>
                </div>
                <div className="px-pad-mol py-pad-atom-md rounded-xl bg-white/10 backdrop-blur-sm">
                  <span className="text-[11px] text-white/70">واریز روزانه</span>
                  <p className="mt-atom text-lg font-black tabular-nums">
                    {faNum(result.dailyCoins)}
                    <span className="ms-atom text-xs font-medium text-white/75">تنوین</span>
                  </p>
                </div>
              </div>

              <Button
                size="lg"
                onClick={onStartMarketing}
                className="bg-accent text-foreground hover:bg-accent-hover mt-auto border-0"
              >
                شروع بازاریابی
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
