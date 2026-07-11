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
} as const;
