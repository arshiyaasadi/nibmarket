"use client";

import { cn } from "@/lib/utils";

export function AdminOverviewStatCard({
  label,
  value,
  unit,
  hint,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  icon: React.ElementType;
  iconClassName: string;
}) {
  return (
    <div className="border-border bg-surface rounded-2xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-muted text-xs">{label}</p>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-1">
            <p className="text-foreground text-lg font-semibold tabular-nums">{value}</p>
            {unit && <span className="text-muted text-xs">{unit}</span>}
          </div>
          {hint && <p className="text-muted mt-1 text-[11px] leading-5">{hint}</p>}
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl",
            iconClassName,
          )}
        >
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}
