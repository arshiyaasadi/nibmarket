// Single source of truth for all API paths.
// Features/services must import from here — no hardcoded strings.
//
// Client-facing BFF version: /api/v2
// External backend version (API_SERVICE_MODE=api): /api/v2 — see config/api-service.ts

export const BFF_API_VERSION = "v2";
export const BACKEND_API_VERSION = "v2";
export const BFF_API_BASE = `/api/${BFF_API_VERSION}` as const;

export const ENDPOINTS = {
  AUTH: {
    CHECK_MOBILE: "/auth/check-mobile",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    SSO_EXCHANGE: "/auth/sso/exchange",
    SSO_COMPLETE: "/auth/sso/complete",
    REGISTER_OTP_SEND: "/auth/register/otp/send",
    REGISTER_OTP_VERIFY: "/auth/register/otp/verify",
    REGISTER: "/auth/register",
  },
  DASHBOARD: {
    REWARDS: "/dashboard/rewards",
    WALLET: "/dashboard/wallet",
    REFERRAL: "/dashboard/referral",
    LEADERBOARD: "/dashboard/leaderboard",
    CHARTS: "/dashboard/charts",
    SUBSET_DEPOSITS: "/dashboard/subset-deposits",
  },
  NETWORK: {
    SUBSETS: "/network/subsets",
    TREE: "/network/tree",
    SEND_INVITE: "/network/send-invite",
    SUBMIT_REFERRER: "/network/submit-referrer",
    INVITED: "/network/invited",
    FUNDS: "/network/funds",
    INVITE_QUOTA: "/network/invite-quota",
    INVITE_TEMPLATES: "/network/invite-templates",
  },
  REPORTS: {
    SUBSETS: "/reports/subsets",
    INCOME: "/reports/income",
    CAPITAL: "/reports/capital-deposit",
  },
  WALLET: {
    SUMMARY: "/wallet/summary",
    TRANSACTIONS: "/wallet/transactions",
    TOKEN_PRICE: "/wallet/token-price",
  },
  SUBSET_DEPOSITS: {
    SUMMARY: "/dashboard/subset-deposits",
    TRANSACTIONS: "/subset-deposits/transactions",
    RULES: "/subset-deposits/rules",
  },
  CAPITAL: {
    FUNDS: "/capital/funds",
  },
  LEADERBOARD: {
    POOL_BALANCE: "/leaderboard/pool-balance",
    CURRENT_MONTH: "/leaderboard/current-month",
    MY_SUBSETS: "/leaderboard/my-subsets",
    LAST_MONTH: "/leaderboard/last-month",
    HONORS: "/leaderboard/honors",
    MISSIONS: "/leaderboard/missions",
    COMPETITION_POOL: "/leaderboard/competition-pool",
    HISTORY: "/leaderboard/history",
  },
  MISSIONS: {
    LIST: "/missions/list",
    ACTIVITY: "/missions/activity",
  },
  NOTIFICATIONS: {
    LIST: "/notifications",
    ACTIVITY: "/notifications/activity",
  },
  ADMIN: {
    AUTH: {
      LOGIN: "/admin/auth/login",
    },
    STATS: "/admin/stats",
    USERS: {
      LIST: "/admin/users",
      DEMOGRAPHICS: "/admin/users/demographics",
      GEO: "/admin/users/geo",
      DETAIL: (userId: string) => `/admin/users/${userId}` as const,
      UPDATE_STATUS: (userId: string) => `/admin/users/${userId}/status` as const,
      UPDATE_ROLE: (userId: string) => `/admin/users/${userId}/role` as const,
    },
    NETWORK: {
      CLOSURE: "/admin/network/closure",
      INVITES_OVERVIEW: "/admin/network/invites/overview",
      INVITES_LOG: "/admin/network/invites/log",
      INVITE_TEMPLATES: "/admin/network/invite-templates",
      CREATE_INVITE_TEMPLATE: "/admin/network/invite-templates",
      UPDATE_INVITE_TEMPLATE: (templateId: string) =>
        `/admin/network/invite-templates/${templateId}` as const,
    },
    MISSIONS: {
      LIST: "/admin/missions/list",
      OVERVIEW: "/admin/missions/overview",
      JOBS_HEALTH: "/admin/missions/jobs/health",
      COMPLETIONS: "/admin/missions/completions",
      UPDATE_STATUS: (missionId: string) => `/admin/missions/${missionId}/status` as const,
    },
    TWIN: {
      OVERVIEW: "/admin/twin/overview",
      ALLOCATIONS: "/admin/twin/allocations",
    },
    POOL: {
      OVERVIEW: "/admin/pool/overview",
      PARTICIPANTS: "/admin/pool/participants",
      PERIODS: "/admin/pool/periods",
    },
    SEDIMENT: {
      OVERVIEW: "/admin/sediment/overview",
      JOB: "/admin/sediment/job",
      ASSETS: "/admin/sediment/assets",
      DEPOSITS: "/admin/sediment/deposits",
    },
  },
} as const;
