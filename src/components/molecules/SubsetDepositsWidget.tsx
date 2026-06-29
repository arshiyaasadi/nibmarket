"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, CalendarDays, TrendingUp, Users } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { useSubsetDeposits } from "@/features/subset-deposits/queries";

function pn(n: number) {
  return n.toLocaleString("fa-IR");
}

export function SubsetDepositsWidget({
  showDetailLink = true,
}: {
  showDetailLink?: boolean;
}) {
  const t = useTranslations("subsetDeposits");
  const { data, isLoading } = useSubsetDeposits();

  return (
    <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">{t("widgetTitle")}</h2>
        <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
          <Users size={10} />
          {t("activeSubsets", { count: isLoading ? "—" : pn(data?.activeSubsets ?? 0) })}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-background p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-muted">
                <CalendarDays size={11} />
                {t("today")}
              </div>
              <p className="text-lg font-extrabold text-foreground tabular-nums">{pn(data?.today ?? 0)}</p>
              <span className="text-[11px] text-muted">{t("tokenUnit")}</span>
            </div>
            <div className="flex flex-col gap-1.5 rounded-xl border border-border bg-background p-3">
              <div className="flex items-center gap-1.5 text-[11px] text-muted">
                <TrendingUp size={11} />
                {t("thisMonth")}
              </div>
              <p className="text-lg font-extrabold text-foreground tabular-nums">{pn(data?.thisMonth ?? 0)}</p>
              <span className="text-[11px] text-muted">{t("tokenUnit")}</span>
            </div>
          </div>

          <div className="h-px bg-border" />
          <div className="flex items-center justify-between text-xs">
            <div className="flex flex-col gap-0.5">
              <span className="text-muted">{t("total")}</span>
              <span className="font-semibold text-foreground">
                {pn(data?.total ?? 0)} {t("tokenUnit")}
              </span>
            </div>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-muted">{t("pendingSettlement")}</span>
              <span className="font-semibold text-warning">
                {pn(data?.pendingAmount ?? 0)} {t("tokenUnit")}
              </span>
            </div>
          </div>
        </div>
      )}

      {showDetailLink && (
        <Link
          href={ROUTES.SUBSET_DEPOSITS}
          className="mt-auto flex items-center justify-center gap-1 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold text-primary transition-colors hover:border-primary/30 hover:bg-primary/5"
        >
          {t("viewTransactions")}
          <ArrowLeft size={12} />
        </Link>
      )}
    </div>
  );
}
