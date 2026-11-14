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
  kycVerifyHandler,
  registerHandler,
  registerOtpSendHandler,
  registerOtpVerifyHandler,
  refreshHandler,
} from "./handlers/auth.handler";
import { ssoCompleteHandler, ssoExchangeHandler } from "./handlers/auth-sso.handler";
import {
  adminStatsHandler,
  adminLoginHandler,
  adminUsersHandler,
  adminUsersSyncHandler,
  adminUsersDemographicsHandler,
  adminUsersKycSummaryHandler,
  adminUsersPostalCodesHandler,
  adminUsersGeoHandler,
  adminUsersGeoLookupHandler,
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
  adminTwinTransactionsHandler,
  adminTwinSourcesHandler,
  adminTwinSupplyAdjustmentsListHandler,
  adminTwinSupplyAdjustmentsCreateHandler,
  adminPoolOverviewHandler,
  adminPoolParticipantsHandler,
  adminPoolPeriodsHandler,
  adminPoolTransactionsHandler,
  adminInviteOverviewHandler,
  adminInviteLogHandler,
  adminInviteTemplatesHandler,
  adminInviteTemplateCreateHandler,
  adminInviteTemplateUpdateHandler,
  adminInviteTemplateDeleteHandler,
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
import {
  missionsActivityHandler,
  missionsCompleteHandler,
  missionsListHandler,
  missionsSectionBadgesHandler,
  missionsSectionMarketingHandler,
  missionsSectionOnboardingHandler,
  missionsSectionPromotionHandler,
} from "./handlers/missions.handler";
import { leadsRegistrationLinkHandler } from "./handlers/leads.handler";
import {
  getInviteQuotaHandler,
  inviteTemplatesHandler,
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
  notificationsMarkAllReadHandler,
  notificationsMarkReadHandler,
} from "./handlers/notifications.handler";
import {
  adminNotificationGroupCreateHandler,
  adminNotificationGroupDeleteHandler,
  adminNotificationGroupGetHandler,
  adminNotificationGroupUpdateHandler,
  adminNotificationGroupsListHandler,
  adminSystemMessageCreateHandler,
  adminSystemMessageDeleteHandler,
  adminSystemMessagesListHandler,
} from "./handlers/system-messages.handler";

type RouteHandler = (req: Request) => Promise<Response>;

const CUSTOM_ROUTES: Record<string, RouteHandler> = {
  "POST:/auth/check-mobile": checkMobileHandler,
  "POST:/auth/login": loginHandler,
  "POST:/auth/logout": logoutHandler,
  "POST:/auth/sso/exchange": ssoExchangeHandler,
  "POST:/auth/sso/complete": ssoCompleteHandler,
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
  "POST:/auth/kyc/verify": kycVerifyHandler,

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
  "GET:/network/invite-templates": inviteTemplatesHandler,
  "POST:/network/send-invite": sendInviteHandler,
  "POST:/network/submit-referrer": submitReferrerHandler,

  "GET:/wallet/summary": walletSummaryHandler,
  "GET:/wallet/transactions": walletTransactionsHandler,
  "GET:/wallet/token-price": tokenPriceHandler,

  "GET:/missions/list": missionsListHandler,
  "GET:/missions/activity": missionsActivityHandler,
  "POST:/missions/complete": missionsCompleteHandler,
  "GET:/missions/sections/promotion": missionsSectionPromotionHandler,
  "GET:/missions/sections/onboarding": missionsSectionOnboardingHandler,
  "GET:/missions/sections/marketing": missionsSectionMarketingHandler,
  "GET:/missions/sections/badges": missionsSectionBadgesHandler,
  "POST:/leads/registration-link": leadsRegistrationLinkHandler,

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
  "POST:/notifications/read-all": notificationsMarkAllReadHandler,

  // Admin routes
  "POST:/admin/auth/login": adminLoginHandler,
  "GET:/admin/notification-groups": adminNotificationGroupsListHandler,
  "POST:/admin/notification-groups": adminNotificationGroupCreateHandler,
  "GET:/admin/system-messages": adminSystemMessagesListHandler,
  "POST:/admin/system-messages": adminSystemMessageCreateHandler,
  "GET:/admin/stats": adminStatsHandler,
  "GET:/admin/users": adminUsersHandler,
  "POST:/admin/users/sync": adminUsersSyncHandler,
  "GET:/admin/users/kyc-summary": adminUsersKycSummaryHandler,
  "GET:/admin/users/postal-codes": adminUsersPostalCodesHandler,
  "GET:/admin/users/demographics": adminUsersDemographicsHandler,
  "GET:/admin/users/geo": adminUsersGeoHandler,
  "GET:/admin/users/geo/lookup": adminUsersGeoLookupHandler,
  "GET:/admin/twin/overview": adminTwinOverviewHandler,
  "GET:/admin/twin/sources": adminTwinSourcesHandler,
  "GET:/admin/twin/transactions": adminTwinTransactionsHandler,
  "GET:/admin/twin/supply-adjustments": adminTwinSupplyAdjustmentsListHandler,
  "POST:/admin/twin/supply-adjustments": adminTwinSupplyAdjustmentsCreateHandler,
  "GET:/admin/pool/overview": adminPoolOverviewHandler,
  "GET:/admin/pool/participants": adminPoolParticipantsHandler,
  "GET:/admin/pool/periods": adminPoolPeriodsHandler,
  "GET:/admin/pool/transactions": adminPoolTransactionsHandler,
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
  const RESERVED_ADMIN_USER_SEGMENTS = new Set([
    "demographics",
    "geo",
    "messages",
    "kyc-summary",
    "postal-codes",
    "sync",
  ]);
  if (
    method === "GET" &&
    segments[0] === "admin" &&
    segments[1] === "users" &&
    segments.length === 3 &&
    !RESERVED_ADMIN_USER_SEGMENTS.has(segments[2])
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
    method === "DELETE" &&
    segments[0] === "admin" &&
    segments[1] === "network" &&
    segments[2] === "invite-templates" &&
    segments[3]
  ) {
    return (req) => adminInviteTemplateDeleteHandler(req, segments[3]);
  }
  if (
    method === "PATCH" &&
    segments[0] === "admin" &&
    segments[1] === "missions" &&
    segments[3] === "status"
  ) {
    return (req) => adminMissionStatusHandler(req, segments[2]);
  }

  if (
    method === "PATCH" &&
    segments[0] === "notifications" &&
    segments[2] === "read" &&
    segments[1]
  ) {
    return (req) => notificationsMarkReadHandler(req, segments[1]);
  }

  if (segments[0] === "admin" && segments[1] === "notification-groups" && segments[2]) {
    if (method === "GET" && segments.length === 3) {
      return (req) => adminNotificationGroupGetHandler(req, segments[2]);
    }
    if (method === "PATCH" && segments.length === 3) {
      return (req) => adminNotificationGroupUpdateHandler(req, segments[2]);
    }
    if (method === "DELETE" && segments.length === 3) {
      return (req) => adminNotificationGroupDeleteHandler(req, segments[2]);
    }
  }

  if (
    method === "DELETE" &&
    segments[0] === "admin" &&
    segments[1] === "system-messages" &&
    segments[2]
  ) {
    return (req) => adminSystemMessageDeleteHandler(req, segments[2]);
  }

  return null;
}
