"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Copy } from "lucide-react";
import { SubsetDepositsWidget } from "@/components/molecules/SubsetDepositsWidget";
import { ROUTES } from "@/config/routes";
import {
  useCommissionLevelRules,
  useSubsetDepositTransactions,
} from "@/features/subset-deposits/queries";
import { cn } from "@/lib/utils";
import type { SubsetDepositStatus, SubsetDepositStatusFilter } from "@/types/mlm";

const STATUS_FILTERS: { key: SubsetDepositStatusFilter; labelKey: string }[] = [
  { key: "all", labelKey: "filterAll" },
  { key: "calculated", labelKey: "filterPending" },
  { key: "credited", labelKey: "filterCredited" },
];

function pn(n: number) {
  return n.toLocaleString("fa-IR");
}

function normalizeStatusFilter(value: string | null): SubsetDepositStatusFilter {
  if (value === "calculated" || value === "credited") return value;
  return "all";
}

export function SubsetDepositsContent() {
  const t = useTranslations("subsetDeposits");
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = normalizeStatusFilter(searchParams.get("status"));

  const updateStatus = useCallback(
    (value: SubsetDepositStatusFilter) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all") params.delete("status");
      else params.set("status", value);
      router.replace(`${ROUTES.SUBSET_DEPOSITS}${params.size ? `?${params}` : ""}`, { scroll: false });
    },
    [router, searchParams],
  );

  const { data: rules = [], isLoading: loadingRules } = useCommissionLevelRules();
  const {
    data: txPages,
    isLoading: loadingTx,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSubsetDepositTransactions(statusFilter);

  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "120px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const txItems = txPages?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <div className="flex min-h-0 flex-col lg:w-[55%]">
          <SubsetDepositsWidget showDetailLink={false} />
        </div>
        <div className="flex min-h-0 flex-col rounded-2xl border border-border bg-surface p-5 lg:w-[45%]">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-foreground">{t("rulesTitle")}</h2>
            <p className="mt-1 text-xs leading-6 text-muted">{t("rulesDescription")}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {loadingRules ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="h-12 rounded-xl bg-surface-2 animate-pulse" />
              ))
            ) : (
              rules.map((rule) => (
                <div
                  key={rule.level}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2"
                >
                  <span className="text-xs font-medium text-foreground">
                    {t("levelGuide", { level: pn(rule.level) })}
                  </span>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    {t("rateValue", { rate: pn(rule.ratePercent) })}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-base font-bold text-foreground">{t("txTitle")}</h2>

        <div className="flex flex-wrap items-center gap-1 self-start rounded-xl border border-border bg-surface p-1">
          {STATUS_FILTERS.map(({ key, labelKey }) => (
            <button
              key={key}
              type="button"
              onClick={() => updateStatus(key)}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
                statusFilter === key ? "bg-primary text-white shadow-sm" : "text-muted hover:text-foreground",
              )}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="hidden sm:flex items-center gap-2 border-b border-border bg-surface-2 px-4 py-3">
            <span className="w-[4.5rem] shrink-0 text-xs font-semibold text-muted">{t("colId")}</span>
            <span className="w-14 shrink-0 text-xs font-semibold text-muted">{t("colLevel")}</span>
            <span className="flex-1 text-xs font-semibold text-muted">{t("colDesc")}</span>
            <span className="w-28 shrink-0 text-xs font-semibold text-muted">{t("colDate")}</span>
            <span className="w-32 shrink-0 text-xs font-semibold text-muted">{t("colTxId")}</span>
            <span className="w-24 shrink-0 text-end text-xs font-semibold text-muted">{t("colAmount")}</span>
            <span className="w-24 shrink-0 text-xs font-semibold text-muted">{t("colStatus")}</span>
          </div>

          <div className="divide-y divide-border">
            {loadingTx ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="px-4 py-3 flex flex-col gap-2">
                  <div className="h-4 w-3/4 rounded bg-surface-2 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-surface-2 animate-pulse" />
                </div>
              ))
            ) : txItems.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted">{t("noTx")}</div>
            ) : (
              txItems.map((tx) => (
                <div key={tx.id} className="px-4 py-3 transition-colors hover:bg-surface-2">
                  <div className="sm:hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
                            {t("levelGuide", { level: pn(tx.level) })}
                          </span>
                          <StatusBadge status={tx.status} t={t} />
                        </div>
                        <p className="mt-1 truncate text-sm font-medium text-foreground">{tx.description}</p>
                      </div>
                      <span className="shrink-0 whitespace-nowrap text-sm font-bold text-success tabular-nums">
                        +{pn(tx.amount)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted">
                      <CopyableId value={tx.id} withHash t={t} />
                      <span>{tx.date}</span>
                      {tx.externalTxId && <CopyableId value={tx.externalTxId} t={t} />}
                    </div>
                  </div>

                  <div className="hidden sm:flex sm:items-center sm:gap-2">
                    <CopyableId value={tx.id} withHash t={t} className="w-[4.5rem]" />
                    <span className="w-14 shrink-0 text-xs font-semibold text-primary">
                      {t("levelGuide", { level: pn(tx.level) })}
                    </span>
                    <span className="flex-1 truncate text-sm text-foreground">{tx.description}</span>
                    <span className="w-28 shrink-0 text-sm text-muted">{tx.date}</span>
                    {tx.externalTxId ? (
                      <CopyableId value={tx.externalTxId} t={t} className="w-32" />
                    ) : (
                      <span className="w-32 shrink-0 text-xs text-muted">—</span>
                    )}
                    <span className="w-24 shrink-0 text-end text-sm font-bold text-success tabular-nums">
                      +{pn(tx.amount)}
                    </span>
                    <span className="w-24 shrink-0">
                      <StatusBadge status={tx.status} t={t} />
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div ref={sentinelRef} className="h-1" />
          {isFetchingNextPage && (
            <div className="py-3 text-center text-xs text-muted">{t("loadingMore")}</div>
          )}
          {!hasNextPage && txItems.length > 0 && (
            <div className="py-3 text-center text-xs text-muted">{t("noMore")}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function truncateIdentifier(value: string, head = 6, tail = 4): string {
  if (value.length <= head + tail + 1) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
}

function CopyableId({
  value,
  withHash = false,
  t,
  className,
}: {
  value: string;
  withHash?: boolean;
  t: (key: string) => string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const raw = value.replace(/^#/, "");
  const display = `${withHash ? "#" : ""}${truncateIdentifier(raw)}`;

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(raw).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }, [raw]);

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? t("copied") : t("copyHint")}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 font-mono text-xs text-muted transition-colors hover:text-primary",
        className,
      )}
      dir="ltr"
    >
      {copied ? <Check className="size-3 text-success" /> : <Copy className="size-3" />}
      <span>{display}</span>
    </button>
  );
}

function StatusBadge({
  status,
  t,
}: {
  status: SubsetDepositStatus;
  t: (key: string) => string;
}) {
  const statusKey: Record<SubsetDepositStatus, string> = {
    calculated: "statusPending",
    credited: "statusCredited",
    reversed: "statusReversed",
    failed: "statusFailed",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold",
        status === "credited"
          ? "bg-success/10 text-success"
          : status === "calculated"
            ? "bg-warning/10 text-warning"
            : "bg-error/10 text-error",
      )}
    >
      {t(statusKey[status])}
    </span>
  );
}
