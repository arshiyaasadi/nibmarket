"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Users, Zap, Trophy, Medal } from "lucide-react";
import {
  useCompetitionPool,
  useCompetitionHistory,
  useLeaderboardHonors,
  useLeaderboardCurrentMonth,
  useLeaderboardMySubsets,
} from "@/features/leaderboard/queries";
import { useSubsetDeposits } from "@/features/dashboard/queries";
import { InviteModal } from "@/components/organisms/network/InviteModal";
import { formatDateRange, formatDisplayDate } from "@/lib/utils";
import type { CompetitionPeriod, HonorItem, LeaderboardEntry } from "@/types/mlm";

// ── Helpers ───────────────────────────────────────────────────────────────────

function persianNum(n: number): string {
  return n.toLocaleString("fa-IR");
}

function formatBig(n: number): string {
  return n.toLocaleString("fa-IR");
}

function timeRemaining(endDateStr: string): { days: number; hours: number; pct: number } {
  const now = new Date();
  const end = new Date(endDateStr);
  if (Number.isNaN(end.getTime())) return { days: 0, hours: 0, pct: 0 };
  const diffMs = end.getTime() - now.getTime();
  if (diffMs <= 0) return { days: 0, hours: 0, pct: 100 };
  const days = Math.floor(diffMs / 86_400_000);
  const hours = Math.floor((diffMs % 86_400_000) / 3_600_000);
  const totalDays = 30;
  const pct = Math.min(100, Math.max(0, ((totalDays - days) / totalDays) * 100));
  return { days, hours, pct };
}

// ── MyRankCard ────────────────────────────────────────────────────────────────

function MyRankCard({ onInvite }: { onInvite: () => void }) {
  const t = useTranslations("leaderboard");
  const { data: pool, isLoading: poolLoading } = useCompetitionPool();
  const { data: subsetDeposits, isLoading: subsetsLoading } = useSubsetDeposits();

  const isLoading = poolLoading || subsetsLoading;
  const hasSubsets = (subsetDeposits?.activeSubsets ?? 0) > 0;
  const { days, hours, pct } = useMemo(
    () => (pool ? timeRemaining(pool.endDate) : { days: 0, hours: 0, pct: 0 }),
    [pool],
  );

  return (
    <div className="order-2 flex min-w-0 flex-1 flex-col gap-3 lg:order-1">
      <h2 className="text-foreground text-base font-bold">{t("myRankTitle")}</h2>
      <div className="border-border bg-surface flex h-full flex-1 flex-col gap-4 rounded-2xl border p-5">
        {isLoading ? (
          <div className="flex h-28 items-center justify-center">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        ) : !hasSubsets ? (
          /* ── No subsets: invite CTA ── */
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-full">
              <Users size={26} className="text-primary" />
            </div>
            <div>
              <p className="text-foreground font-semibold">{t("noSubsetsTitle")}</p>
              <p className="text-muted mt-1 text-sm">{t("noSubsetsDesc")}</p>
            </div>
            <button
              onClick={onInvite}
              className="bg-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <Users size={15} />
              {t("inviteBtn")}
            </button>
          </div>
        ) : (
          /* ── Has rank ── */
          <div className="flex flex-col gap-4">
            {/* Rank badge */}
            <div className="flex items-center gap-4">
              <div className="border-primary bg-primary/10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border-2">
                <span className="text-primary text-2xl font-black" dir="ltr">
                  #{pool?.myRank ? persianNum(pool.myRank) : "—"}
                </span>
              </div>
              <div>
                <p className="text-muted text-xs">{t("periodLabel")}</p>
                <p className="text-foreground mt-0.5 font-semibold">{pool?.contextTitle}</p>
              </div>
            </div>

            {/* Time remaining */}
            <div>
              <div className="text-muted mb-1.5 flex items-center justify-between text-xs">
                <span>{t("timeRemaining")}</span>
                <span className="text-foreground font-medium">
                  {persianNum(days)} {t("days")} {persianNum(hours)} {t("hours")}
                </span>
              </div>
              <div className="bg-border h-1.5 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── PoolVolumeCard ────────────────────────────────────────────────────────────

function PoolVolumeCard() {
  const t = useTranslations("leaderboard");
  const { data: pool, isLoading } = useCompetitionPool();

  const changePositive = (pool?.dailyChange ?? 0) >= 0;

  return (
    <div className="order-1 flex w-full flex-col gap-3 lg:order-2 lg:w-[42%]">
      <h2 className="text-foreground text-base font-bold">{t("poolTitle")}</h2>
      <div className="border-border bg-surface flex h-full flex-1 flex-col gap-4 rounded-2xl border p-5">
        {isLoading ? (
          <div className="flex h-28 items-center justify-center">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Main number */}
            <div>
              <p className="text-foreground text-3xl font-black tabular-nums">
                {formatBig(pool?.totalPool ?? 0)}
              </p>
              <p className="text-muted mt-0.5 text-xs">{t("twin")}</p>
            </div>

            {/* Daily change */}
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-semibold ${changePositive ? "text-green-600 dark:text-green-400" : "text-red-500"}`}
              >
                {changePositive ? "▲" : "▼"} {formatBig(Math.abs(pool?.dailyChange ?? 0))}
              </span>
              <span className="text-muted text-xs">{t("dailyChange")}</span>
            </div>

            <div className="bg-border h-px" />

            {/* Participants */}
            <div className="text-muted flex items-center gap-2 text-sm">
              <Users size={14} />
              <span>
                <span className="text-foreground font-semibold">
                  {persianNum(pool?.participantCount ?? 0)}
                </span>{" "}
                {t("participants")}
              </span>
            </div>

            {/* Top winners note */}
            <p className="text-muted text-xs">
              <span className="text-primary font-semibold">
                {persianNum(pool?.topWinners ?? 0)}
              </span>{" "}
              {t("topWinnersNote")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Info Banner ───────────────────────────────────────────────────────────────

function InfoBanner() {
  const t = useTranslations("leaderboard");
  const { data: pool } = useCompetitionPool();

  const growthAmount = useMemo(() => {
    if (!pool) return 0;
    // Approximate: dailyChange × 15 days (mid-period)
    return pool.dailyChange * 15;
  }, [pool]);

  return (
    <div className="border-primary/20 bg-primary/5 px-pad-mol py-pad-atom-md flex items-start gap-3 rounded-2xl border">
      <Zap className="text-primary mt-0.5 size-5 shrink-0" />
      <div className="text-foreground flex-1 text-sm">
        <p>{t("infoBannerText")}</p>
        {pool && (
          <p className="text-muted mt-1 text-xs">
            {formatDateRange(pool.startDate, pool.endDate)}
            {"  "}
            <span className="font-semibold text-green-600 dark:text-green-400">
              ▲ {formatBig(growthAmount)} تنوین
            </span>{" "}
            {t("poolGrowthLabel")}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Pool leaderboard boards ───────────────────────────────────────────────────
// TODO(backend-leaderboard-pool): ensure GET /leaderboard/current-month and
// GET /leaderboard/my-subsets return subsetCount and top-7 pool participants.

function LeaderboardBoardCard({
  title,
  entries,
  isLoading,
}: {
  title: string;
  entries: LeaderboardEntry[];
  isLoading: boolean;
}) {
  const t = useTranslations("leaderboard");

  return (
    <div className="border-border bg-surface flex h-[22rem] flex-col rounded-2xl border">
      <div className="border-border shrink-0 border-b px-4 py-3">
        <h3 className="text-foreground text-sm font-bold">{title}</h3>
      </div>

      <div className="border-border text-muted grid shrink-0 grid-cols-[2.5rem_1fr_5.5rem_5.5rem] gap-2 border-b px-4 py-2 text-[11px] font-semibold">
        <span>{t("colRank")}</span>
        <span>{t("colName")}</span>
        <span className="text-end">{t("colSubsetCount")}</span>
        <span className="text-end">{t("colTokens")}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-muted py-10 text-center text-sm">{t("boardEmpty")}</p>
        ) : (
          <ul className="divide-border divide-y">
            {entries.slice(0, 7).map((entry) => (
              <li
                key={entry.userId}
                className="grid grid-cols-[2.5rem_1fr_5.5rem_5.5rem] items-center gap-2 px-4 py-2.5 text-xs"
              >
                <span className="text-primary font-bold tabular-nums">
                  {persianNum(entry.rank)}
                </span>
                <span className="text-foreground truncate font-medium">{entry.fullName}</span>
                <span className="text-muted text-end tabular-nums">
                  {entry.subsetCount != null ? persianNum(entry.subsetCount) : "—"}
                </span>
                <span className="text-foreground text-end font-semibold tabular-nums">
                  {formatBig(entry.tokens)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PoolLeaderboardsSection() {
  const t = useTranslations("leaderboard");
  const { data: currentMonth = [], isLoading: loadingCurrent } = useLeaderboardCurrentMonth();
  const { data: mySubsets = [], isLoading: loadingSubsets } = useLeaderboardMySubsets();

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
      <LeaderboardBoardCard
        title={t("currentMonthBoardTitle")}
        entries={currentMonth}
        isLoading={loadingCurrent}
      />
      <LeaderboardBoardCard
        title={t("mySubsetsBoardTitle")}
        entries={mySubsets}
        isLoading={loadingSubsets}
      />
    </div>
  );
}

// ── Competition History ───────────────────────────────────────────────────────

function HistoryCard({ period }: { period: CompetitionPeriod }) {
  const t = useTranslations("leaderboard");
  const isWinner = period.myRank === 1;
  const didParticipate = period.myRank != null;

  return (
    <div
      className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:gap-4 ${
        isWinner
          ? "border-yellow-400/60 bg-yellow-50/60 dark:border-yellow-500/30 dark:bg-yellow-900/10"
          : "border-border bg-surface"
      }`}
    >
      {/* Period badge */}
      <div className="flex-shrink-0">
        <span
          className={`inline-flex items-center rounded-xl px-3 py-1.5 text-xs font-bold ${
            isWinner
              ? "bg-yellow-400/20 text-yellow-700 dark:text-yellow-400"
              : "bg-surface border-border text-muted border"
          }`}
        >
          {isWinner && <Trophy size={12} className="me-1.5" />}
          {period.title}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
        <span className="text-muted">
          <span className="text-foreground font-medium">{period.winnerName}</span> {t("winner")}
        </span>
        <span className="text-muted">
          {t("poolAmount")}:{" "}
          <span className="text-foreground font-medium">
            {formatBig(period.totalPool)} {t("twin")}
          </span>
        </span>
      </div>

      {/* My result badge */}
      <div className="flex-shrink-0">
        {!didParticipate ? (
          <span className="text-muted text-xs">{t("notParticipated")}</span>
        ) : (
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold ${
                isWinner
                  ? "bg-yellow-400/20 text-yellow-700 dark:text-yellow-400"
                  : period.myRank! <= 5
                    ? "bg-primary/10 text-primary"
                    : "bg-surface border-border text-muted border"
              }`}
            >
              {t("myPosition")} #{persianNum(period.myRank!)}
            </span>
            {(period.myReward ?? 0) > 0 && (
              <span className="text-xs font-medium text-green-600 dark:text-green-400">
                +{formatBig(period.myReward!)} {t("twin")}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CompetitionHistorySection() {
  const t = useTranslations("leaderboard");
  const { data: history = [], isLoading } = useCompetitionHistory();

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-foreground text-base font-bold">{t("historyTitle")}</h2>
      <div className="border-border bg-surface rounded-2xl border p-5">
        {isLoading ? (
          <div className="flex h-24 items-center justify-center">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((p) => (
              <HistoryCard key={p.id} period={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Honors ────────────────────────────────────────────────────────────────────

function HonorCard({ honor }: { honor: HonorItem }) {
  const t = useTranslations("leaderboard");
  return (
    <div className="border-border bg-background flex items-start gap-3 rounded-2xl border p-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-yellow-100 dark:bg-yellow-900/30">
        <Medal size={20} className="text-yellow-600 dark:text-yellow-400" />
      </div>
      <div className="min-w-0">
        <p className="text-foreground font-semibold">{honor.title}</p>
        <p className="text-muted mt-0.5 text-xs">{honor.description}</p>
        <p className="text-muted/70 mt-1 text-[11px]">
          {t("honorAchievedAt")}: {formatDisplayDate(honor.achievedAt)}
        </p>
      </div>
    </div>
  );
}

function HonorsSection() {
  const t = useTranslations("leaderboard");
  const { data: honors = [], isLoading } = useLeaderboardHonors();

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-foreground flex items-center gap-2 text-base font-bold">
        <Trophy size={16} className="text-yellow-500" />
        {t("honorsTitle")}
      </h2>
      <div className="border-border bg-surface rounded-2xl border p-5">
        {isLoading ? (
          <div className="flex h-20 items-center justify-center">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        ) : honors.length === 0 ? (
          <p className="text-muted py-4 text-center text-sm">{t("noHonors")}</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {honors.map((h) => (
              <HonorCard key={h.id} honor={h} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page Root ─────────────────────────────────────────────────────────────────

export function LeaderboardClient() {
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1: My rank + Pool volume */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <MyRankCard onInvite={() => setShowInviteModal(true)} />
        <PoolVolumeCard />
      </div>

      {/* Row 2: Info banner */}
      <InfoBanner />

      {/* Row 3: Current month + my subsets boards */}
      <PoolLeaderboardsSection />

      {/* Row 4: History */}
      <CompetitionHistorySection />

      {/* Row 4: Honors */}
      <HonorsSection />

      {showInviteModal && <InviteModal onClose={() => setShowInviteModal(false)} />}
    </div>
  );
}
