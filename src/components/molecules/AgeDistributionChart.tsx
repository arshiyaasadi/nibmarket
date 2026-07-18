"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AdminAgeDistributionItem } from "@/types/admin";

const AGE_COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899"];

type ChartRow = AdminAgeDistributionItem & { shortRange: string };

function AgeTooltip({
  active,
  payload,
  statsLabel,
}: {
  active?: boolean;
  payload?: { payload: ChartRow }[];
  statsLabel: (values: { count: number; percent: number }) => string;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="border-border bg-background rounded-lg border px-2.5 py-1.5 text-[11px] shadow-md">
      <p className="text-foreground font-medium">{row.range}</p>
      <p className="text-muted mt-0.5 tabular-nums">
        {statsLabel({ count: row.count, percent: row.percent })}
      </p>
    </div>
  );
}

export function AgeDistributionChart({ data }: { data: AdminAgeDistributionItem[] }) {
  const t = useTranslations("admin.demographics");
  const statsLabel = (values: { count: number; percent: number }) =>
    t("tooltipStats", {
      count: values.count.toLocaleString("fa-IR"),
      percent: values.percent.toLocaleString("fa-IR"),
    });
  const chartData = useMemo<ChartRow[]>(
    () =>
      data.map((item) => ({
        ...item,
        shortRange: item.range.replace(" سال", ""),
      })),
    [data],
  );

  return (
    <div className="h-44 w-full" dir="ltr">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
          <XAxis
            dataKey="shortRange"
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground, 0 0% 45%))" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground, 0 0% 45%))" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) => value.toLocaleString("fa-IR")}
          />
          <Tooltip
            content={<AgeTooltip statsLabel={statsLabel} />}
            cursor={{ fill: "rgba(99, 102, 241, 0.08)" }}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={36}>
            {chartData.map((entry, index) => (
              <Cell key={entry.range} fill={AGE_COLORS[index] ?? AGE_COLORS[0]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
