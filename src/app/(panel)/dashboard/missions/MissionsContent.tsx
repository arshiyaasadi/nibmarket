"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, CheckCircle2, Clock, Banknote } from "lucide-react";
import { cn, formatDisplayDate, truncateIdentifier } from "@/lib/utils";
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
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
      },
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
        <h2 className="text-foreground text-base font-bold">{t("upcomingTitle")}</h2>
        <section className="flex flex-col gap-4">
          {loadingMissions ? (
            <SkeletonList count={4} />
          ) : (
            <>
              <ul className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                {visibleUpcoming.map((m) => (
                  <li
                    key={m.id}
                    className="border-border bg-surface sm:px-pad-mol sm:py-pad-atom-md flex items-center gap-2.5 rounded-xl border px-3 py-2.5 sm:gap-3 sm:rounded-2xl"
                  >
                    <CheckCircle2 className="text-primary/30 size-4 shrink-0 sm:size-5" />
                    <span className="text-foreground flex-1 truncate text-sm font-medium">
                      {m.title}
                    </span>
                    <span className="text-primary shrink-0 text-xs font-bold whitespace-nowrap">
                      {m.reward} <span className="text-primary/60 font-normal">تنوین</span>
                    </span>
                  </li>
                ))}
              </ul>

              {upcoming.length > INITIAL_VISIBLE && (
                <button
                  type="button"
                  onClick={() => setShowAll((s) => !s)}
                  className="gap-atom-md border-border bg-surface px-pad-mol py-pad-atom text-muted hover:bg-surface-2 flex items-center self-center rounded-xl border text-xs font-medium transition-colors"
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="size-4" />
                      {t("showLess")}
                    </>
                  ) : (
                    <>
                      <ChevronDown className="size-4" />
                      {t("showMore")}
                    </>
                  )}
                </button>
              )}
            </>
          )}
        </section>
      </div>

      {/* Completed this week */}
      <div className="flex flex-col gap-3">
        <h2 className="text-foreground text-base font-bold">{t("completedRecentTitle")}</h2>
        <section className="flex flex-col gap-4">
          {recentCompleted.length === 0 ? (
            <div className="border-border bg-surface px-pad-mol py-pad-mol-md text-muted rounded-2xl border text-center text-sm">
              {t("completedRecentEmpty")}
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {recentCompleted.map((m) => (
                <li
                  key={m.id}
                  className="border-success/20 bg-success/5 px-pad-mol py-pad-atom-md flex items-center gap-3 rounded-2xl border"
                >
                  <CheckCircle2 className="text-success size-5 shrink-0" />
                  <span className="text-foreground flex-1 text-sm font-medium">{m.title}</span>
                  {m.completedAt && (
                    <span className="text-muted shrink-0 text-xs">
                      {formatDisplayDate(m.completedAt)}
                    </span>
                  )}
                  <div className="bg-success/10 px-pad-atom-md py-pad-atom-xs flex shrink-0 items-center gap-1 rounded-lg">
                    <span className="text-success text-xs font-bold">+{m.reward}</span>
                    <span className="text-success/70 text-xs">تنوین</span>
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
          <h2 className="text-foreground text-base font-bold">{t("activityTitle")}</h2>

          <div className="border-border bg-surface flex items-center gap-1 rounded-xl border p-1">
            {STATUS_FILTERS.map(({ key, labelKey }) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={cn(
                  "px-pad-atom-md py-pad-atom-xs rounded-lg text-xs font-medium transition-colors",
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

        <div className="border-border bg-surface overflow-hidden rounded-2xl border">
          {/* Desktop header */}
          <div className="border-border bg-surface-2 px-pad-mol py-pad-atom-md hidden items-center gap-3 border-b sm:flex">
            <span className="text-muted flex-1 text-xs font-semibold">{t("colMission")}</span>
            <span className="text-muted w-28 shrink-0 text-xs font-semibold">{t("colDate")}</span>
            <span className="text-muted w-24 shrink-0 text-xs font-semibold">{t("colReward")}</span>
            <span className="text-muted w-24 shrink-0 text-xs font-semibold">{t("colStatus")}</span>
            <span className="text-muted w-32 shrink-0 text-xs font-semibold">{t("colRrn")}</span>
          </div>

          <div className="divide-border divide-y">
            {loadingActivity ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-pad-mol flex flex-col gap-2 py-3">
                  <div className="bg-surface-2 h-4 w-3/4 animate-pulse rounded" />
                  <div className="bg-surface-2 h-3 w-1/2 animate-pulse rounded" />
                </div>
              ))
            ) : activityItems.length === 0 ? (
              <div className="py-pad-mol-md text-muted text-center text-sm">{t("noMore")}</div>
            ) : (
              activityItems.map((item) => (
                <div key={item.id} className="px-pad-mol hover:bg-surface-2 py-3 transition-colors">
                  {/* Mobile */}
                  <div className="sm:hidden">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-foreground text-sm leading-snug font-medium">
                        {item.title}
                      </span>
                      <ActivityBadge status={item.status} t={t} />
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3">
                      <span className="text-muted text-xs whitespace-nowrap">
                        {formatDisplayDate(item.date)}
                      </span>
                      <span className="text-primary text-xs font-semibold whitespace-nowrap">
                        +{item.reward} تنوین
                      </span>
                      {item.rrn && item.status === "completed" && (
                        <button
                          type="button"
                          onClick={() => router.push(`${ROUTES.WALLET}?rrn=${item.rrn}`)}
                          className="text-primary font-mono text-xs whitespace-nowrap underline underline-offset-2"
                          dir="ltr"
                          title={item.rrn}
                        >
                          {truncateIdentifier(item.rrn)}
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Desktop */}
                  <div className="hidden sm:flex sm:items-center sm:gap-3">
                    <span className="text-foreground flex-1 truncate text-sm font-medium">
                      {item.title}
                    </span>
                    <span className="text-muted w-28 shrink-0 text-sm whitespace-nowrap">
                      {formatDisplayDate(item.date)}
                    </span>
                    <span className="w-24 shrink-0 text-sm whitespace-nowrap">
                      <span className="text-primary font-semibold">+{item.reward}</span>
                      <span className="text-muted ms-1 text-xs">تنوین</span>
                    </span>
                    <span className="w-24 shrink-0">
                      <ActivityBadge status={item.status} t={t} />
                    </span>
                    <span className="w-32 shrink-0">
                      {item.rrn && item.status === "completed" ? (
                        <button
                          type="button"
                          onClick={() => router.push(`${ROUTES.WALLET}?rrn=${item.rrn}`)}
                          className="text-primary hover:text-primary/70 font-mono text-xs whitespace-nowrap underline underline-offset-2"
                          dir="ltr"
                          title={item.rrn}
                        >
                          {truncateIdentifier(item.rrn)}
                        </button>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div ref={sentinelRef} className="h-1" />
          {isFetchingNextPage && (
            <div className="py-pad-atom-md text-muted text-center text-xs">{t("loadingMore")}</div>
          )}
          {!hasNextPage && activityItems.length > 0 && (
            <div className="py-pad-atom-md text-muted text-center text-xs">{t("noMore")}</div>
          )}
        </div>
      </section>
    </div>
  );
}

function ActivityBadge({ status, t }: { status: MissionActivityStatus; t: (k: string) => string }) {
  if (status === "completed") {
    return (
      <span className="bg-success/10 px-pad-atom-md py-pad-atom-xs text-success inline-flex shrink-0 items-center gap-1 rounded-lg text-xs font-medium whitespace-nowrap">
        <Banknote className="size-3" />
        {t("statusPaid")}
      </span>
    );
  }
  if (status === "pending_verification") {
    return (
      <span className="bg-warning/10 px-pad-atom-md py-pad-atom-xs text-warning inline-flex shrink-0 items-center gap-1 rounded-lg text-xs font-medium whitespace-nowrap">
        <Clock className="size-3" />
        {t("statusReviewing")}
      </span>
    );
  }
  return (
    <span className="bg-muted/10 px-pad-atom-md py-pad-atom-xs text-muted inline-flex shrink-0 items-center gap-1 rounded-lg text-xs font-medium whitespace-nowrap">
      <Clock className="size-3" />
      {t("statusPending")}
    </span>
  );
}

function SkeletonList({ count }: { count: number }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className="border-border bg-surface px-pad-mol py-pad-atom-md flex items-center gap-3 rounded-2xl border"
        >
          <div className="bg-surface-2 size-9 animate-pulse rounded-xl" />
          <div className="bg-surface-2 h-4 flex-1 animate-pulse rounded" />
          <div className="bg-surface-2 h-6 w-16 animate-pulse rounded-lg" />
        </li>
      ))}
    </ul>
  );
}
