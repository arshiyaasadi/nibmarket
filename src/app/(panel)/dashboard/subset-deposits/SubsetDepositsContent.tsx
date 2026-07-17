"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Copy } from "lucide-react";
import { SubsetDepositsWidget } from "@/components/molecules/SubsetDepositsWidget";
import { ROUTES } from "@/config/routes";
import { useSubsetDepositTransactions } from "@/features/subset-deposits/queries";
import { cn, formatDisplayDate, truncateIdentifier } from "@/lib/utils";
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
      router.replace(`${ROUTES.SUBSET_DEPOSITS}${params.size ? `?${params}` : ""}`, {
        scroll: false,
      });
    },
    [router, searchParams],
  );

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
      <SubsetDepositsWidget showDetailLink={false} showRulesLink expanded />

      <div className="flex flex-col gap-4">
        <h2 className="text-foreground text-base font-bold">{t("txTitle")}</h2>

        <div className="border-border bg-surface flex flex-wrap items-center gap-1 self-start rounded-xl border p-1">
          {STATUS_FILTERS.map(({ key, labelKey }) => (
            <button
              key={key}
              type="button"
              onClick={() => updateStatus(key)}
              className={cn(
                "rounded-lg px-3 py-1 text-xs font-medium transition-colors",
                statusFilter === key
                  ? "bg-primary text-white shadow-sm"
                  : "text-muted hover:text-foreground",
              )}
            >
              {t(labelKey)}
            </button>
          ))}
        </div>

        <div className="border-border bg-surface overflow-hidden rounded-2xl border">
          <div className="border-border bg-surface-2 hidden items-center gap-2 border-b px-4 py-3 sm:flex">
            <span className="text-muted w-[4.5rem] shrink-0 text-xs font-semibold">
              {t("colId")}
            </span>
            <span className="text-muted w-14 shrink-0 text-xs font-semibold">{t("colLevel")}</span>
            <span className="text-muted flex-1 text-xs font-semibold">{t("colDesc")}</span>
            <span className="text-muted w-28 shrink-0 text-xs font-semibold">{t("colDate")}</span>
            <span className="text-muted w-32 shrink-0 text-xs font-semibold">{t("colTxId")}</span>
            <span className="text-muted w-24 shrink-0 text-end text-xs font-semibold">
              {t("colAmount")}
            </span>
            <span className="text-muted w-24 shrink-0 text-xs font-semibold">{t("colStatus")}</span>
          </div>

          <div className="divide-border divide-y">
            {loadingTx ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex flex-col gap-2 px-4 py-3">
                  <div className="bg-surface-2 h-4 w-3/4 animate-pulse rounded" />
                  <div className="bg-surface-2 h-3 w-1/2 animate-pulse rounded" />
                </div>
              ))
            ) : txItems.length === 0 ? (
              <div className="text-muted py-12 text-center text-sm">{t("noTx")}</div>
            ) : (
              txItems.map((tx) => (
                <div key={tx.id} className="hover:bg-surface-2 px-4 py-3 transition-colors">
                  <div className="sm:hidden">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px] font-bold">
                            {t("levelGuide", { level: pn(tx.level) })}
                          </span>
                          <StatusBadge status={tx.status} t={t} />
                        </div>
                        <p className="text-foreground mt-1 truncate text-sm font-medium">
                          {tx.description}
                        </p>
                      </div>
                      <span className="text-success shrink-0 text-sm font-bold whitespace-nowrap tabular-nums">
                        +{pn(tx.amount)}
                      </span>
                    </div>
                    <div className="text-muted mt-2 flex flex-wrap items-center gap-3 text-xs">
                      <CopyableId value={tx.id} withHash t={t} />
                      <span>{formatDisplayDate(tx.date)}</span>
                      {tx.externalTxId && <CopyableId value={tx.externalTxId} t={t} />}
                    </div>
                  </div>

                  <div className="hidden sm:flex sm:items-center sm:gap-2">
                    <CopyableId value={tx.id} withHash t={t} className="w-[4.5rem]" />
                    <span className="text-primary w-14 shrink-0 text-xs font-semibold">
                      {t("levelGuide", { level: pn(tx.level) })}
                    </span>
                    <span className="text-foreground flex-1 truncate text-sm">
                      {tx.description}
                    </span>
                    <span className="text-muted w-28 shrink-0 text-sm">
                      {formatDisplayDate(tx.date)}
                    </span>
                    {tx.externalTxId ? (
                      <CopyableId value={tx.externalTxId} t={t} className="w-32" />
                    ) : (
                      <span className="text-muted w-32 shrink-0 text-xs">—</span>
                    )}
                    <span className="text-success w-24 shrink-0 text-end text-sm font-bold tabular-nums">
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
            <div className="text-muted py-3 text-center text-xs">{t("loadingMore")}</div>
          )}
          {!hasNextPage && txItems.length > 0 && (
            <div className="text-muted py-3 text-center text-xs">{t("noMore")}</div>
          )}
        </div>
      </div>
    </div>
  );
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
        "text-muted hover:text-primary inline-flex shrink-0 items-center gap-1 font-mono text-xs transition-colors",
        className,
      )}
      dir="ltr"
    >
      {copied ? <Check className="text-success size-3" /> : <Copy className="size-3" />}
      <span>{display}</span>
    </button>
  );
}

function StatusBadge({ status, t }: { status: SubsetDepositStatus; t: (key: string) => string }) {
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
