/**
 * Admin panel API DTOs.
 * Path SSOT: `src/lib/api/endpoints.ts` → `ENDPOINTS.ADMIN`
 * Pending BE deltas: `novin-club-work/backend-inbox.md`
 */
import type {
  LoginActivity,
  NetworkSubset,
  ReferrerInfo,
  SubsetDeposits,
  SubsetDepositStatus,
  UserRole,
  WalletSummary,
} from "./mlm";

/** POST /admin/auth/login — request body */
export interface AdminLoginRequest {
  username: string;
  password: string;
}

/** POST /admin/auth/login — response (same session shape as client auth login) */
export interface AdminLoginResponse {
  id: string;
  userId: string;
  fullName: string;
  mobile: string;
  email: string;
  role: UserRole;
  token: string;
  refreshToken: string;
  balance: number;
  wallet: WalletSummary;
  recentSessions: LoginActivity[];
}

/** Shared user status / KYC values — aligned with `User` in mlm.ts */
export type AdminUserStatus = "pending_verification" | "active" | "suspended" | "closed";
export type AdminUserKycStatus = "none" | "pending" | "verified" | "rejected";
export type AdminUserGender = "male" | "female";

/** Sejam KYC address nested under `AdminUserSejam` */
export interface AdminUserSejamAddress {
  addressId: number;
  addressBody: string | null;
  postalCode: string | null;
  phoneNumber: string | null;
  cityId: number | null;
  isActive: boolean;
  isSejamAddress: boolean;
  isDefault: boolean;
}

/** Sejam bank account nested under `AdminUserSejam` */
export interface AdminUserSejamBankAccount {
  bankAccountId: number;
  accountNumber: string | null;
  iban: string | null;
  accountType: string | null;
  bankId: number | null;
  bankName: string | null;
  branchId: number | null;
  branchName: string | null;
  bankBranchCode: string | null;
  isSejamAccount: boolean;
  isDefault: boolean;
}

/**
 * Sejam investor profile returned on admin user list/detail.
 * Dates like `birthDate` are often already Jalali (`1365/10/18`).
 */
export interface AdminUserSejam {
  investorId: number | null;
  legalType: number | null;
  isIranian: boolean | null;
  authenticationStatusTypeId: number | null;
  sejamStatusId: number | null;
  nationalNo: string | null;
  firstName: string | null;
  lastName: string | null;
  fatherName: string | null;
  gender: string | number | null;
  mobile: string | null;
  email: string | null;
  birthDate: string | null;
  birthCertificateSerial: string | null;
  birthCertificateNumber: string | null;
  birthCertificatePlaceOfIssue: string | null;
  placeOfBirth: string | null;
  exchangeCode: string | null;
  nationalityId: number | null;
  englishFirstName: string | null;
  englishLastName: string | null;
  englishFatherName: string | null;
  companyName: string | null;
  registerNo: string | null;
  companyRegisterDate: string | null;
  companyRegisterPlace: string | null;
  ceoNationalNo: string | null;
  isArchive: boolean | null;
  registeredAt: string | null;
  addresses: AdminUserSejamAddress[];
  bankAccounts: AdminUserSejamBankAccount[];
}

/** GET /admin/users — list item */
export interface AdminUserListItem {
  id: string;
  mobile: string;
  email: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  status: AdminUserStatus;
  kycStatus: AdminUserKycStatus;
  /**
   * Sejam identity flag from club BE users API.
   * Missing/false → treat as unverified in admin UI.
   */
  hasSejamIdentity?: boolean;
  referralCode: string;
  createdAt: string;
  nibId?: number | null;
  isClubMember?: boolean;
  /** Present when BE attaches Sejam KYC payload */
  sejam?: AdminUserSejam | null;
}

/**
 * POST /admin/users/sync — pull/refresh club users from Nibmarket.
 * Empty body. Response shape is best-effort until OpenAPI is confirmed.
 */
export interface AdminUsersSyncResponse {
  success: boolean;
  /** How many users were created/updated when BE reports it */
  syncedCount?: number;
  message?: string;
}

/** GET /admin/users/geo — one member pinned on the density map (legacy fixture until postal→geo lands) */
export interface AdminUserGeoPoint {
  id: string;
  fullName: string;
  mobile: string;
  city: string;
  province: string;
  lat: number;
  lng: number;
  status: AdminUserStatus;
  /** Present when point is derived from a postal code */
  postalCode?: string | null;
}

/** GET /admin/users/geo — response (fixture/legacy density points) */
export interface AdminUserGeoResponse {
  points: AdminUserGeoPoint[];
  total: number;
}

/**
 * GET /admin/users/postal-codes — full list of user postal codes for density map.
 * Response items are **postal code strings only** (one per user with a usable address).
 * FE sums `postalCodes.length` for total locations and later maps Iran postal → province/city/approx latlng.
 */
export interface AdminUsersPostalCodesResponse {
  postalCodes: string[];
}

/**
 * GET /admin/users/geo/lookup?mobile= — find one user by mobile for map pin / search card.
 * `user` is null when no match.
 */
export interface AdminUserGeoLookupUser {
  id: string;
  fullName: string;
  mobile: string;
  /** Primary / default Sejam address postal code when available */
  postalCode: string | null;
  status: AdminUserStatus;
}

export interface AdminUserGeoLookupResponse {
  user: AdminUserGeoLookupUser | null;
}

/** GET /admin/users — paginated response */
export interface AdminUsersListResponse {
  data: AdminUserListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/**
 * GET /admin/users/kyc-summary — identity verification counts for admin users page.
 * Counts are based on `hasSejamIdentity` (true = verified).
 */
export interface AdminUsersKycSummaryResponse {
  /** All club users */
  totalUsers: number;
  /** Users with hasSejamIdentity === true */
  verifiedCount: number;
  /** Users with hasSejamIdentity !== true */
  unverifiedCount: number;
}

/** GET /admin/users/demographics — age bucket (legacy; FE no longer calls) */
export interface AdminAgeDistributionItem {
  range: string;
  count: number;
  percent: number;
}

/** GET /admin/users/demographics — gender bucket (legacy; FE no longer calls) */
export interface AdminGenderDistributionItem {
  gender: AdminUserGender;
  label: string;
  count: number;
  percent: number;
}

/** GET /admin/users/demographics (legacy; FE no longer calls) */
export interface AdminUsersDemographicsResponse {
  totalUsers: number;
  ageDistribution: AdminAgeDistributionItem[];
  genderDistribution: AdminGenderDistributionItem[];
}

/** Panel module visibility for a user — mirrors client routes */
export interface AdminUserModuleAccess {
  key: string;
  label: string;
  path: string;
  enabled: boolean;
  description?: string;
}

/** GET /admin/users/:userId — full admin profile view */
export interface AdminUserProfileResponse {
  user: AdminUserListItem & {
    birthDate: string | null;
    gender: AdminUserGender | null;
    nationalId: string | null;
    nibMarketLinked: boolean;
  };
  wallet: WalletSummary;
  subordinates: NetworkSubset[];
  directSubordinatesCount: number;
  totalNetworkSize: number;
  modules: AdminUserModuleAccess[];
  subsetDeposits: SubsetDeposits;
  missionProgress: {
    completed: number;
    total: number;
    activeCount: number;
  };
  recentSessions: LoginActivity[];
  referrer: ReferrerInfo | null;
}

/** PATCH /admin/users/:userId/status — request body */
export interface UpdateAdminUserStatusRequest {
  status: AdminUserStatus;
}

/** PATCH /admin/users/:userId/status — response */
export interface UpdateAdminUserStatusResponse {
  ok: true;
}

/** PATCH /admin/users/:userId/role — request body */
export interface UpdateAdminUserRoleRequest {
  roleCode: UserRole;
}

/** PATCH /admin/users/:userId/role — response */
export interface UpdateAdminUserRoleResponse {
  ok: true;
}

export type AdminTwinAllocationSource =
  "mission_reward" | "commission_reward" | "registration" | "adjustment" | "mint" | "pool_deposit";

/** GET /admin/twin/overview */
export interface AdminTwinOverviewResponse {
  tokenPriceRial: number;
  tokenPriceChangePercent24h: number;
  totalTokens: number;
  totalFrozenTokens: number;
  frozenPercent: number;
  totalAvailableTokens: number;
}

/** GET /admin/twin/allocations — row */
export interface AdminTwinAllocationRow {
  id: string;
  userId: string;
  fullName: string;
  mobile: string;
  totalTokens: number;
  availableTokens: number;
  frozenTokens: number;
  frozenPercent: number;
  primarySource: AdminTwinAllocationSource;
  lastAllocationAt: string;
}

/** GET /admin/twin/allocations — paginated response */
export interface AdminTwinAllocationsResponse {
  data: AdminTwinAllocationRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/** GET /admin/pool/overview — aligned with client `CompetitionPool` + admin metrics */
export interface AdminPoolOverviewResponse {
  totalPool: number;
  dailyChange: number;
  dailyChangePercent: number;
  participantCount: number;
  topWinners: number;
  startDate: string;
  endDate: string;
  /** i18n key or title from API — UI resolves via admin.pool.periods.{key} when prefixed */
  contextTitle: string;
  distributedThisPeriod: number;
  pendingDistribution: number;
}

/** GET /admin/pool/participants — row (extends leaderboard fields for admin) */
export interface AdminPoolParticipantRow {
  rank: number;
  userId: string;
  fullName: string;
  mobile: string;
  tokens: number;
  subsetCount: number;
  sharePercent: number;
  estimatedReward: number;
}

/** GET /admin/pool/participants */
export interface AdminPoolParticipantsResponse {
  data: AdminPoolParticipantRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/** GET /admin/pool/periods — row (aligned with client `CompetitionPeriod`) */
export interface AdminPoolPeriodRow {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  totalPool: number;
  winnerName: string;
  participantCount: number;
  distributedAmount: number;
}

/** GET /admin/pool/periods */
export interface AdminPoolPeriodsResponse {
  data: AdminPoolPeriodRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/** GET /admin/pool/transactions — query `type` */
export type AdminPoolTransactionTypeFilter = "burn" | "payout" | "inflow" | "";

/** Per-row ledger status */
export type AdminPoolTransactionStatus = "burned" | "allocated" | "deposited";

/** GET /admin/pool/transactions — row */
export interface AdminPoolTransactionRow {
  id: string;
  status: AdminPoolTransactionStatus;
  amount: number;
  userId: string;
  userName: string;
  userMobile: string;
  periodTitle: string;
  description: string;
  createdAt: string;
}

/** GET /admin/pool/transactions — aggregates for filtered set / period */
export interface AdminPoolTransactionsSummary {
  totalInflow: number;
  totalBurned: number;
  totalAllocated: number;
}

/** GET /admin/pool/transactions */
export interface AdminPoolTransactionsResponse {
  data: AdminPoolTransactionRow[];
  summary: AdminPoolTransactionsSummary;
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/** GET /admin/network/invites/overview */
export interface AdminInviteOverviewResponse {
  todayCount: number;
  totalCount: number;
}

/** GET /admin/network/invites/log — row */
export interface AdminInviteLogRow {
  id: string;
  sentAt: string;
  inviterUserId: string;
  inviterName: string;
  inviterMobile: string;
  inviteeFullName: string;
  inviteeMobile: string;
  templateId: string;
  templateTitle: string;
  messagePreview: string;
  fundId: string;
  status: "pending_invite" | "pending_verification" | "active" | "suspended" | "closed";
}

/** GET /admin/network/invites/log */
export interface AdminInviteLogResponse {
  data: AdminInviteLogRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/** GET /admin/network/invite-templates — aligned with client invite templates */
export interface AdminInviteTemplateRow {
  id: string;
  title: string;
  body: string;
  placeholders: string[];
  isActive: boolean;
}

/** GET /admin/network/invite-templates */
export interface AdminInviteTemplatesResponse {
  data: AdminInviteTemplateRow[];
}

/** PATCH /admin/network/invite-templates/:templateId — request */
export interface UpdateAdminInviteTemplateRequest {
  body: string;
}

/** PATCH /admin/network/invite-templates/:templateId — response */
export interface UpdateAdminInviteTemplateResponse {
  ok: true;
}

/** POST /admin/network/invite-templates — request */
export interface CreateAdminInviteTemplateRequest {
  body: string;
}

/** POST /admin/network/invite-templates — response */
export interface CreateAdminInviteTemplateResponse {
  id: string;
}

/** DELETE /admin/network/invite-templates/:templateId — response */
export interface DeleteAdminInviteTemplateResponse {
  ok: true;
}

export type AdminMissionStatus = "active" | "paused";
export type AdminMissionType =
  "referral_count" | "purchase" | "registration" | "fund_issue" | "custom";
export type AdminMissionVerificationMode = "auto" | "manual";
export type AdminMissionJobHealthStatus = "healthy" | "degraded" | "down" | "unknown";

/** Backend job metadata linked to a mission */
export interface AdminMissionJobMeta {
  jobId: string;
  jobName: string;
  schedule: string;
}

/** GET /admin/missions/list — row */
export interface AdminMissionListItem {
  id: string;
  code: string;
  title: string;
  description: string | null;
  missionType: AdminMissionType;
  rewardAmount: number;
  verificationMode: AdminMissionVerificationMode;
  status: AdminMissionStatus | "draft" | "archived";
  job: AdminMissionJobMeta;
  createdAt: string;
}

/** GET /admin/missions/list */
export interface AdminMissionsListResponse {
  data: AdminMissionListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/** PATCH /admin/missions/:missionId/status — request */
export interface UpdateAdminMissionStatusRequest {
  status: AdminMissionStatus;
}

/** PATCH /admin/missions/:missionId/status — response */
export interface UpdateAdminMissionStatusResponse {
  ok: true;
}

/** GET /admin/missions/jobs/health — row */
export interface AdminMissionJobHealthItem {
  missionId: string;
  missionCode: string;
  missionTitle: string;
  jobId: string;
  jobName: string;
  status: AdminMissionJobHealthStatus;
  lastRunAt: string | null;
  lastSuccessAt: string | null;
  nextRunAt: string | null;
  latencyMs: number | null;
  /** i18n key under admin.missions.health.messages */
  message: string | null;
}

/** GET /admin/missions/jobs/health */
export interface AdminMissionJobsHealthResponse {
  checkedAt: string;
  overallStatus: AdminMissionJobHealthStatus;
  jobs: AdminMissionJobHealthItem[];
}

/** GET /admin/missions/overview */
export interface AdminMissionsOverviewResponse {
  missionCount: number;
  activeMissionCount: number;
  jobCount: number;
}

/** GET /admin/missions/completions — row */
export interface AdminMissionCompletionRow {
  id: string;
  completedAt: string;
  userId: string;
  userFullName: string;
  userMobile: string;
  missionId: string;
  missionCode: string;
  missionTitle: string;
  rewardAmount: number;
}

/** GET /admin/missions/completions */
export interface AdminMissionCompletionsResponse {
  data: AdminMissionCompletionRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/** GET /admin/sediment/overview */
export interface AdminSedimentOverviewResponse {
  totalAssetValueRial: number;
  linkedUsersCount: number;
  assetRecordsCount: number;
  todaySedimentTwin: number;
  monthSedimentTwin: number;
  pendingSedimentTwin: number;
}

/** GET /admin/sediment/job */
export interface AdminSedimentJobResponse {
  jobId: string;
  jobName: string;
  schedule: string;
  status: AdminMissionJobHealthStatus;
  lastRunAt: string | null;
  lastSuccessAt: string | null;
  nextRunAt: string | null;
  processedAssets: number;
  distributedTwin: number;
  message: string | null;
}

/** GET /admin/sediment/assets — row */
export interface AdminNibMarketAssetRow {
  id: string;
  userId: string;
  fullName: string;
  mobile: string;
  fundId: string;
  fundName: string;
  assetValueRial: number;
  profitRatePercent: number;
  syncedAt: string;
}

/** GET /admin/sediment/assets */
export interface AdminNibMarketAssetsResponse {
  data: AdminNibMarketAssetRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/** GET /admin/sediment/deposits — row */
export interface AdminSedimentDepositRow {
  id: string;
  processedAt: string;
  beneficiaryUserId: string;
  beneficiaryName: string;
  beneficiaryMobile: string;
  sourceUserName: string;
  level: number;
  baseAmountRial: number;
  ratePercent: number;
  sedimentTwin: number;
  status: SubsetDepositStatus;
  fundId: string;
  fundName: string;
  externalTxId: string | null;
}

/** GET /admin/sediment/deposits */
export interface AdminSedimentDepositsResponse {
  data: AdminSedimentDepositRow[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

// ── System messages / notification groups (mlm-04) ───────────

export type CampaignAudienceType = "user" | "group" | "all";
export type CampaignStatus = "scheduled" | "sent" | "deleted";

export interface CampaignChannels {
  system: boolean;
  sms: boolean;
}

export interface NotificationGroupMember {
  id: string;
  firstName: string;
  lastName: string;
  mobile: string;
}

export interface NotificationGroup {
  id: string;
  title: string;
  memberIds: string[];
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationGroupDetail extends NotificationGroup {
  members: NotificationGroupMember[];
}

export interface CreateNotificationGroupRequest {
  title: string;
  memberIds: string[];
}

export interface UpdateNotificationGroupRequest {
  title?: string;
  memberIds?: string[];
}

export interface SystemMessageCampaign {
  id: string;
  title: string;
  body: string;
  audienceType: CampaignAudienceType;
  userId: string | null;
  /** When sending to one or more individuals (audienceType === "user") */
  userIds: string[];
  groupId: string | null;
  audienceLabel: string;
  channels: CampaignChannels;
  status: CampaignStatus;
  scheduledAt: string | null;
  sentAt: string | null;
  deletedAt: string | null;
  createdBy: { id: string; fullName?: string };
  createdAt: string;
}

export interface CreateSystemMessageRequest {
  title: string;
  body: string;
  audienceType: CampaignAudienceType;
  /** Single recipient UUID when audienceType === "user" */
  userId?: string;
  /** Multiple recipient UUIDs (not used for single-user sends) */
  userIds?: string[];
  groupId?: string;
  channels: CampaignChannels;
  scheduledAt?: string | null;
}

export interface AdminPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}
