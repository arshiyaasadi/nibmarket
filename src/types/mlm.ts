/**
 * Club panel API DTOs (user / MLM surfaces).
 * Path SSOT: `src/lib/api/endpoints.ts`
 * Pending BE deltas: `novin-club-work/backend-inbox.md`
 * Mappers from raw payloads: `src/types/mappers.ts`
 */

// ── Auth & User ──────────────────────────────────────────────
export type UserRole = "client" | "manager" | "admin";

/** Authenticated panel user profile fields used across network/auth UI. */
export interface User {
  id: string;
  mobile: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;
  /** Wallet balance in تنوین tokens */
  balance: number;
  referralCode: string;
  /** UI alias for referralCode */
  inviteCode: string;
  kycStatus: "none" | "pending" | "verified" | "rejected";
  status: "pending_verification" | "active" | "suspended" | "closed";
}

export interface UserReferralInfo {
  inviteCode: string;
  referralCode: string;
}

// ── تنوین Token / Wallet (API paths may still say twin) ───────
export interface WalletSummary {
  totalTokens: number;
  frozenTokens: number;
  availableTokens: number;
  pendingTokens: number;
}

export type WalletTxType =
  | "mint"
  | "commission_reward"
  | "mission_reward"
  | "transfer_in"
  | "transfer_out"
  | "lock"
  | "unlock"
  | "pool_deposit"
  | "pool_withdrawal"
  | "adjustment";

export interface WalletTransaction {
  id: string;
  rrn?: string;
  date: string;
  type: WalletTxType;
  description: string;
  amount: number; // positive = دریافت, negative = پرداخت
  status: "pending" | "settled" | "failed" | "reversed";
}

export interface WalletTransactionPage {
  items: WalletTransaction[];
  hasMore: boolean;
  total: number;
}

export interface TokenPricePoint {
  date: string;
  price: number;
}

export interface TokenSummary {
  title: string;
  stats: string;
  trendNumber: string;
  trend: "positive" | "negative";
  color: string;
  icon: string;
}

// ── Missions ─────────────────────────────────────────────────
export interface Mission {
  id: string;
  code: string;
  title: string;
  completed: boolean;
  reward: string; // display string e.g. "10 توکن"
}

/**
 * Full mission row for list/section APIs.
 * `reward` is always a number (تنوین), never a formatted string.
 * Catalog codes: `docs/03-data/missions-catalog.json`
 */
export interface MissionDef {
  id: string;
  /** snake_case catalog code */
  code: string;
  title: string;
  /** تنوین amount */
  reward: number;
  /** Inline condition text (e.g. fund purchase min AUM) */
  description?: string;
  missionType: "referral_count" | "purchase" | "registration" | "fund_issue" | "custom";
  status: "draft" | "active" | "paused" | "archived";
  /** Per current user */
  completed?: boolean;
  /** ISO timestamp when completed */
  completedAt?: string;
  /** Legacy flag — treat as +100% boost when set */
  doubleBonus?: boolean;
  /**
   * Optional campaign boost from backend.
   * FE only renders boost UI when these are present / doubleBonus is true.
   */
  rewardBoostPercent?: number;
  boostedReward?: number;
  /** ISO expiry for boost */
  boostEndsAt?: string;
  /**
   * Optional period progress (promotion / recurring missions).
   * FE falls back to code defaults when missing.
   */
  progressCurrent?: number;
  progressTarget?: number;
  /** ISO end of day/month period */
  periodEndsAt?: string;
  /** Local calendar dates `YYYY-MM-DD` claimed this week (daily_login) */
  loginClaimedDates?: string[];
  /** Lifetime / period invite count for per-event referral card */
  referralCount?: number;
  /** Tokens earned from that referral mission so far */
  referralTokensEarned?: number;
}

/** GET /missions/sections/{promotion|onboarding|marketing} */
export interface MissionSectionResponse {
  items: MissionDef[];
}

export type MarketingBadgeCode = "pishgam" | "motabar" | "collector" | "rahbar" | "safir_novin";

/** GET /missions/sections/badges — one marketing badge + unlock state */
export interface MarketingBadgeItem {
  code: MarketingBadgeCode;
  /** Linked mission code that unlocks this badge */
  missionCode: string;
  title: string;
  description?: string;
  reward: number;
  unlocked: boolean;
  /** ISO when unlocked */
  achievedAt?: string | null;
  imageUrl?: string | null;
}

export interface MarketingBadgesResponse {
  items: MarketingBadgeItem[];
}

/** POST /missions/complete */
export interface MissionCompleteRequest {
  /** Mission catalog code, e.g. `training_level_1` */
  code: string;
}

export interface MissionCompleteResponse {
  ok: boolean;
  code: string;
  completed: boolean;
  reward: number;
  /** True when already completed — no double pay */
  alreadyCompleted?: boolean;
}

/** POST /leads/registration-link (public; rate-limit on BE) */
export type RegistrationLinkLeadSource = "landing_hero" | "landing_join";

export interface RegistrationLinkLeadRequest {
  /** Iranian mobile `09xxxxxxxxx` */
  mobile: string;
  source: RegistrationLinkLeadSource;
}

export interface RegistrationLinkLeadResponse {
  ok: true;
}

export interface SubsetDeposits {
  today: number;
  thisMonth: number;
  total: number;
  activeSubsets: number;
  pendingAmount: number;
}

export type SubsetDepositStatus = "calculated" | "credited" | "reversed" | "failed";
export type SubsetDepositStatusFilter = "all" | "calculated" | "credited";

export interface SubsetDepositTransaction {
  id: string;
  date: string;
  level: number;
  sourceUserName: string;
  description: string;
  baseAmount: number;
  ratePercent: number;
  amount: number;
  status: SubsetDepositStatus;
  externalTxId?: string;
  fundId?: string;
}

export interface SubsetDepositTransactionPage {
  items: SubsetDepositTransaction[];
  hasMore: boolean;
  total: number;
}

export interface CommissionLevelRule {
  level: number;
  ratePercent: number;
  name: string;
}

export type MissionActivityStatus =
  "in_progress" | "pending_verification" | "completed" | "rejected" | "expired";

export interface MissionActivity {
  id: string;
  missionId: string;
  title: string;
  date: string;
  status: MissionActivityStatus;
  reward: number;
  rrn?: string; // شناسه پرداخت — فقط وقتی status === "paid"
}

export interface MissionActivityPage {
  items: MissionActivity[];
  hasMore: boolean;
  total: number;
}

// ── Network ──────────────────────────────────────────────────
export interface NetworkSubset {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  level: number;
  joinDate: string;
  subMembersCount: number;
  leaderboardRank?: number;
  directParentUserId?: string;
}

export interface NetworkTreeNode {
  id: string;
  fullName: string;
  level: number;
  isSelf: boolean;
  children?: NetworkTreeNode[];
}

/** TODO(upline-referrer): برای نمایش نام/سطح معرف بالاسری — API اختصاصی بعداً اضافه شود */
export interface ReferrerInfo {
  id: string;
  fullName: string;
  level: number;
  inviteCode: string;
  inviteType?: "regular" | "vip";
}

export interface VipInviteCode {
  code: string;
  usedBy: string | null; // mobile of user who used it, or null
  usedAt: string | null;
}

export type InviteStatus =
  "pending_verification" | "active" | "suspended" | "closed" | "pending_invite";

/**
 * GET /network/invite-quota — weekly VIP invite allowance + KYC gate.
 * FE opens KYC modal only when `canInvite === false` (missing field ≠ blocked).
 */
export interface InviteQuota {
  remaining: number;
  limit: number;
  used: number;
  /** false → show InviteKycGateModal instead of invite form */
  canInvite: boolean;
}

export interface InvitedPerson {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  mobile: string;
  status: InviteStatus;
  joinDate?: string;
  level?: number;
  subMembersCount?: number;
  inviteType?: "regular" | "vip";
}

export interface NetworkFund {
  id: string;
  name: string;
  logoPlaceholder?: string;
}

export interface SendInviteRequest {
  firstName: string;
  lastName: string;
  mobile: string;
  fundId: string;
  /** Filled template body for preview/SMS when backend accepts it */
  message?: string;
  /** Selected template id from GET /network/invite-templates */
  templateId?: string;
}

export interface SendInviteResponse {
  success: boolean;
  remaining: number;
  message?: string;
}

/** GET /leaderboard/competition-pool — active (or period-scoped) competition summary */
export interface CompetitionPool {
  totalPool: number;
  dailyChange: number;
  participantCount: number;
  /** ISO — used for Jalali month/year label */
  startDate: string;
  endDate: string;
  contextTitle: string;
  topWinners: number;
  myRank?: number;
}

export interface CompetitionPeriod {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  totalPool: number;
  winnerName: string;
  myRank?: number;
  myReward?: number;
}

// ── Reports ──────────────────────────────────────────────────
export interface IncomeTransaction {
  id: string;
  year: number;
  month: number;
  type: "mission_reward" | "commission_reward" | "adjustment";
  amount: number;
  description: string;
}

// ── Leaderboard ──────────────────────────────────────────────
export interface PoolBalance {
  totalPool: number;
  userShare: number;
  sharePercent: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  tokens: number;
  period: string;
  isSelf?: boolean;
  /** TODO(backend-leaderboard-pool): backend should return subsetCount for pool leaderboard UI */
  subsetCount?: number;
}

export interface HonorItem {
  id: string;
  title: string;
  description: string;
  achievedAt: string;
  /** Optional badge code / image when backend supports marketing badges */
  code?: string;
  imageUrl?: string | null;
  reward?: number;
}

// ── Capital / Funds ──────────────────────────────────────────
export interface Fund {
  id: string;
  name: string;
  minAmount: number;
  maxAmount: number;
  returnRate: number;
  term: number;
}

export interface CapitalDepositStats {
  totalDeposited: number;
  activeDeposits: number;
  totalReturn: number;
  pendingReturn: number;
}

// ── Notifications ─────────────────────────────────────────────
export type NotificationType = "system" | "network" | "promotion";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
}

export interface LoginActivity {
  id: string;
  ip: string;
  device: string;
  location?: string;
  createdAt: string;
  status: "success" | "failed";
}

// ── Shared ───────────────────────────────────────────────────
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
