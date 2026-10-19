"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp, CheckCircle2, Circle, Clock, Banknote } from "lucide-react";
import { cn, formatDisplayDate, truncateIdentifier } from "@/lib/utils";
import { MissionsBonusBanner } from "@/components/molecules/MissionsBonusBanner";
import { MarketingBadgesSection } from "@/components/molecules/MarketingBadgesSection";
import {
  useMarketingBadges,
  useMissionSections,
  useMissionsActivity,
} from "@/features/missions/queries";
import {
  buildWeekLoginDays,
  formatDurationRemaining,
  getMissionBoost,
  getMissionCodeMeta,
  getMissionPeriodProgress,
  groupMissionsByCategory,
  missionsHaveAnyBoost,
  splitMarketerMissions,
  type MissionCategoryGroup,
} from "@/lib/missions/categories";
import { ROUTES } from "@/config/routes";
import type { MissionActivityStatus, MissionDef } from "@/types/mlm";

type FilterStatus = MissionActivityStatus | "all";

const STATUS_FILTERS: { key: FilterStatus; labelKey: string }[] = [
  { key: "all", labelKey: "filterAll" },
  { key: "in_progress", labelKey: "filterPending" },
  { key: "pending_verification", labelKey: "filterReviewing" },
  { key: "completed", labelKey: "filterPaid" },
];

function pn(n: number) {
  return n.toLocaleString("fa-IR");
}

type TMissions = ReturnType<typeof useTranslations<"missions">>;

export function MissionsContent() {
  const t = useTranslations("missions");
  const router = useRouter();
  const { missions, isLoading: loadingMissions } = useMissionSections();
  const { data: badgeItems = [] } = useMarketingBadges();
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [open, setOpen] = useState<Record<string, boolean>>({});

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

  const groups = useMemo(() => groupMissionsByCategory(missions), [missions]);
  const promotionGroup = groups.find((g) => g.meta.layout === "promotion");
  const accordionGroups = groups.filter(
    (g) => g.meta.layout !== "promotion" && g.meta.layout !== "badges",
  );
  const badgeUnlockMap = useMemo(() => {
    const map: Record<string, { unlocked: boolean; achievedAtLabel?: string | null }> = {};
    for (const b of badgeItems) {
      const state = {
        unlocked: b.unlocked,
        achievedAtLabel: b.achievedAt ? formatDisplayDate(b.achievedAt) : null,
      };
      map[b.missionCode] = state;
      map[b.code] = state;
    }
    return map;
  }, [badgeItems]);
  const showBoostBanner = missionsHaveAnyBoost(missions);
  const activityItems = activityPages?.pages.flatMap((p) => p.items) ?? [];

  function toggleGroup(id: string) {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="flex flex-col gap-6">
      <MissionsBonusBanner visible={showBoostBanner} />

      <div className="flex flex-col gap-4">
        {loadingMissions ? (
          <SkeletonCategories />
        ) : groups.length === 0 ? (
          <div className="border-border bg-surface text-muted rounded-2xl border px-4 py-8 text-center text-sm">
            {t("noMore")}
          </div>
        ) : (
          <>
            {promotionGroup && (
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {promotionGroup.missions.map((m) => {
                  const isDaily = getMissionCodeMeta(m.code).recurrence === "daily";
                  return (
                    <div key={m.id} className={cn(isDaily && "col-span-2 lg:col-span-1")}>
                      <RecurringMissionCard mission={m} t={t} />
                    </div>
                  );
                })}
              </div>
            )}

            {accordionGroups.map((group) => {
              const isOpen = open[group.meta.id] ?? false;
              return (
                <CategoryAccordion
                  key={group.meta.id}
                  group={group}
                  isOpen={isOpen}
                  onToggle={() => toggleGroup(group.meta.id)}
                  t={t}
                />
              );
            })}

            <MarketingBadgesSection title="نشان بازاریابی" unlockByMissionCode={badgeUnlockMap} />
          </>
        )}
      </div>

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
                    </div>
                  </div>
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
                          className="text-primary hover:text-primary/70 font-mono text-xs underline underline-offset-2"
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

function TokenRing({
  earned,
  total,
  complete,
}: {
  earned: number;
  total: number;
  complete: boolean;
}) {
  const size = 52;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? Math.min(1, earned / total) : 0;
  const offset = c * (1 - pct);

  return (
    <div className="relative size-[52px] shrink-0" aria-hidden>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-border"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={cn(
            "transition-[stroke-dashoffset] duration-500",
            complete ? "text-success" : "text-primary",
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {complete ? (
          <CheckCircle2 className="text-success size-5" />
        ) : (
          <>
            <span className="text-foreground text-[10px] leading-none font-bold tabular-nums">
              {pn(earned)}
            </span>
            <span className="text-muted text-[8px] leading-none">/{pn(total)}</span>
          </>
        )}
      </div>
    </div>
  );
}

function CategoryAccordion({
  group,
  isOpen,
  onToggle,
  t,
}: {
  group: MissionCategoryGroup;
  isOpen: boolean;
  onToggle: () => void;
  t: TMissions;
}) {
  return (
    <section
      className={cn(
        "border-border bg-surface overflow-hidden rounded-2xl border",
        group.isComplete && "border-success/25",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="hover:bg-surface-2/50 flex w-full items-center gap-3 px-4 py-3.5 text-start transition-colors sm:px-5"
      >
        <TokenRing
          earned={group.earnedTokens}
          total={group.totalTokens}
          complete={group.isComplete}
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-foreground text-sm font-bold sm:text-base">
              {t(group.meta.labelKey as "categories.onboarding")}
            </h2>
            {group.isComplete && <CheckCircle2 className="text-success size-4 shrink-0" />}
          </div>
          {group.meta.hintKey && (
            <p className="text-muted mt-0.5 text-xs">
              {t(group.meta.hintKey as "categoryHints.onboarding")}
            </p>
          )}
          <p className="text-muted mt-1 text-[11px] tabular-nums">
            {t("tokenProgress", {
              earned: pn(group.earnedTokens),
              total: pn(group.totalTokens),
            })}{" "}
            {t("tokenUnit")}
          </p>
        </div>
        {isOpen ? (
          <ChevronUp className="text-muted size-5 shrink-0" />
        ) : (
          <ChevronDown className="text-muted size-5 shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="border-border border-t p-4 sm:p-5">
          {group.meta.id === "onboarding" && <MissionCheckList missions={group.missions} t={t} />}
          {group.meta.id === "marketing" && <MarketerSplitList missions={group.missions} t={t} />}
        </div>
      )}
    </section>
  );
}

function MissionCheckList({ missions, t }: { missions: MissionDef[]; t: TMissions }) {
  return (
    <ul className="flex flex-col gap-2">
      {missions.map((m) => {
        const boost = getMissionBoost(m);
        const reward = boost?.effectiveReward ?? m.reward;
        return (
          <li
            key={m.id}
            className={cn(
              "border-border bg-background flex items-center gap-3 rounded-xl border px-3 py-3",
              m.completed && "border-success/20 bg-success/[0.04]",
            )}
          >
            <div className="min-w-0 flex-1 text-start">
              <div className="flex flex-wrap items-baseline gap-2">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    m.completed ? "text-muted" : "text-foreground",
                  )}
                >
                  {m.title}
                </p>
                {m.code === "first_fund_purchase" && m.description ? (
                  <span className="text-muted text-[11px]">{m.description}</span>
                ) : null}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <p
                  className={cn(
                    "text-lg font-black tabular-nums sm:text-xl",
                    m.completed ? "text-success" : "text-primary",
                  )}
                >
                  {pn(reward)}
                  <span className="text-muted ms-1 text-xs font-medium">تنوین</span>
                </p>
                {m.code === "training_level_1" && !m.completed ? (
                  <Link
                    href={ROUTES.COURSE_LEVEL_1}
                    className="bg-primary/10 text-primary hover:bg-primary/15 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition"
                  >
                    {t("visitCourse")}
                  </Link>
                ) : null}
              </div>
            </div>
            <span
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-full border",
                m.completed
                  ? "border-success/30 bg-success/15 text-success"
                  : "border-border bg-surface-2 text-muted",
              )}
            >
              {m.completed ? <CheckCircle2 className="size-5" /> : <Circle className="size-4" />}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function MarketerSplitList({ missions, t }: { missions: MissionDef[]; t: TMissions }) {
  const { start, pro } = splitMarketerMissions(missions);
  return (
    <div className="flex flex-col gap-5">
      {start.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-muted text-xs font-bold tracking-wide">{t("marketerStartLabel")}</h3>
          <MissionCheckList missions={start} t={t} />
        </div>
      )}
      {pro.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-muted text-xs font-bold tracking-wide">{t("marketerProLabel")}</h3>
          <MissionCheckList missions={pro} t={t} />
        </div>
      )}
    </div>
  );
}

function RecurringMissionCard({ mission: m, t }: { mission: MissionDef; t: TMissions }) {
  const recurrence = getMissionCodeMeta(m.code).recurrence;
  if (recurrence === "daily") return <DailyLoginCard mission={m} t={t} />;
  if (recurrence === "monthly") return <MonthlyReferralCard mission={m} t={t} />;
  return <PerEventReferralCard mission={m} t={t} />;
}

function DailyLoginCard({ mission: m, t }: { mission: MissionDef; t: TMissions }) {
  const boost = getMissionBoost(m);
  const reward = boost?.effectiveReward ?? m.reward;
  const week = buildWeekLoginDays(m);
  const progress = getMissionPeriodProgress(m);
  const remaining = formatDurationRemaining(progress?.msRemaining ?? null);

  return (
    <article className="border-border bg-surface flex h-full flex-col rounded-2xl border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-foreground text-sm font-bold">{m.title}</p>
          {m.description ? (
            <p className="text-muted mt-0.5 text-[11px] leading-relaxed">{m.description}</p>
          ) : null}
          <p className="text-primary mt-1 text-lg font-black tabular-nums">
            {pn(reward)}
            <span className="text-muted ms-1 text-xs font-medium">تنوین</span>
          </p>
        </div>
        <span className="bg-primary/10 text-primary rounded-lg px-2 py-0.5 text-[10px] font-bold">
          {t("periodDaily")}
        </span>
      </div>

      <ul className="mt-4 grid grid-cols-7 gap-1.5">
        {week.map((d) => (
          <li key={d.iso} className="flex flex-col items-center gap-1">
            <span className="text-muted text-[10px] font-medium">{d.label}</span>
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full border text-[10px]",
                d.claimed
                  ? "border-success/35 bg-success/15 text-success"
                  : d.kind === "today"
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : d.kind === "future"
                      ? "border-border/60 bg-transparent text-transparent"
                      : "border-border bg-surface-2 text-muted",
              )}
            >
              {d.claimed ? (
                <CheckCircle2 className="size-4" />
              ) : d.kind === "future" ? (
                <span className="bg-border size-1.5 rounded-full opacity-40" />
              ) : (
                <Circle className="size-3.5 opacity-40" />
              )}
            </span>
          </li>
        ))}
      </ul>

      {remaining && !progress?.doneThisPeriod && (
        <p className="text-muted mt-3 flex items-center gap-1 text-[11px]">
          <Clock className="size-3" />
          {remaining.days === 0 && remaining.hours === 0
            ? t("periodResetSoon")
            : t("periodResetDaily", { hours: pn(Math.max(remaining.hours, 1)) })}
        </p>
      )}
    </article>
  );
}

function MonthlyReferralCard({ mission: m, t }: { mission: MissionDef; t: TMissions }) {
  const boost = getMissionBoost(m);
  const reward = boost?.effectiveReward ?? m.reward;
  const progress = getMissionPeriodProgress(m);
  const remaining = formatDurationRemaining(progress?.msRemaining ?? null);
  const daysLeft = remaining ? Math.max(remaining.days, remaining.hours > 0 ? 1 : 0) : 0;
  const referred = progress?.current ?? 0;

  return (
    <article className="border-border bg-surface flex h-full flex-col rounded-2xl border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-foreground text-sm font-bold">{m.title}</p>
          <p className="text-primary mt-1 text-lg font-black tabular-nums">
            {pn(reward)}
            <span className="text-muted ms-1 text-xs font-medium">تنوین</span>
          </p>
        </div>
        <span className="bg-primary/10 text-primary rounded-lg px-2 py-0.5 text-[10px] font-bold">
          {t("periodMonthly")}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="border-border bg-background rounded-xl border px-3 py-2.5 text-center">
          <p className="text-muted text-[11px]">{t("statDaysLeft")}</p>
          <p className="text-foreground mt-1 text-2xl font-black tabular-nums">{pn(daysLeft)}</p>
        </div>
        <div className="border-border bg-background rounded-xl border px-3 py-2.5 text-center">
          <p className="text-muted text-[11px]">{t("statReferrals")}</p>
          <p className="text-foreground mt-1 text-2xl font-black tabular-nums">
            {pn(referred)}
            <span className="text-muted text-sm font-medium">/{pn(progress?.target ?? 3)}</span>
          </p>
        </div>
      </div>

      {progress && (
        <div className="bg-border mt-3 h-1.5 overflow-hidden rounded-full">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              progress.doneThisPeriod ? "bg-success" : "bg-primary",
            )}
            style={{ width: `${progress.percent}%` }}
          />
        </div>
      )}
    </article>
  );
}

function PerEventReferralCard({ mission: m, t }: { mission: MissionDef; t: TMissions }) {
  const boost = getMissionBoost(m);
  const reward = boost?.effectiveReward ?? m.reward;
  const subsets = m.referralCount ?? m.progressCurrent ?? 0;
  const earned = m.referralTokensEarned ?? subsets * m.reward;

  return (
    <article className="border-border bg-surface flex h-full flex-col rounded-2xl border p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-foreground text-sm font-bold">{m.title}</p>
          <p className="text-primary mt-1 text-lg font-black tabular-nums">
            {pn(reward)}
            <span className="text-muted ms-1 text-xs font-medium">تنوین</span>
            <span className="text-muted ms-1 text-[10px] font-normal">/ معرفی</span>
          </p>
        </div>
        <span className="bg-primary/10 text-primary rounded-lg px-2 py-0.5 text-[10px] font-bold">
          {t("periodPerEvent")}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="border-border bg-background rounded-xl border px-3 py-2.5 text-center">
          <p className="text-muted text-[11px]">{t("statSubsets")}</p>
          <p className="text-foreground mt-1 text-2xl font-black tabular-nums">{pn(subsets)}</p>
        </div>
        <div className="border-border bg-background rounded-xl border px-3 py-2.5 text-center">
          <p className="text-muted text-[11px]">{t("statTokensEarned")}</p>
          <p className="text-primary mt-1 text-2xl font-black tabular-nums">{pn(earned)}</p>
        </div>
      </div>
    </article>
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
      <Circle className="size-3" />
      {t("statusPending")}
    </span>
  );
}

function SkeletonCategories() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        <div className="border-border bg-surface col-span-2 h-40 animate-pulse rounded-2xl border lg:col-span-1" />
        <div className="border-border bg-surface h-40 animate-pulse rounded-2xl border" />
        <div className="border-border bg-surface h-40 animate-pulse rounded-2xl border" />
      </div>
    </div>
  );
}
