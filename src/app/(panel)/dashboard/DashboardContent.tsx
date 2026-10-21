"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CircleCheck, Trophy, ArrowLeft, Circle, Clock } from "lucide-react";
import { useSubsetDeposits } from "@/features/dashboard/queries";
import { useMissionSections, useMissionsActivity } from "@/features/missions/queries";
import { useCompetitionPool } from "@/features/leaderboard/queries";
import { NetworkTreeWidget } from "@/components/organisms/network/NetworkTreeWidget";
import { InviteModal } from "@/components/organisms/network/InviteModal";
import { InviteKycGateModal } from "@/components/organisms/network/InviteKycGateModal";
import { MissionsBonusBanner } from "@/components/molecules/MissionsBonusBanner";
import { SubsetDepositsWidget } from "@/components/molecules/SubsetDepositsWidget";
import { useInviteLauncher } from "@/features/network/use-invite-launcher";
import {
  buildWeekLoginDays,
  getMissionBoost,
  getMissionCodeMeta,
  groupMissionsByCategory,
  missionsHaveAnyBoost,
} from "@/lib/missions/categories";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import type { MissionDef } from "@/types/mlm";

function pn(n: number) {
  return n.toLocaleString("fa-IR");
}

// ── Missions Widget ───────────────────────────────────────────────────────────

function MissionsWidget({ onInvite }: { onInvite?: () => void }) {
  const t = useTranslations("missions");
  const { missions, isLoading } = useMissionSections();
  const {
    data: activityPages,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useMissionsActivity("all");

  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && (activityPages?.pages.length ?? 0) < 3) {
      void fetchNextPage();
    }
  }, [activityPages?.pages.length, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const activityItems = useMemo(
    () => activityPages?.pages.flatMap((p) => p.items) ?? [],
    [activityPages],
  );

  const dailyLogin = useMemo(
    () => missions.find((m) => getMissionCodeMeta(m.code).recurrence === "daily") ?? null,
    [missions],
  );

  /** Next incomplete step per stage (one card each, side-by-side). */
  const stageCards = useMemo(() => {
    const groups = groupMissionsByCategory(missions);
    const pick = (id: "onboarding" | "marketing") => {
      const g = groups.find((x) => x.meta.id === id);
      if (!g) return null;
      const mission = g.missions.find((m) => !m.completed) ?? null;
      if (!mission) return null;
      return { categoryLabelKey: g.meta.labelKey, mission };
    };
    return [pick("onboarding"), pick("marketing")].filter(
      (x): x is { categoryLabelKey: string; mission: MissionDef } => x != null,
    );
  }, [missions]);

  const completedCount = missions.filter((m) => m.completed).length;
  const showBoostBanner = missionsHaveAnyBoost(missions);
  const week = dailyLogin ? buildWeekLoginDays(dailyLogin, { activity: activityItems }) : [];
  const dailyReward = dailyLogin
    ? (getMissionBoost(dailyLogin)?.effectiveReward ?? dailyLogin.reward)
    : 0;

  return (
    <div className="border-border bg-surface flex h-full flex-col gap-4 rounded-2xl border p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-foreground text-sm font-semibold">{t("title")}</h2>
            {!isLoading && missions.length > 0 && (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px] font-bold">
                {t("widgetProgress", { done: pn(completedCount), total: pn(missions.length) })}
              </span>
            )}
          </div>
        </div>
        <Link
          href={ROUTES.MISSIONS}
          className="text-primary flex shrink-0 items-center gap-1 text-xs hover:opacity-80"
        >
          {t("viewAll")}
          <ArrowLeft size={12} />
        </Link>
      </div>

      <MissionsBonusBanner onInvite={onInvite} visible={showBoostBanner} />

      {isLoading ? (
        <div className="flex h-28 items-center justify-center">
          <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Daily login week */}
          {dailyLogin && (
            <div className="border-border bg-background rounded-xl border p-3">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-foreground text-xs font-bold">{dailyLogin.title}</p>
                  {dailyLogin.description ? (
                    <p className="text-muted mt-0.5 line-clamp-1 text-[10px]">
                      {dailyLogin.description}
                    </p>
                  ) : null}
                </div>
                <p className="text-primary shrink-0 text-sm font-black tabular-nums">
                  {pn(dailyReward)}
                  <span className="text-muted ms-0.5 text-[10px] font-medium">تنوین</span>
                </p>
              </div>
              <ul className="grid grid-cols-7 gap-1">
                {week.map((d) => (
                  <li key={d.iso} className="flex flex-col items-center gap-1">
                    <span className="text-muted text-[9px] font-medium">{d.label}</span>
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-full border",
                        d.payoutStatus === "paid" && "border-success/35 bg-success/15 text-success",
                        d.payoutStatus === "reviewing" &&
                          "border-amber-500/45 bg-amber-500/15 text-amber-600 dark:text-amber-400",
                        d.payoutStatus === "missed" &&
                          "border-red-500/40 bg-red-500/12 text-red-600",
                        d.payoutStatus === "none" &&
                          (d.kind === "today"
                            ? "border-primary/40 bg-primary/10 text-primary"
                            : "border-border/50"),
                      )}
                    >
                      {d.payoutStatus === "paid" ? (
                        <CircleCheck className="size-3.5" />
                      ) : d.payoutStatus === "reviewing" ? (
                        <Clock className="size-3" />
                      ) : d.payoutStatus === "missed" ? (
                        <Circle className="size-3 opacity-70" />
                      ) : (
                        <span className="bg-border size-1 rounded-full opacity-50" />
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next incomplete step: شروع کار | بازاریابی — equal height */}
          {stageCards.length > 0 && (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:items-stretch">
              {stageCards.map(({ categoryLabelKey, mission: m }) => {
                const reward = getMissionBoost(m)?.effectiveReward ?? m.reward;
                return (
                  <div
                    key={m.id}
                    className="border-border bg-background flex min-h-[5.5rem] flex-col justify-between gap-2 rounded-xl border px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-muted text-[10px] font-medium">
                        {t(categoryLabelKey as "categories.onboarding")}
                      </p>
                      <p className="text-foreground mt-0.5 line-clamp-2 text-xs font-semibold">
                        {m.title}
                      </p>
                      {m.code === "first_fund_purchase" && m.description ? (
                        <p className="text-muted mt-0.5 line-clamp-2 text-[10px]">
                          {m.description}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex items-end justify-between gap-2">
                      <p className="text-primary shrink-0 text-sm font-black tabular-nums">
                        {pn(reward)}
                        <span className="text-muted ms-0.5 text-[10px] font-medium">تنوین</span>
                      </p>
                      {m.code === "training_level_1" ? (
                        <Link
                          href={ROUTES.COURSE_LEVEL_1}
                          className="bg-primary/10 text-primary hover:bg-primary/15 shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition"
                        >
                          {t("visitCourse")}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Pool Widget ───────────────────────────────────────────────────────────────

function PoolWidget() {
  const { data: pool, isLoading: poolLoading } = useCompetitionPool();
  const { data: deposits, isLoading: depositsLoading } = useSubsetDeposits();
  const isLoading = poolLoading || depositsLoading;
  const hasSubsets = (deposits?.activeSubsets ?? 0) > 0;
  const showRank = hasSubsets && pool?.myRank;

  return (
    <div className="border-border bg-surface flex h-full flex-col gap-4 rounded-2xl border p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-foreground text-sm font-semibold">تابلوی استخر</h2>
        <Link
          href={ROUTES.LEADERBOARD.POOL}
          className="text-primary flex items-center gap-1 text-xs hover:opacity-80"
        >
          جزئیات
          <ArrowLeft size={12} />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-3">
            <div className="flex-1">
              <p className="text-muted mb-1 text-xs">موجودی استخر در ماه جاری</p>
              <p className="text-foreground text-3xl font-black tabular-nums">
                {pn(pool?.totalPool ?? 0)}
              </p>
              <p className="text-muted mt-0.5 text-[11px]">تنوین</p>
            </div>
            {showRank && (
              <div className="border-primary/20 bg-primary/5 rounded-lg border px-3 py-2 text-end">
                <p className="text-muted text-[11px]">رتبه من</p>
                <p className="text-primary text-base font-bold tabular-nums" dir="ltr">
                  #{pn(pool.myRank!)}
                </p>
              </div>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-background rounded-xl px-3 py-2 text-center">
              <p className="text-foreground text-xs font-semibold">
                {pn(pool?.participantCount ?? 0)}
              </p>
              <p className="text-muted mt-0.5 text-[11px]">شرکت‌کننده</p>
            </div>
            <div className="bg-background rounded-xl px-3 py-2 text-center">
              <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                ▲ {pn(pool?.dailyChange ?? 0)}
              </p>
              <p className="text-muted mt-0.5 text-[11px]">تغییر امروز</p>
            </div>
            <div className="bg-background rounded-xl px-3 py-2 text-center">
              <p className="text-foreground text-xs font-semibold">{pn(5)}</p>
              <p className="text-muted mt-0.5 text-[11px]">برنده برتر</p>
            </div>
          </div>

          {/* Period */}
          {pool?.contextTitle && (
            <div className="border-primary/20 bg-primary/5 flex items-center gap-2 rounded-xl border px-3 py-2">
              <Trophy size={13} className="text-primary shrink-0" />
              <span className="text-foreground text-xs">{pool.contextTitle}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Dashboard Root ────────────────────────────────────────────────────────────

export function DashboardContent() {
  const { openInvite, showGate, closeGate, showInvite, closeInvite } = useInviteLauncher();

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          <div className="flex min-w-0 flex-1 flex-col">
            <MissionsWidget onInvite={openInvite} />
          </div>
          <div className="flex flex-col lg:w-[38%] lg:shrink-0">
            <PoolWidget />
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          <div className="flex min-h-0 flex-col lg:w-[40%] lg:shrink-0">
            <SubsetDepositsWidget />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <NetworkTreeWidget showTitle={false} onInvite={openInvite} />
          </div>
        </div>
      </div>

      <InviteKycGateModal open={showGate} onClose={closeGate} />
      {showInvite && <InviteModal onClose={closeInvite} />}
    </>
  );
}
