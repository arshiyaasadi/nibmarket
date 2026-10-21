"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Users, Zap, Trophy, List } from "lucide-react";
import {
  useCompetitionPool,
  useCompetitionHistory,
  useLeaderboardCurrentMonth,
  useLeaderboardMySubsets,
} from "@/features/leaderboard/queries";
import { useSubsetDeposits } from "@/features/dashboard/queries";
import { InviteModal } from "@/components/organisms/network/InviteModal";
import { InviteKycGateModal } from "@/components/organisms/network/InviteKycGateModal";
import { useInviteLauncher } from "@/features/network/use-invite-launcher";
import { MarketingBadgesSection } from "@/components/molecules/MarketingBadgesSection";
import { Modal, ModalBody } from "@/components/atoms/Modal";
import { JALALI_MONTH_NAMES, jalaliPartsFromDate } from "@/lib/datetime/jalali";
import { cn, formatDateRange } from "@/lib/utils";
import { useMarketingBadges } from "@/features/missions/queries";
import type { CompetitionPeriod, CompetitionPool, LeaderboardEntry } from "@/types/mlm";

/** Query key for selected competition period on `/dashboard/leaderboard`. */
const PERIOD_QUERY = "period";
const PERIOD_CURRENT = "current";

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

function jalaliMonthYear(dateStr: string | undefined): { month: string; year: string } {
  if (!dateStr) return { month: "—", year: "—" };
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return { month: "—", year: "—" };
  const { month, year } = jalaliPartsFromDate(d);
  return {
    month: JALALI_MONTH_NAMES[month - 1] ?? "—",
    year: year.toLocaleString("fa-IR"),
  };
}

// ── Competition period bar + history modal ────────────────────────────────────

type PeriodSelection = { kind: "current" } | { kind: "past"; period: CompetitionPeriod };

function periodLabelFromSelection(
  selection: PeriodSelection,
  pool: CompetitionPool | null | undefined,
): { month: string; year: string; title: string } {
  if (selection.kind === "past") {
    const my = jalaliMonthYear(selection.period.startDate);
    return { ...my, title: selection.period.title };
  }
  const my = jalaliMonthYear(pool?.startDate);
  return { ...my, title: tPeriodTitle(my.month, my.year) };
}

function tPeriodTitle(month: string, year: string) {
  return `${month} ${year}`;
}

function CompetitionPeriodBar({
  selection,
  onOpenList,
}: {
  selection: PeriodSelection;
  onOpenList: () => void;
}) {
  const t = useTranslations("leaderboard");
  const { data: pool, isLoading } = useCompetitionPool();
  const { month, year } = periodLabelFromSelection(selection, pool);
  const isCurrent = selection.kind === "current";

  return (
    <div className="border-border bg-surface flex items-center justify-between gap-3 rounded-2xl border px-4 py-3">
      <div className="flex min-w-0 flex-wrap items-center gap-2">
        {isLoading ? (
          <div className="bg-border h-5 w-40 animate-pulse rounded" />
        ) : (
          <>
            <p className="text-foreground text-sm font-bold">
              {t("periodBarMonthYear", { month, year })}
            </p>
            <span
              className={cn(
                "rounded-lg px-2 py-0.5 text-[10px] font-bold",
                isCurrent
                  ? "bg-primary/15 text-primary"
                  : "bg-surface-2 text-muted border-border border",
              )}
            >
              {isCurrent ? t("periodBarCurrentTag") : t("periodBarPastTag")}
            </span>
          </>
        )}
      </div>
      <button
        type="button"
        onClick={onOpenList}
        aria-label={t("periodBarEditAria")}
        className="border-border text-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition"
      >
        <List className="size-3.5" />
        {t("periodBarListBtn")}
      </button>
    </div>
  );
}

function periodRowClass(selected: boolean) {
  return cn(
    "flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-start transition",
    selected
      ? "border-primary/45 bg-primary/10 ring-primary/25 ring-1"
      : "border-border bg-background hover:bg-surface-2",
  );
}

function CompetitionHistoryModal({
  open,
  onClose,
  pool,
  history,
  selection,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  pool: CompetitionPool | null;
  history: CompetitionPeriod[];
  selection: PeriodSelection;
  onSelect: (next: PeriodSelection) => void;
}) {
  const t = useTranslations("leaderboard");
  const currentTitle = pool
    ? tPeriodTitle(jalaliMonthYear(pool.startDate).month, jalaliMonthYear(pool.startDate).year)
    : t("periodLabel");

  function pick(next: PeriodSelection) {
    onSelect(next);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title={t("periodModalTitle")} size="sm">
      <ModalBody className="flex flex-col gap-2">
        <ul className="flex max-h-72 flex-col gap-1.5 overflow-y-auto">
          <li>
            <button
              type="button"
              onClick={() => pick({ kind: "current" })}
              className={periodRowClass(selection.kind === "current")}
              aria-current={selection.kind === "current" ? "true" : undefined}
            >
              <p className="text-foreground text-sm font-semibold">{currentTitle}</p>
              <span className="text-muted bg-surface-2 shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-medium">
                {t("periodModalCurrentBadge")}
              </span>
            </button>
          </li>

          {history.length === 0 ? (
            <li className="text-muted py-6 text-center text-xs">{t("periodModalEmptyPast")}</li>
          ) : (
            history.map((p) => {
              const selected = selection.kind === "past" && selection.period.id === p.id;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => pick({ kind: "past", period: p })}
                    className={periodRowClass(selected)}
                    aria-current={selected ? "true" : undefined}
                  >
                    <p className="text-foreground text-sm font-semibold">{p.title}</p>
                    <span className="text-muted bg-surface-2 shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-medium">
                      {t("periodModalPastBadge")}
                    </span>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </ModalBody>
    </Modal>
  );
}

// ── MyRankCard ────────────────────────────────────────────────────────────────

function MyRankCard({ onInvite, selection }: { onInvite: () => void; selection: PeriodSelection }) {
  const t = useTranslations("leaderboard");
  const { data: pool, isLoading: poolLoading } = useCompetitionPool();
  const { data: subsetDeposits, isLoading: subsetsLoading } = useSubsetDeposits();

  const isLoading = poolLoading || subsetsLoading;
  const hasSubsets = (subsetDeposits?.activeSubsets ?? 0) > 0;
  const isPast = selection.kind === "past";
  const past = isPast ? selection.period : null;

  const { days, hours, pct } = useMemo(
    () => (pool && !isPast ? timeRemaining(pool.endDate) : { days: 0, hours: 0, pct: 100 }),
    [pool, isPast],
  );

  const displayRank = isPast ? past?.myRank : pool?.myRank;
  const periodCaption = isPast ? t("periodEndedLabel") : t("periodLabel");
  const periodTitle = isPast ? past?.title : pool?.contextTitle;

  return (
    <div className="order-2 flex min-w-0 flex-1 flex-col gap-3 lg:order-1">
      <h2 className="text-foreground text-base font-bold">{t("myRankTitle")}</h2>
      <div className="border-border bg-surface flex h-full flex-1 flex-col gap-4 rounded-2xl border p-5">
        {isLoading ? (
          <div className="flex h-28 items-center justify-center">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        ) : !hasSubsets && !isPast ? (
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
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="border-primary bg-primary/10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border-2">
                <span className="text-primary text-2xl font-black" dir="ltr">
                  {displayRank != null ? `#${persianNum(displayRank)}` : "—"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-muted text-xs">{periodCaption}</p>
                <p className="text-foreground mt-0.5 font-semibold">{periodTitle}</p>
                {isPast && past?.winnerName ? (
                  <p className="text-muted mt-1 text-xs">
                    <span className="text-foreground font-medium">{past.winnerName}</span>{" "}
                    {t("winner")}
                  </p>
                ) : null}
                {isPast && (past?.myReward ?? 0) > 0 ? (
                  <p className="mt-1 text-xs font-medium text-green-600 dark:text-green-400">
                    +{formatBig(past!.myReward!)} {t("twin")}
                  </p>
                ) : null}
                {isPast && past?.myRank == null ? (
                  <p className="text-muted mt-1 text-xs">{t("notParticipated")}</p>
                ) : null}
              </div>
            </div>

            {!isPast ? (
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
            ) : (
              <p className="text-muted text-xs">
                {formatDateRange(past!.startDate, past!.endDate)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── PoolVolumeCard ────────────────────────────────────────────────────────────

function PoolVolumeCard({ selection }: { selection: PeriodSelection }) {
  const t = useTranslations("leaderboard");
  const { data: pool, isLoading } = useCompetitionPool();
  const isPast = selection.kind === "past";
  const past = isPast ? selection.period : null;

  const totalPool = isPast ? (past?.totalPool ?? 0) : (pool?.totalPool ?? 0);
  const changePositive = (pool?.dailyChange ?? 0) >= 0;

  return (
    <div className="order-1 flex w-full flex-col gap-3 lg:order-2 lg:w-[42%]">
      <h2 className="text-foreground text-base font-bold">
        {isPast ? t("poolTitlePast") : t("poolTitle")}
      </h2>
      <div className="border-border bg-surface flex h-full flex-1 flex-col gap-4 rounded-2xl border p-5">
        {isLoading ? (
          <div className="flex h-28 items-center justify-center">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div>
              <p className="text-foreground text-3xl font-black tabular-nums">
                {formatBig(totalPool)}
              </p>
              <p className="text-muted mt-0.5 text-xs">{t("twin")}</p>
            </div>

            {!isPast ? (
              <div className="flex items-center gap-2">
                <span
                  className={`text-sm font-semibold ${changePositive ? "text-green-600 dark:text-green-400" : "text-red-500"}`}
                >
                  {changePositive ? "▲" : "▼"} {formatBig(Math.abs(pool?.dailyChange ?? 0))}
                </span>
                <span className="text-muted text-xs">{t("dailyChange")}</span>
              </div>
            ) : past?.winnerName ? (
              <p className="text-muted text-sm">
                {t("winner")}:{" "}
                <span className="text-foreground font-semibold">{past.winnerName}</span>
              </p>
            ) : null}

            <div className="bg-border h-px" />

            {!isPast ? (
              <>
                <div className="text-muted flex items-center gap-2 text-sm">
                  <Users size={14} />
                  <span>
                    <span className="text-foreground font-semibold">
                      {persianNum(pool?.participantCount ?? 0)}
                    </span>{" "}
                    {t("participants")}
                  </span>
                </div>
                <p className="text-muted text-xs">
                  <span className="text-primary font-semibold">{t("topWinnersNote")}</span>
                </p>
              </>
            ) : (
              <p className="text-muted text-xs">
                {formatDateRange(past!.startDate, past!.endDate)}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Info Banner ───────────────────────────────────────────────────────────────

function InfoBanner({ selection }: { selection: PeriodSelection }) {
  const t = useTranslations("leaderboard");
  const { data: pool } = useCompetitionPool();
  const isPast = selection.kind === "past";
  const past = isPast ? selection.period : null;

  const growthAmount = useMemo(() => {
    if (!pool || isPast) return 0;
    return pool.dailyChange * 15;
  }, [pool, isPast]);

  const range =
    isPast && past
      ? formatDateRange(past.startDate, past.endDate)
      : pool
        ? formatDateRange(pool.startDate, pool.endDate)
        : null;

  return (
    <div className="border-primary/20 bg-primary/5 px-pad-mol py-pad-atom-md flex items-start gap-3 rounded-2xl border">
      <Zap className="text-primary mt-0.5 size-5 shrink-0" />
      <div className="text-foreground flex-1 text-sm">
        <p>{t("infoBannerText")}</p>
        {range && (
          <p className="text-muted mt-1 text-xs">
            {range}
            {!isPast ? (
              <>
                {"  "}
                <span className="font-semibold text-green-600 dark:text-green-400">
                  ▲ {formatBig(growthAmount)} تنوین
                </span>{" "}
                {t("poolGrowthLabel")}
              </>
            ) : null}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Pool leaderboard boards ───────────────────────────────────────────────────
// TODO(backend-leaderboard-pool): ensure GET /leaderboard/current-month and
// GET /leaderboard/my-subsets return subsetCount and top-7 pool participants.

function rankAccent(rank: number) {
  if (rank === 1) return "border-yellow-500/40 bg-yellow-500/[0.08]";
  if (rank === 2) return "border-border bg-surface-2/80";
  if (rank === 3) return "border-amber-700/25 bg-amber-700/[0.06]";
  return "border-transparent bg-transparent";
}

function RankBadge({ rank }: { rank: number }) {
  if (rank <= 3) {
    return (
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-full text-xs font-black",
          rank === 1 && "bg-yellow-400/25 text-yellow-700 dark:text-yellow-400",
          rank === 2 && "bg-muted/20 text-muted",
          rank === 3 && "bg-amber-700/20 text-amber-800 dark:text-amber-400",
        )}
      >
        {rank === 1 ? <Trophy className="size-3.5" /> : persianNum(rank)}
      </span>
    );
  }
  return (
    <span className="text-primary flex size-8 items-center justify-center text-sm font-bold tabular-nums">
      {persianNum(rank)}
    </span>
  );
}

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
  const top5 = entries.slice(0, 5);

  return (
    <div className="border-border bg-surface flex h-[22rem] max-h-[22rem] flex-col overflow-hidden rounded-2xl border">
      <div className="border-border flex shrink-0 items-center justify-between border-b px-4 py-3">
        <h3 className="text-foreground text-sm font-bold">{title}</h3>
        <span className="text-muted text-[11px] font-medium">{t("topFiveNote")}</span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden p-3">
        {isLoading ? (
          <div className="flex h-full min-h-[10rem] items-center justify-center">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        ) : top5.length === 0 ? (
          <p className="text-muted py-10 text-center text-sm">{t("boardEmpty")}</p>
        ) : (
          <ol className="flex flex-col gap-2">
            {top5.map((entry) => (
              <li
                key={entry.userId}
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-3 py-2.5",
                  rankAccent(entry.rank),
                  entry.isSelf && "ring-primary/30 ring-1",
                )}
              >
                <RankBadge rank={entry.rank} />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-semibold">
                    {entry.fullName}
                    {entry.isSelf ? (
                      <span className="text-primary ms-1.5 text-[10px] font-bold">شما</span>
                    ) : null}
                  </p>
                  <p className="text-muted mt-0.5 text-[11px] tabular-nums">
                    {entry.subsetCount != null ? `${persianNum(entry.subsetCount)} زیرمجموعه` : "—"}
                  </p>
                </div>
                <div className="shrink-0 text-end">
                  <p className="text-primary text-sm font-black tabular-nums">
                    {formatBig(entry.tokens)}
                  </p>
                  <p className="text-muted text-[10px]">تنوین</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

/** Full direct-subset ranking — vertical scroll only, no horizontal overflow. */
function MySubsetsLeaderboardTable({
  entries,
  isLoading,
}: {
  entries: LeaderboardEntry[];
  isLoading: boolean;
}) {
  const t = useTranslations("leaderboard");

  return (
    <div className="border-border bg-surface flex h-[22rem] max-h-[22rem] flex-col overflow-hidden rounded-2xl border">
      <div className="border-border flex shrink-0 items-center justify-between border-b px-4 py-3">
        <h3 className="text-foreground text-sm font-bold">{t("mySubsetsBoardTitle")}</h3>
        <span className="text-muted text-[11px] font-medium">
          {isLoading ? "…" : t("allSubsetsNote")}
          {!isLoading && entries.length > 0 ? ` · ${persianNum(entries.length)}` : null}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
        {isLoading ? (
          <div className="flex h-full min-h-[10rem] items-center justify-center">
            <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-muted py-10 text-center text-sm">{t("boardEmpty")}</p>
        ) : (
          <table className="w-full table-fixed border-collapse text-sm">
            <colgroup>
              <col className="w-[3.25rem]" />
              <col />
              <col className="w-[4.5rem]" />
              <col className="w-[5.5rem]" />
            </colgroup>
            <thead className="bg-surface sticky top-0 z-[1]">
              <tr className="border-border bg-background text-muted border-b text-[11px]">
                <th className="px-2 py-2.5 text-center font-semibold">{t("colRank")}</th>
                <th className="px-2 py-2.5 text-start font-semibold">{t("colName")}</th>
                <th className="px-2 py-2.5 text-center font-semibold">{t("colSubsetCount")}</th>
                <th className="px-2 py-2.5 text-end font-semibold">{t("colTokens")}</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, i) => (
                <tr
                  key={entry.userId}
                  className={cn(
                    "border-border/50 border-b last:border-b-0",
                    i % 2 === 1 && "bg-background/40",
                    entry.rank === 1 && "bg-yellow-500/[0.06]",
                    entry.rank === 2 && "bg-muted/5",
                    entry.rank === 3 && "bg-amber-700/[0.05]",
                  )}
                >
                  <td className="px-2 py-2 text-center align-middle">
                    <span className="text-foreground inline-flex justify-center text-xs font-bold tabular-nums">
                      {persianNum(entry.rank)}
                    </span>
                  </td>
                  <td className="text-foreground truncate px-2 py-2 align-middle font-medium">
                    {entry.fullName}
                  </td>
                  <td className="text-muted px-2 py-2 text-center align-middle tabular-nums">
                    {entry.subsetCount != null ? persianNum(entry.subsetCount) : "—"}
                  </td>
                  <td className="text-primary px-2 py-2 text-end align-middle font-bold tabular-nums">
                    {formatBig(entry.tokens)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function PoolLeaderboardsSection({ isPast }: { isPast: boolean }) {
  const t = useTranslations("leaderboard");
  const { data: currentMonth = [], isLoading: loadingCurrent } = useLeaderboardCurrentMonth();
  const { data: mySubsets = [], isLoading: loadingSubsets } = useLeaderboardMySubsets();

  if (isPast) {
    return (
      <div className="border-border bg-surface rounded-2xl border px-4 py-8 text-center">
        <p className="text-muted text-sm">{t("pastBoardsHint")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-start">
      <LeaderboardBoardCard
        title={t("currentMonthBoardTitle")}
        entries={currentMonth}
        isLoading={loadingCurrent}
      />
      <MySubsetsLeaderboardTable entries={mySubsets} isLoading={loadingSubsets} />
    </div>
  );
}

function HonorsSection() {
  const t = useTranslations("leaderboard");
  const { data: badgeItems = [] } = useMarketingBadges();

  return <MarketingBadgesSection title={t("honorsTitle")} items={badgeItems} />;
}

// ── Page Root ─────────────────────────────────────────────────────────────────

export function LeaderboardClient() {
  const { openInvite, showGate, closeGate, showInvite, closeInvite } = useInviteLauncher();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: pool } = useCompetitionPool();
  const { data: history = [] } = useCompetitionHistory();
  const [listOpen, setListOpen] = useState(false);

  const periodParam = searchParams.get(PERIOD_QUERY);

  const selection: PeriodSelection = useMemo(() => {
    if (!periodParam || periodParam === PERIOD_CURRENT) return { kind: "current" };
    const match = history.find((p) => p.id === periodParam);
    if (match) return { kind: "past", period: match };
    return { kind: "current" };
  }, [periodParam, history]);

  const setSelection = useCallback(
    (next: PeriodSelection) => {
      const sp = new URLSearchParams(searchParams.toString());
      if (next.kind === "current") {
        sp.delete(PERIOD_QUERY);
      } else {
        sp.set(PERIOD_QUERY, next.period.id);
      }
      const qs = sp.toString();
      router.replace(qs ? `?${qs}` : "?", { scroll: false });
    },
    [router, searchParams],
  );

  const isPast = selection.kind === "past";

  return (
    <div className="flex flex-col gap-4">
      <CompetitionPeriodBar selection={selection} onOpenList={() => setListOpen(true)} />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <MyRankCard onInvite={openInvite} selection={selection} />
        <PoolVolumeCard selection={selection} />
      </div>

      <HonorsSection />

      <InfoBanner selection={selection} />
      <PoolLeaderboardsSection isPast={isPast} />

      <CompetitionHistoryModal
        open={listOpen}
        onClose={() => setListOpen(false)}
        pool={pool ?? null}
        history={history}
        selection={selection}
        onSelect={setSelection}
      />

      <InviteKycGateModal open={showGate} onClose={closeGate} />
      {showInvite && <InviteModal onClose={closeInvite} />}
    </div>
  );
}
