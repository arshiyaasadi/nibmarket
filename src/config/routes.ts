export const ROUTES = {
  LOGIN: "/login",
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
    REPORTS: "/admin/reports",
  },
} as const;
