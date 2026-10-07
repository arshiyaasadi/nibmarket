export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SESSION_EXPIRED: "/session-expired",
  LOGOUT_INCOMPLETE: "/logout-incomplete",
  /** SMS invite entry: /invite/:code or /invite/:code/:fundId */
  INVITE: (code: string, fundId?: string): string =>
    fundId
      ? `/invite/${encodeURIComponent(code)}/${encodeURIComponent(fundId)}`
      : `/invite/${encodeURIComponent(code)}`,
  /** Post-login invite landing (auto-register referrer) */
  INVITE_WELCOME: "/invite/welcome",
  DASHBOARD: "/dashboard",

  NETWORK: {
    ROOT: "/dashboard/network",
  },

  REPORTS: {
    SUBSETS: "/dashboard/reports/subsets",
    INCOME: "/dashboard/reports/income",
  },

  WALLET: "/dashboard/wallet",
  SUBSET_DEPOSITS: "/dashboard/subset-deposits",

  LEADERBOARD: {
    POOL: "/dashboard/leaderboard",
  },

  MISSIONS: "/dashboard/missions",

  CAPITAL: "/dashboard/capital",
  NOTIFICATIONS: "/dashboard/notifications",

  COMPETITION: {
    PARTICIPATE: "/dashboard/competition/participate",
    RECORDS: "/dashboard/competition/records",
    PRIZES: "/dashboard/competition/prizes",
  },

  RULES: "/dashboard/rules",
  SUPPORT: "/dashboard/support",

  ADMIN: {
    ROOT: "/admin",
    USERS: "/admin/users",
    USER_DETAIL: (userId: string) => `/admin/users/${userId}` as const,
    TWIN: "/admin/twin",
    POOL: "/admin/pool",
    SEDIMENT: "/admin/sediment",
    REPORTS: "/admin/reports",
    NOTIFICATIONS: "/admin/notifications",
    USER_MAP: "/admin/map",
  },
} as const;
