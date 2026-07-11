import {
  checkMobileHandler,
  loginHandler,
  logoutHandler,
  otpSendHandler,
  otpVerifyHandler,
  forgotSendHandler,
  forgotVerifyHandler,
  forgotResetHandler,
  profileHandler,
  registerHandler,
  registerOtpSendHandler,
  registerOtpVerifyHandler,
  refreshHandler,
} from "./handlers/auth.handler";
import { ssoExchangeHandler } from "./handlers/auth-sso.handler";
import {
  adminStatsHandler,
  adminUsersHandler,
  adminUserStatusHandler,
  adminUserRoleHandler,
  adminNetworkClosureHandler,
  adminMissionsListHandler,
  adminMissionsCreateHandler,
  adminMissionsUpdateHandler,
  adminAdminsListHandler,
  adminAdminsAssignHandler,
  adminAdminsRevokeHandler,
} from "./handlers/admin.handler";
import { capitalFundsHandler } from "./handlers/capital.handler";
import {
  dashboardLeaderboardHandler,
  dashboardMissionsHandler,
  dashboardReferralHandler,
  dashboardRewardsHandler,
  dashboardSubsetDepositsHandler,
  dashboardWalletHandler,
  emptyDashboardHandler,
} from "./handlers/dashboard.handler";
import {
  leaderboardCompetitionPoolHandler,
  leaderboardCurrentMonthHandler,
  leaderboardHistoryHandler,
  leaderboardHonorsHandler,
  leaderboardMissionsHandler,
  leaderboardMySubsetsHandler,
  leaderboardPoolBalanceHandler,
} from "./handlers/leaderboard.handler";
import { missionsActivityHandler, missionsListHandler } from "./handlers/missions.handler";
import {
  getInviteQuotaHandler,
  networkFundsHandler,
  networkInvitedHandler,
  networkSubsetsHandler,
  networkTreeHandler,
  sendInviteHandler,
  submitReferrerHandler,
} from "./handlers/network.handler";
import {
  reportsCapitalDepositHandler,
  reportsIncomeHandler,
  reportsSubsetsHandler,
} from "./handlers/reports.handler";
import {
  subsetDepositRulesHandler,
  subsetDepositTransactionsHandler,
} from "./handlers/subset-deposits.handler";
import {
  tokenPriceHandler,
  walletSummaryHandler,
  walletTransactionsHandler,
} from "./handlers/wallet.handler";

type RouteHandler = (req: Request) => Promise<Response>;

const CUSTOM_ROUTES: Record<string, RouteHandler> = {
  "POST:/auth/check-mobile": checkMobileHandler,
  "POST:/auth/login": loginHandler,
  "POST:/auth/logout": logoutHandler,
  "POST:/auth/sso/exchange": ssoExchangeHandler,
  "POST:/auth/otp/send": otpSendHandler,
  "POST:/auth/otp/verify": otpVerifyHandler,
  "POST:/auth/register/otp/send": registerOtpSendHandler,
  "POST:/auth/register/otp/verify": registerOtpVerifyHandler,
  "POST:/auth/register": registerHandler,
  "POST:/auth/forgot/send": forgotSendHandler,
  "POST:/auth/forgot/verify": forgotVerifyHandler,
  "POST:/auth/forgot/reset": forgotResetHandler,
  "POST:/auth/refresh": refreshHandler,
  "GET:/auth/profile": profileHandler,

  "GET:/dashboard/rewards": dashboardRewardsHandler,
  "GET:/dashboard/wallet": dashboardWalletHandler,
  "GET:/dashboard/leaderboard": dashboardLeaderboardHandler,
  "GET:/dashboard/subset-deposits": dashboardSubsetDepositsHandler,
  "GET:/dashboard/referral": dashboardReferralHandler,
  "GET:/dashboard/missions": dashboardMissionsHandler,
  "GET:/dashboard/charts": emptyDashboardHandler,

  "GET:/network/subsets": networkSubsetsHandler,
  "GET:/network/tree": networkTreeHandler,
  "GET:/network/invited": networkInvitedHandler,
  "GET:/network/funds": networkFundsHandler,
  "GET:/network/invite-quota": getInviteQuotaHandler,
  "POST:/network/send-invite": sendInviteHandler,
  "POST:/network/submit-referrer": submitReferrerHandler,

  "GET:/wallet/summary": walletSummaryHandler,
  "GET:/wallet/transactions": walletTransactionsHandler,
  "GET:/wallet/token-price": tokenPriceHandler,

  "GET:/missions/list": missionsListHandler,
  "GET:/missions/activity": missionsActivityHandler,

  "GET:/leaderboard/pool-balance": leaderboardPoolBalanceHandler,
  "GET:/leaderboard/current-month": leaderboardCurrentMonthHandler,
  "GET:/leaderboard/last-month": leaderboardCurrentMonthHandler,
  "GET:/leaderboard/my-subsets": leaderboardMySubsetsHandler,
  "GET:/leaderboard/honors": leaderboardHonorsHandler,
  "GET:/leaderboard/competition-pool": leaderboardCompetitionPoolHandler,
  "GET:/leaderboard/history": leaderboardHistoryHandler,
  "GET:/leaderboard/missions": leaderboardMissionsHandler,

  "GET:/reports/subsets": reportsSubsetsHandler,
  "GET:/reports/income": reportsIncomeHandler,
  "GET:/reports/capital-deposit": reportsCapitalDepositHandler,

  "GET:/subset-deposits/transactions": subsetDepositTransactionsHandler,
  "GET:/subset-deposits/rules": subsetDepositRulesHandler,

  "GET:/capital/funds": capitalFundsHandler,

  // Admin routes
  "GET:/admin/stats": adminStatsHandler,
  "GET:/admin/users": adminUsersHandler,
  "GET:/admin/network/closure": adminNetworkClosureHandler,
  "GET:/admin/missions/list": adminMissionsListHandler,
  "POST:/admin/missions/create": adminMissionsCreateHandler,
  "GET:/admin/admins/list": adminAdminsListHandler,
  "POST:/admin/admins/assign": adminAdminsAssignHandler,
};

export function resolveHandler(method: string, segments: string[]): RouteHandler | null {
  const path = `/${segments.join("/")}`;
  const key = `${method}:${path}`;

  // Exact match first
  if (CUSTOM_ROUTES[key]) return CUSTOM_ROUTES[key];

  // Admin dynamic routes
  if (
    method === "PATCH" &&
    segments[0] === "admin" &&
    segments[1] === "users" &&
    segments[3] === "status"
  ) {
    return (req) => adminUserStatusHandler(req, segments[2]);
  }
  if (
    method === "PATCH" &&
    segments[0] === "admin" &&
    segments[1] === "users" &&
    segments[3] === "role"
  ) {
    return (req) => adminUserRoleHandler(req, segments[2]);
  }
  if (
    method === "PATCH" &&
    segments[0] === "admin" &&
    segments[1] === "missions" &&
    segments.length === 3
  ) {
    return (req) => adminMissionsUpdateHandler(req, segments[2]);
  }
  if (
    method === "DELETE" &&
    segments[0] === "admin" &&
    segments[1] === "admins" &&
    segments[2] === "revoke" &&
    segments[3]
  ) {
    return (req) => adminAdminsRevokeHandler(req, segments[3]);
  }

  return null;
}
