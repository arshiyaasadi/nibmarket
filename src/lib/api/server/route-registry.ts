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
  adminLoginHandler,
  adminUsersHandler,
  adminUsersDemographicsHandler,
  adminUserDetailHandler,
  adminUserStatusHandler,
  adminUserRoleHandler,
  adminNetworkClosureHandler,
  adminMissionsListHandler,
  adminMissionsOverviewHandler,
  adminMissionsJobsHealthHandler,
  adminMissionCompletionsHandler,
  adminMissionStatusHandler,
  adminSedimentOverviewHandler,
  adminSedimentJobHandler,
  adminSedimentAssetsHandler,
  adminSedimentDepositsHandler,
  adminTwinOverviewHandler,
  adminTwinAllocationsHandler,
  adminPoolOverviewHandler,
  adminPoolParticipantsHandler,
  adminPoolPeriodsHandler,
  adminInviteOverviewHandler,
  adminInviteLogHandler,
  adminInviteTemplatesHandler,
  adminInviteTemplateCreateHandler,
  adminInviteTemplateUpdateHandler,
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
import {
  notificationsActivityHandler,
  notificationsListHandler,
} from "./handlers/notifications.handler";

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

  "GET:/notifications": notificationsListHandler,
  "GET:/notifications/activity": notificationsActivityHandler,

  // Admin routes
  "POST:/admin/auth/login": adminLoginHandler,
  "GET:/admin/stats": adminStatsHandler,
  "GET:/admin/users": adminUsersHandler,
  "GET:/admin/users/demographics": adminUsersDemographicsHandler,
  "GET:/admin/twin/overview": adminTwinOverviewHandler,
  "GET:/admin/twin/allocations": adminTwinAllocationsHandler,
  "GET:/admin/pool/overview": adminPoolOverviewHandler,
  "GET:/admin/pool/participants": adminPoolParticipantsHandler,
  "GET:/admin/pool/periods": adminPoolPeriodsHandler,
  "GET:/admin/network/invites/overview": adminInviteOverviewHandler,
  "GET:/admin/network/invites/log": adminInviteLogHandler,
  "GET:/admin/network/invite-templates": adminInviteTemplatesHandler,
  "POST:/admin/network/invite-templates": adminInviteTemplateCreateHandler,
  "GET:/admin/network/closure": adminNetworkClosureHandler,
  "GET:/admin/missions/list": adminMissionsListHandler,
  "GET:/admin/missions/overview": adminMissionsOverviewHandler,
  "GET:/admin/missions/jobs/health": adminMissionsJobsHealthHandler,
  "GET:/admin/missions/completions": adminMissionCompletionsHandler,
  "GET:/admin/sediment/overview": adminSedimentOverviewHandler,
  "GET:/admin/sediment/job": adminSedimentJobHandler,
  "GET:/admin/sediment/assets": adminSedimentAssetsHandler,
  "GET:/admin/sediment/deposits": adminSedimentDepositsHandler,
};

export function resolveHandler(method: string, segments: string[]): RouteHandler | null {
  const path = `/${segments.join("/")}`;
  const key = `${method}:${path}`;

  // Exact match first
  if (CUSTOM_ROUTES[key]) return CUSTOM_ROUTES[key];

  // Admin dynamic routes
  if (
    method === "GET" &&
    segments[0] === "admin" &&
    segments[1] === "users" &&
    segments.length === 3 &&
    segments[2] !== "demographics"
  ) {
    return (req) => adminUserDetailHandler(req, segments[2]);
  }
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
    segments[1] === "network" &&
    segments[2] === "invite-templates" &&
    segments[3]
  ) {
    return (req) => adminInviteTemplateUpdateHandler(req, segments[3]);
  }
  if (
    method === "PATCH" &&
    segments[0] === "admin" &&
    segments[1] === "missions" &&
    segments[3] === "status"
  ) {
    return (req) => adminMissionStatusHandler(req, segments[2]);
  }

  return null;
}
