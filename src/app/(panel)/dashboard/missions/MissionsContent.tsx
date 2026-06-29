"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, CheckCircle2, Clock, Banknote } from "lucide-react";
import { cn } from "@/lib/utils";
import { MissionsBonusBanner } from "@/components/molecules/MissionsBonusBanner";
import { useMissionsList, useMissionsActivity } from "@/features/missions/queries";
import { ROUTES } from "@/config/routes";
import type { MissionActivityStatus } from "@/types/mlm";

const INITIAL_VISIBLE = 4;

type FilterStatus = MissionActivityStatus | "all";

const STATUS_FILTERS: { key: FilterStatus; labelKey: string }[] = [
  { key: "all", labelKey: "filterAll" },
  { key: "in_progress", labelKey: "filterPending" },
  { key: "pending_verification", labelKey: "filterReviewing" },
  { key: "completed", labelKey: "filterPaid" },
];

export function MissionsContent() {
  const t = useTranslations("missions");
  const router = useRouter();
  const { data: missions = [], isLoading: loadingMissions } = useMissionsList();
  const [showAll, setShowAll] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");

  const {
    data: activityPages,
    isLoading: loadingActivity,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMissionsActivity(statusFilter);

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage(); },
      { rootMargin: "120px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const upcoming = missions.filter((m) => !m.completed);
  const completed = missions.filter((m) => m.completed);
  const recentCompleted = completed;
  const visibleUpcoming = showAll ? upcoming : upcoming.slice(0, INITIAL_VISIBLE);
  const activityItems = activityPages?.pages.flatMap((p) => p.items) ?? [];

  return (
    <div className="flex flex-col gap-6">

      <MissionsBonusBanner />

      {/* Upcoming missions */}
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-foreground">{t("upcomingTitle")}</h2>
        <section className="flex flex-col gap-4">

        {loadingMissions ? (
          <SkeletonList count={4} />
        ) : (
          <>
            <ul className="grid gap-2 sm:gap-3 sm:grid-cols-2">
              {visibleUpcoming.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5 sm:rounded-2xl sm:gap-3 sm:px-pad-mol sm:py-pad-atom-md"
                >
                  <CheckCircle2 className="size-4 shrink-0 text-primary/30 sm:size-5" />
                  <span className="flex-1 truncate text-sm font-medium text-foreground">{m.title}</span>
                  <span className="shrink-0 text-xs font-bold text-primary whitespace-nowrap">
                    {m.reward} <span className="font-normal text-primary/60">Twin</span>
                  </span>
                </li>
              ))}
            </ul>

            {upcoming.length > INITIAL_VISIBLE && (
              <button
                type="button"
                onClick={() => setShowAll((s) => !s)}
                className="flex items-center gap-atom-md self-center rounded-xl border border-border bg-surface px-pad-mol py-pad-atom text-xs font-medium text-muted hover:bg-surface-2 transition-colors"
              >
                {showAll ? <><ChevronUp className="size-4" />{t("showLess")}</> : <><ChevronDown className="size-4" />{t("showMore")}</>}
              </button>
            )}
          </>
        )}
        </section>
      </div>

      {/* Completed this week */}
      <div className="flex flex-col gap-3">
        <h2 className="text-base font-bold text-foreground">{t("completedRecentTitle")}</h2>
        <section className="flex flex-col gap-4">

        {recentCompleted.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface px-pad-mol py-pad-mol-md text-center text-sm text-muted">
            {t("completedRecentEmpty")}
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {recentCompleted.map((m) => (
              <li
                key={m.id}
                className="flex items-center gap-3 rounded-2xl border border-success/20 bg-success/5 px-pad-mol py-pad-atom-md"
              >
                <CheckCircle2 className="size-5 shrink-0 text-success" />
                <span className="flex-1 text-sm font-medium text-foreground">{m.title}</span>
                {m.completedAt && (
                  <span className="shrink-0 text-xs text-muted">{m.completedAt}</span>
                )}
                <div className="flex shrink-0 items-center gap-1 rounded-lg bg-success/10 px-pad-atom-md py-pad-atom-xs">
                  <span className="text-xs font-bold text-success">+{m.reward}</span>
                  <span className="text-xs text-success/70">Twin</span>
                </div>
              </li>
            ))}
          </ul>
        )}
        </section>
      </div>

      {/* Activity / Payment status */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-foreground">{t("activityTitle")}</h2>

          <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
            {STATUS_FILTERS.map(({ key, labelKey }) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={cn(
                  "rounded-lg px-pad-atom-md py-pad-atom-xs text-xs font-medium transition-colors",
                  statusFilter === key
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:text-foreground",
                )}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          {/* Desktop header */}
          <div className="hidden sm:flex items-center gap-3 border-b border-border bg-surface-2 px-pad-mol py-pad-atom-md">
            <span className="flex-1 text-xs font-semibold text-muted">{t("colMission")}</span>
            <span className="w-28 shrink-0 text-xs font-semibold text-muted">{t("colDate")}</span>
            <span className="w-24 shrink-0 text-xs font-semibold text-muted">{t("colReward")}</span>
            <span className="w-24 shrink-0 text-xs font-semibold text-muted">{t("colStatus")}</span>
            <span className="w-32 shrink-0 text-xs font-semibold text-muted">{t("colRrn")}</span>
          </div>

          <div className="divide-y divide-border">
            {loadingActivity ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-pad-mol py-3 flex flex-col gap-2">
                  <div className="h-4 w-3/4 rounded bg-surface-2 animate-pulse" />
                  <div className="h-3 w-1/2 rounded bg-surface-2 animate-pulse" />
                </div>
              ))
            ) : activityItems.length === 0 ? (
              <div className="py-pad-mol-md text-center text-sm text-muted">
                {t("noMore")}
              </div>
            ) : (
              activityItems.map((item) => (
                <div key={item.id} className="px-pad-mol py-3 transition-colors hover:bg-surface-2">
                  {/* Mobile */}
                  <div className="sm:hidden">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium text-foreground leading-snug">{item.title}</span>
                      <ActivityBadge status={item.status} t={t} />
                    </div>
                    <div className="mt-1.5 flex items-center gap-3 flex-wrap">
                      <span className="whitespace-nowrap text-xs text-muted">{item.date}</span>
                      <span className="whitespace-nowrap text-xs font-semibold text-primary">+{item.reward} Twin</span>
                      {item.rrn && item.status === "completed" && (
                        <button
                          type="button"
                          onClick={() => router.push(`${ROUTES.WALLET}?rrn=${item.rrn}`)}
                          className="font-mono text-xs text-primary underline underline-offset-2 whitespace-nowrap"
                          dir="ltr"
                        >
                          {item.rrn}
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Desktop */}
                  <div className="hidden sm:flex sm:items-center sm:gap-3">
                    <span className="flex-1 truncate text-sm font-medium text-foreground">{item.title}</span>
                    <span className="w-28 shrink-0 whitespace-nowrap text-sm text-muted">{item.date}</span>
                    <span className="w-24 shrink-0 whitespace-nowrap text-sm">
                      <span className="font-semibold text-primary">+{item.reward}</span>
                      <span className="ms-1 text-xs text-muted">Twin</span>
                    </span>
                    <span className="w-24 shrink-0">
                      <ActivityBadge status={item.status} t={t} />
                    </span>
                    <span className="w-32 shrink-0">
                      {item.rrn && item.status === "completed" ? (
                        <button
                          type="button"
                          onClick={() => router.push(`${ROUTES.WALLET}?rrn=${item.rrn}`)}
                          className="font-mono text-xs text-primary underline underline-offset-2 whitespace-nowrap hover:text-primary/70"
                          dir="ltr"
                        >
                          {item.rrn}
                        </button>
                      ) : (
                        <span className="text-xs text-muted">—</span>
                      )}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div ref={sentinelRef} className="h-1" />
          {isFetchingNextPage && (
            <div className="py-pad-atom-md text-center text-xs text-muted">{t("loadingMore")}</div>
          )}
          {!hasNextPage && activityItems.length > 0 && (
            <div className="py-pad-atom-md text-center text-xs text-muted">{t("noMore")}</div>
          )}
        </div>
      </section>
    </div>
  );
}

function ActivityBadge({
  status, t,
}: {
  status: MissionActivityStatus;
  t: (k: string) => string;
}) {
  if (status === "completed") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-success/10 px-pad-atom-md py-pad-atom-xs text-xs font-medium text-success whitespace-nowrap">
        <Banknote className="size-3" />
        {t("statusPaid")}
      </span>
    );
  }
  if (status === "pending_verification") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-warning/10 px-pad-atom-md py-pad-atom-xs text-xs font-medium text-warning whitespace-nowrap">
        <Clock className="size-3" />
        {t("statusReviewing")}
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-muted/10 px-pad-atom-md py-pad-atom-xs text-xs font-medium text-muted whitespace-nowrap">
      <Clock className="size-3" />
      {t("statusPending")}
    </span>
  );
}

function SkeletonList({ count }: { count: number }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-pad-mol py-pad-atom-md">
          <div className="size-9 rounded-xl bg-surface-2 animate-pulse" />
          <div className="flex-1 h-4 rounded bg-surface-2 animate-pulse" />
          <div className="h-6 w-16 rounded-lg bg-surface-2 animate-pulse" />
        </li>
      ))}
    </ul>
  );
}
