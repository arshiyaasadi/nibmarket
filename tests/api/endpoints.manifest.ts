/**
 * Canonical list of BFF endpoints (same paths used by Prisma handlers).
 * External backend mirrors these under /api/v2{path}.
 */
export const API_ENDPOINTS = {
  AUTH: {
    CHECK_MOBILE: { method: "POST", path: "/auth/check-mobile", auth: false },
    LOGIN: { method: "POST", path: "/auth/login", auth: false },
    LOGOUT: { method: "POST", path: "/auth/logout", auth: true },
    REFRESH: { method: "POST", path: "/auth/refresh", auth: false },
    PROFILE: { method: "GET", path: "/auth/profile", auth: true },
  },
  DASHBOARD: {
    REWARDS: { method: "GET", path: "/dashboard/rewards", auth: true },
    WALLET: { method: "GET", path: "/dashboard/wallet", auth: true },
    REFERRAL: { method: "GET", path: "/dashboard/referral", auth: true },
    LEADERBOARD: { method: "GET", path: "/dashboard/leaderboard", auth: true },
    SUBSET_DEPOSITS: { method: "GET", path: "/dashboard/subset-deposits", auth: true },
    CHARTS: { method: "GET", path: "/dashboard/charts", auth: true },
  },
  WALLET: {
    SUMMARY: { method: "GET", path: "/wallet/summary", auth: true },
    TRANSACTIONS: { method: "GET", path: "/wallet/transactions", auth: true, query: "?page=1" },
    TOKEN_PRICE: { method: "GET", path: "/wallet/token-price", auth: false },
  },
  NETWORK: {
    SUBSETS: { method: "GET", path: "/network/subsets", auth: true },
    TREE: { method: "GET", path: "/network/tree", auth: true },
    INVITED: { method: "GET", path: "/network/invited", auth: true },
    FUNDS: { method: "GET", path: "/network/funds", auth: true },
    INVITE_QUOTA: { method: "GET", path: "/network/invite-quota", auth: true },
  },
  MISSIONS: {
    LIST: { method: "GET", path: "/missions/list", auth: true },
    ACTIVITY: { method: "GET", path: "/missions/activity", auth: true, query: "?page=1" },
    COMPLETE: { method: "POST", path: "/missions/complete", auth: true },
    SECTION_PROMOTION: { method: "GET", path: "/missions/sections/promotion", auth: true },
    SECTION_ONBOARDING: { method: "GET", path: "/missions/sections/onboarding", auth: true },
    SECTION_MARKETING: { method: "GET", path: "/missions/sections/marketing", auth: true },
    SECTION_BADGES: { method: "GET", path: "/missions/sections/badges", auth: true },
  },
  LEADS: {
    REGISTRATION_LINK: { method: "POST", path: "/leads/registration-link", auth: false },
  },
  LEADERBOARD: {
    POOL_BALANCE: { method: "GET", path: "/leaderboard/pool-balance", auth: true },
    CURRENT_MONTH: { method: "GET", path: "/leaderboard/current-month", auth: true },
    LAST_MONTH: { method: "GET", path: "/leaderboard/last-month", auth: true },
    MY_SUBSETS: { method: "GET", path: "/leaderboard/my-subsets", auth: true },
    HONORS: { method: "GET", path: "/leaderboard/honors", auth: true },
    COMPETITION_POOL: { method: "GET", path: "/leaderboard/competition-pool", auth: true },
    HISTORY: { method: "GET", path: "/leaderboard/history", auth: true },
    MISSIONS: { method: "GET", path: "/leaderboard/missions", auth: true },
  },
  REPORTS: {
    SUBSETS: { method: "GET", path: "/reports/subsets", auth: true },
    INCOME: { method: "GET", path: "/reports/income", auth: true },
    CAPITAL: { method: "GET", path: "/reports/capital-deposit", auth: true },
  },
  SUBSET_DEPOSITS: {
    TRANSACTIONS: {
      method: "GET",
      path: "/subset-deposits/transactions",
      auth: true,
      query: "?page=1",
    },
    RULES: { method: "GET", path: "/subset-deposits/rules", auth: true },
  },
  CAPITAL: {
    FUNDS: { method: "GET", path: "/capital/funds", auth: true },
  },
} as const;

export type EndpointDef = {
  method: string;
  path: string;
  auth: boolean;
  query?: string;
  schemaKey?: string;
};

export function flattenProtectedGetEndpoints(): EndpointDef[] {
  const endpoints: EndpointDef[] = [];
  for (const group of Object.values(API_ENDPOINTS)) {
    for (const def of Object.values(group)) {
      if (def.method === "GET" && def.auth) {
        endpoints.push(def as EndpointDef);
      }
    }
  }
  return endpoints;
}

export function flattenPublicGetEndpoints(): EndpointDef[] {
  const endpoints: EndpointDef[] = [];
  for (const group of Object.values(API_ENDPOINTS)) {
    for (const def of Object.values(group)) {
      if (def.method === "GET" && !def.auth) {
        endpoints.push(def as EndpointDef);
      }
    }
  }
  return endpoints;
}
