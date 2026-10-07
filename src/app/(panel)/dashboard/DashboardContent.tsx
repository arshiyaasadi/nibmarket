"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { CircleCheck, Zap, Trophy, ArrowLeft, Sparkles } from "lucide-react";
import { useMissionsList, useSubsetDeposits } from "@/features/dashboard/queries";
import { useCompetitionPool } from "@/features/leaderboard/queries";
import { NetworkTreeWidget } from "@/components/organisms/network/NetworkTreeWidget";
import { InviteModal } from "@/components/organisms/network/InviteModal";
import { MissionsBonusBanner } from "@/components/molecules/MissionsBonusBanner";
import { SubsetDepositsWidget } from "@/components/molecules/SubsetDepositsWidget";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

function pn(n: number) {
  return n.toLocaleString("fa-IR");
}

// ── Missions Widget ───────────────────────────────────────────────────────────

function MissionsWidget({ onInvite }: { onInvite?: () => void }) {
  const t = useTranslations("missions");
  const { data: missions = [], isLoading } = useMissionsList();

  const sorted = useMemo(
    () =>
      [...missions]
        .sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          if (a.doubleBonus !== b.doubleBonus) return a.doubleBonus ? -1 : 1;
          return 0;
        })
        .slice(0, 10),
    [missions],
  );

  const completedCount = missions.filter((m) => m.completed).length;
  const progressPct = missions.length > 0 ? (completedCount / missions.length) * 100 : 0;

  return (
    <div className="border-border bg-surface flex h-full flex-col gap-4 rounded-2xl border p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-foreground text-sm font-semibold">{t("title")}</h2>
            {!isLoading && missions.length > 0 && (
              <span className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[11px] font-bold">
                {t("widgetProgress", { done: pn(completedCount), total: pn(missions.length) })}
              </span>
            )}
          </div>
          {!isLoading && missions.length > 0 && (
            <div className="bg-border mt-2 h-1 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}
        </div>
        <Link
          href={ROUTES.MISSIONS}
          className="text-primary flex shrink-0 items-center gap-1 text-xs hover:opacity-80"
        >
          {t("viewAll")}
          <ArrowLeft size={12} />
        </Link>
      </div>

      <MissionsBonusBanner onInvite={onInvite} />

      {isLoading ? (
        <div className="flex h-28 items-center justify-center">
          <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      ) : (
        <ul className="-mx-1 flex snap-x snap-mandatory [scrollbar-width:none] gap-3 overflow-x-auto px-1 pb-0.5 [&::-webkit-scrollbar]:hidden">
          {sorted.map((m) => {
            const reward = m.doubleBonus && !m.completed ? m.reward * 2 : m.reward;
            return (
              <li key={m.id} className="w-[9.5rem] shrink-0 snap-start sm:w-[10.5rem]">
                <div
                  className={cn(
                    "relative flex h-full min-h-[7.5rem] flex-col gap-2 rounded-xl border p-3 transition",
                    m.completed
                      ? "border-border/80 bg-background/50 opacity-70"
                      : m.doubleBonus
                        ? "border-primary/30 from-primary/10 to-surface bg-gradient-to-b shadow-sm"
                        : "border-border bg-background hover:border-primary/20",
                  )}
                >
                  {m.doubleBonus && !m.completed && (
                    <span className="bg-primary absolute start-3 -top-2 inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold text-white shadow-sm">
                      <Zap className="size-2.5" />
                      ۲×
                    </span>
                  )}

                  <div
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg",
                      m.completed ? "bg-success/15" : "bg-primary/10",
                    )}
                  >
                    {m.completed ? (
                      <CircleCheck className="text-success size-4" />
                    ) : m.doubleBonus ? (
                      <Sparkles className="text-primary size-4" />
                    ) : (
                      <CircleCheck className="text-primary/40 size-4" />
                    )}
                  </div>

                  <p
                    className={cn(
                      "line-clamp-2 flex-1 text-xs leading-snug font-medium",
                      m.completed ? "text-muted line-through" : "text-foreground",
                    )}
                  >
                    {m.title}
                  </p>

                  <div className="flex items-baseline gap-1">
                    <span
                      className={cn(
                        "text-sm font-bold tabular-nums",
                        m.completed
                          ? "text-muted"
                          : m.doubleBonus
                            ? "text-primary"
                            : "text-foreground",
                      )}
                    >
                      {pn(reward)}
                    </span>
                    <span className="text-muted text-[11px]">تنوین</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
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
              <p className="text-muted mb-1 text-xs">حجم Pool جاری</p>
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
              <p className="text-foreground text-xs font-semibold">{pn(pool?.topWinners ?? 0)}</p>
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
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          <div className="min-w-0 flex-1">
            <MissionsWidget onInvite={() => setShowInviteModal(true)} />
          </div>
          <div className="lg:w-[38%] lg:shrink-0">
            <PoolWidget />
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          <div className="flex min-h-0 flex-col lg:w-[40%] lg:shrink-0">
            <SubsetDepositsWidget />
          </div>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <NetworkTreeWidget showTitle={false} onInvite={() => setShowInviteModal(true)} />
          </div>
        </div>
      </div>

      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}
    </>
  );
}
