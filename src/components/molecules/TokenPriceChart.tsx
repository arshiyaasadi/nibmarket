"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { cn } from "@/lib/utils";
import type { TokenPricePoint } from "@/types/mlm";

type Props = {
  points: TokenPricePoint[];
  isLoading?: boolean;
};

type ChartRow = TokenPricePoint & {
  label: string;
  fullDate: string;
};

const CHART_HEIGHT = 140;

function formatFaShortDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("fa-IR", {
    month: "short",
    day: "numeric",
  });
}

function formatFaFullDate(iso: string) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatRial(price: number) {
  return `${Math.round(price).toLocaleString("fa-IR")} ریال`;
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
    <div className="border-border bg-background rounded-lg border px-2.5 py-1.5 text-[11px] shadow-md">
      <p className="text-muted">{row.fullDate}</p>
      <p className="text-foreground font-semibold tabular-nums" dir="ltr">
        {formatRial(row.price)}
      </p>
    </div>
  );
}

export function TokenPriceChart({ points, isLoading }: Props) {
  const t = useTranslations("wallet");
  const [hovered, setHovered] = useState<ChartRow | null>(null);

  const data = useMemo<ChartRow[]>(() => {
    const last7 = points.slice(-7);
    return last7.map((p) => ({
      ...p,
      label: formatFaShortDate(p.date),
      fullDate: formatFaFullDate(p.date),
    }));
  }, [points]);

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
        <div className="bg-surface-2 h-8 w-28 animate-pulse rounded-lg" />
        <div className="bg-surface-2 h-[8.75rem] animate-pulse rounded-xl" />
        <div className="bg-surface-2 h-3 w-full animate-pulse rounded" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="border-border text-muted flex h-[8.75rem] items-center justify-center rounded-xl border border-dashed text-xs">
        {t("priceChartEmpty")}
      </div>
    );
  }

  const active = hovered ?? data[data.length - 1];
  const strokeColor = stats.isUp ? "#22c55e" : "#ef4444";
  const gradientId = stats.isUp ? "twinPriceUp" : "twinPriceDown";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="text-foreground text-lg font-bold tabular-nums" dir="ltr">
            {formatRial(active.price)}
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
            {stats.changePct.toFixed(1)}%
          </span>
        </div>
        {hovered && <span className="text-muted shrink-0 text-[11px]">{hovered.fullDate}</span>}
      </div>

      <div className="w-full overflow-hidden">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <AreaChart
            data={data}
            margin={{ top: 6, right: 0, left: 0, bottom: 0 }}
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
                <stop offset="0%" stopColor={strokeColor} stopOpacity={0.28} />
                <stop offset="100%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "var(--color-muted, #8b8ba8)" }}
              interval="preserveStartEnd"
              minTickGap={20}
              dy={2}
            />

            <Tooltip content={<ChartTooltip />} cursor={false} />

            <Area
              type="monotone"
              dataKey="price"
              stroke={strokeColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{
                r: 3.5,
                fill: "var(--color-background, #fff)",
                stroke: strokeColor,
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="text-muted flex items-center justify-between gap-1 text-[10px]">
        {data.map((row) => (
          <span key={row.date} className="min-w-0 truncate tabular-nums" title={row.fullDate}>
            {row.fullDate}
          </span>
        ))}
      </div>
    </div>
  );
}
