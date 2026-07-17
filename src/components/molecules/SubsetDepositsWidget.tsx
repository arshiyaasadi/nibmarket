"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Layers,
  ScrollText,
  TrendingUp,
  Users,
} from "lucide-react";
import { ROUTES } from "@/config/routes";
import { useSubsetDeposits } from "@/features/subset-deposits/queries";
import { cn } from "@/lib/utils";

function pn(n: number) {
  return n.toLocaleString("fa-IR");
}

export function SubsetDepositsWidget({
  showDetailLink = true,
  showRulesLink = false,
  expanded = false,
}: {
  showDetailLink?: boolean;
  showRulesLink?: boolean;
  expanded?: boolean;
}) {
  const t = useTranslations("subsetDeposits");
  const { data, isLoading } = useSubsetDeposits();

  return (
    <div
      className={cn(
        "border-border bg-surface flex h-full flex-col gap-4 rounded-2xl border p-5",
        expanded && "sm:p-6",
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-foreground text-sm font-semibold">{t("widgetTitle")}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-primary/10 text-primary flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold">
            <Users size={10} />
            {t("activeSubsets", { count: isLoading ? "—" : pn(data?.activeSubsets ?? 0) })}
          </div>
          {showRulesLink && (
            <Link
              href={ROUTES.CAPITAL}
              className="border-border bg-background text-primary hover:border-primary/30 hover:bg-primary/5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors"
            >
              <ScrollText size={11} />
              {t("rulesLink")}
            </Link>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      ) : (
        <div className={cn("grid gap-3", expanded ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2")}>
          <StatCard
            icon={<CalendarDays size={12} />}
            label={t("today")}
            value={pn(data?.today ?? 0)}
            unit={t("tokenUnit")}
          />
          <StatCard
            icon={<TrendingUp size={12} />}
            label={t("thisMonth")}
            value={pn(data?.thisMonth ?? 0)}
            unit={t("tokenUnit")}
          />
          <StatCard
            icon={<Layers size={12} />}
            label={t("total")}
            value={pn(data?.total ?? 0)}
            unit={t("tokenUnit")}
          />
          <StatCard
            icon={<Clock3 size={12} />}
            label={t("pendingSettlement")}
            value={pn(data?.pendingAmount ?? 0)}
            unit={t("tokenUnit")}
            warning
          />
        </div>
      )}

      {showDetailLink && (
        <Link
          href={ROUTES.SUBSET_DEPOSITS}
          className="border-border bg-background text-primary hover:border-primary/30 hover:bg-primary/5 mt-auto flex items-center justify-center gap-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors"
        >
          {t("viewTransactions")}
          <ArrowLeft size={12} />
        </Link>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
  warning,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  warning?: boolean;
}) {
  return (
    <div className="border-border bg-background flex flex-col gap-1.5 rounded-xl border p-3.5">
      <div className="text-muted flex items-center gap-1.5 text-[11px]">
        {icon}
        {label}
      </div>
      <p
        className={cn(
          "text-lg font-extrabold tabular-nums",
          warning ? "text-warning" : "text-foreground",
        )}
      >
        {value}
      </p>
      <span className="text-muted text-[11px]">{unit}</span>
    </div>
  );
}
