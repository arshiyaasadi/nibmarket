import { ROUTES } from "@/config/routes";

/** i18n keys under `nav.pageTitles.*` — full brand only on dashboard home. */
export type PanelPageTitleKey =
  | "wallet"
  | "missions"
  | "leaderboardPool"
  | "network"
  | "subsetDeposits"
  | "capital"
  | "notifications"
  | "rules"
  | "support"
  | "reportsSubsets"
  | "reportsIncome"
  | "competitionParticipate"
  | "competitionRecords"
  | "competitionPrizes";

export type PanelNavTitle = { kind: "brand" } | { kind: "page"; key: PanelPageTitleKey };

function normalizePath(pathname: string): string {
  if (!pathname || pathname === "/") return pathname;
  return pathname.replace(/\/+$/, "") || "/";
}

/** Resolve navbar title from the current panel pathname. */
export function resolvePanelNavTitle(pathname: string): PanelNavTitle {
  const path = normalizePath(pathname);

  if (path === ROUTES.DASHBOARD) return { kind: "brand" };

  const rules: Array<{ prefix: string; key: PanelPageTitleKey }> = [
    { prefix: ROUTES.WALLET, key: "wallet" },
    { prefix: ROUTES.MISSIONS, key: "missions" },
    { prefix: ROUTES.LEADERBOARD.POOL, key: "leaderboardPool" },
    { prefix: ROUTES.NETWORK.ROOT, key: "network" },
    { prefix: ROUTES.SUBSET_DEPOSITS, key: "subsetDeposits" },
    { prefix: ROUTES.CAPITAL, key: "capital" },
    { prefix: ROUTES.NOTIFICATIONS, key: "notifications" },
    { prefix: ROUTES.RULES, key: "rules" },
    { prefix: ROUTES.SUPPORT, key: "support" },
    { prefix: ROUTES.REPORTS.SUBSETS, key: "reportsSubsets" },
    { prefix: ROUTES.REPORTS.INCOME, key: "reportsIncome" },
    { prefix: ROUTES.COMPETITION.PARTICIPATE, key: "competitionParticipate" },
    { prefix: ROUTES.COMPETITION.RECORDS, key: "competitionRecords" },
    { prefix: ROUTES.COMPETITION.PRIZES, key: "competitionPrizes" },
  ];

  // Longest prefix wins
  const match = [...rules]
    .sort((a, b) => b.prefix.length - a.prefix.length)
    .find((r) => {
      return path === r.prefix || path.startsWith(`${r.prefix}/`);
    });

  if (match) return { kind: "page", key: match.key };
  return { kind: "brand" };
}
