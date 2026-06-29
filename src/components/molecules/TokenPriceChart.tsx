"use client";

import { useMemo, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { cn } from "@/lib/utils";
import type { TokenPricePoint } from "@/types/mlm";

type Props = {
  points: TokenPricePoint[];
  isLoading?: boolean;
};

type ChartRow = TokenPricePoint & {
  label: string;
};

const CHART_HEIGHT = 148;

function formatFaDate(iso: string) {
  return new Date(iso + "T12:00:00").toLocaleDateString("fa-IR", { month: "short", day: "numeric" });
}

function formatPrice(price: number) {
  return `$${price.toFixed(4)}`;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: ChartRow }[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-[11px] shadow-md">
      <p className="text-muted">{row.label}</p>
      <p className="font-semibold text-foreground tabular-nums" dir="ltr">
        {formatPrice(row.price)}
      </p>
    </div>
  );
}

export function TokenPriceChart({ points, isLoading }: Props) {
  const [hovered, setHovered] = useState<ChartRow | null>(null);

  const data = useMemo<ChartRow[]>(
    () => points.map((p) => ({ ...p, label: formatFaDate(p.date) })),
    [points],
  );

  const stats = useMemo(() => {
    if (data.length < 2) return null;
    const prices = data.map((d) => d.price);
    const first = prices[0];
    const last = prices[prices.length - 1];
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const changePct = ((last - first) / first) * 100;
    return { first, last, min, max, changePct, isUp: last >= first };
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="h-8 w-28 rounded-lg bg-surface-2 animate-pulse" />
        <div className="h-[9.25rem] rounded-xl bg-surface-2 animate-pulse" />
        <div className="flex justify-between">
          <div className="h-3 w-12 rounded bg-surface-2 animate-pulse" />
          <div className="h-3 w-12 rounded bg-surface-2 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex h-[9.25rem] items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted">
        داده‌ای برای نمایش وجود ندارد
      </div>
    );
  }

  const active = hovered ?? data[data.length - 1];
  const strokeColor = stats.isUp ? "#22c55e" : "#ef4444";
  const gradientId = stats.isUp ? "twinPriceUp" : "twinPriceDown";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-bold text-foreground tabular-nums" dir="ltr">
            {formatPrice(active.price)}
          </span>
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-semibold tabular-nums",
              stats.isUp ? "bg-success/10 text-success" : "bg-error/10 text-error",
            )}
            dir="ltr"
          >
            {stats.isUp ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {stats.isUp ? "+" : ""}
            {stats.changePct.toFixed(2)}%
          </span>
        </div>
        {hovered && (
          <span className="shrink-0 text-[11px] text-muted">{hovered.label}</span>
        )}
      </div>

      <div className="w-full overflow-hidden rounded-xl bg-background/60">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <AreaChart
            data={data}
            margin={{ top: 8, right: 4, left: 4, bottom: 0 }}
            onMouseMove={(state) => {
              const idx = state?.activeIndex;
              if (typeof idx === "number" && data[idx]) {
                setHovered(data[idx]);
              } else {
                setHovered(null);
              }
            }}
            onMouseLeave={() => setHovered(null)}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="var(--color-border, #dddce8)"
              strokeOpacity={0.45}
              vertical={false}
              strokeDasharray="4 4"
            />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--color-muted, #8b8ba8)" }}
              interval="preserveStartEnd"
              minTickGap={28}
              dy={4}
            />

            <YAxis
              domain={["auto", "auto"]}
              axisLine={false}
              tickLine={false}
              width={44}
              tick={{ fontSize: 10, fill: "var(--color-muted, #8b8ba8)" }}
              tickFormatter={(v: number) => v.toFixed(3)}
              orientation="left"
            />

            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: strokeColor, strokeWidth: 1, strokeDasharray: "4 4" }}
            />

            <Area
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 4,
                fill: "var(--color-background, #fff)",
                stroke: strokeColor,
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted">
        <span>{data[0].label}</span>
        <span dir="ltr" className="tabular-nums opacity-70">
          {formatPrice(stats.min)} – {formatPrice(stats.max)}
        </span>
        <span>{data[data.length - 1].label}</span>
      </div>
    </div>
  );
}
