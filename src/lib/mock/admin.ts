import {
  ensureMockStore,
  getMockLoginSessions,
  getMockMissions,
  getMockUsers,
} from "@/lib/mock/store";
import { MOCK_ADMIN_DEMOGRAPHICS, MOCK_INVITED, MOCK_USER_ID } from "@/lib/mock/fixtures";
import type {
  AdminUserListItem,
  AdminUserModuleAccess,
  AdminUserProfileResponse,
  AdminUsersDemographicsResponse,
  AdminUsersKycSummaryResponse,
  AdminTwinAllocationSource,
  AdminTwinAllocationsResponse,
  AdminTwinOverviewResponse,
  AdminTwinSourcesResponse,
  AdminTwinSupplyAdjustmentRequest,
  AdminTwinSupplyAdjustmentRow,
  AdminTwinSupplyAdjustmentsResponse,
} from "@/types/admin";
import type { MockUserRecord } from "@/lib/mock/fixtures";
import type { NetworkSubset } from "@/types/mlm";
import { normalizeSearchInput } from "@/lib/normalization/digits";
import { getTokenPriceHistory } from "@/lib/token-price/history";

const ALLOCATION_SOURCES: AdminTwinAllocationSource[] = [
  "mission_reward",
  "commission_reward",
  "registration",
  "adjustment",
  "mint",
  "pool_deposit",
];

const ALLOCATION_SOURCE_LABELS: Record<AdminTwinAllocationSource, string> = {
  mission_reward: "پاداش مأموریت",
  commission_reward: "کمیسیون شبکه",
  registration: "ثبت‌نام",
  adjustment: "تعدیل سیستمی",
  mint: "صدور",
  pool_deposit: "استخر",
};

function resolveHasSejamIdentity(user: MockUserRecord): boolean {
  if (typeof user.hasSejamIdentity === "boolean") return user.hasSejamIdentity;
  return user.kycStatus === "verified" && Boolean(user.nationalId);
}

function toAdminUserListItem(user: MockUserRecord): AdminUserListItem {
  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const hasSejamIdentity = resolveHasSejamIdentity(user);
  const hasKyc = hasSejamIdentity;

  return {
    id: user.id,
    mobile: user.mobile,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName,
    role: user.role,
    status: user.status,
    kycStatus: user.kycStatus,
    hasSejamIdentity,
    referralCode: user.referralCode,
    createdAt: user.createdAt,
    sejam: hasKyc
      ? {
          investorId: 1000,
          legalType: 0,
          isIranian: true,
          authenticationStatusTypeId: 2,
          sejamStatusId: 7,
          nationalNo: user.nationalId,
          firstName: user.firstName,
          lastName: user.lastName,
          fatherName: "علی",
          gender: user.gender,
          mobile: user.mobile,
          email: user.email,
          birthDate: user.birthDate?.includes("-")
            ? user.birthDate.replace(/-/g, "/")
            : user.birthDate,
          birthCertificateSerial: "ا-12 345678",
          birthCertificateNumber: "1234",
          birthCertificatePlaceOfIssue: null,
          placeOfBirth: "تهران",
          exchangeCode: null,
          nationalityId: null,
          englishFirstName: null,
          englishLastName: null,
          englishFatherName: null,
          companyName: null,
          registerNo: null,
          companyRegisterDate: null,
          companyRegisterPlace: null,
          ceoNationalNo: null,
          isArchive: null,
          registeredAt: user.createdAt,
          addresses: [
            {
              addressId: 1,
              addressBody: "تهران، خیابان ولیعصر، پلاک ۱۲۳",
              postalCode: "1234567890",
              phoneNumber: "2122334455",
              cityId: null,
              isActive: true,
              isSejamAddress: true,
              isDefault: true,
            },
          ],
          bankAccounts: [],
        }
      : null,
  };
}

function buildWalletSummary(balance: number) {
  const frozen = Math.floor(balance * 0.08);
  const pending = Math.floor(balance * 0.05);
  return {
    totalTokens: balance,
    availableTokens: Math.max(balance - frozen - pending, 0),
    frozenTokens: frozen,
    pendingTokens: pending,
  };
}

function buildClientModules(user: MockUserRecord): AdminUserModuleAccess[] {
  const active = user.status === "active";
  return [
    {
      key: "dashboard",
      label: "داشبورد",
      path: "/dashboard",
      enabled: active,
      description: "خلاصه عملکرد",
    },
    {
      key: "network",
      label: "شبکه",
      path: "/dashboard/network",
      enabled: active,
      description: "زیرمجموعه و دعوت",
    },
    {
      key: "wallet",
      label: "کیف پول",
      path: "/dashboard/wallet",
      enabled: active,
      description: "موجودی تنوین",
    },
    {
      key: "subset-deposits",
      label: "سپرده زیرمجموعه",
      path: "/dashboard/subset-deposits",
      enabled: active,
      description: "کمیسیون شبکه",
    },
    {
      key: "missions",
      label: "مأموریت‌ها",
      path: "/dashboard/missions",
      enabled: active,
      description: "مأموریت‌های فعال",
    },
    {
      key: "leaderboard",
      label: "لیدربورد",
      path: "/dashboard/leaderboard",
      enabled: active,
      description: "رتبه‌بندی",
    },
    {
      key: "capital",
      label: "سرمایه‌گذاری",
      path: "/dashboard/capital",
      enabled: active && user.nibMarketLinked,
      description: "صندوق‌ها",
    },
    {
      key: "reports",
      label: "گزارش‌ها",
      path: "/dashboard/reports/subsets",
      enabled: active,
      description: "گزارش درآمد و زیرمجموعه",
    },
    {
      key: "notifications",
      label: "اعلان‌ها",
      path: "/dashboard/notifications",
      enabled: active,
      description: "پیام‌های سیستم",
    },
  ];
}

function buildSubordinates(userId: string): NetworkSubset[] {
  if (userId !== MOCK_USER_ID) {
    return MOCK_INVITED.slice(0, 2).map((person) => ({
      id: person.id,
      firstName: person.firstName,
      lastName: person.lastName,
      fullName: person.fullName,
      level: person.level ?? 1,
      joinDate: person.joinDate ?? new Date().toISOString(),
      subMembersCount: person.subMembersCount ?? 0,
      leaderboardRank: undefined,
      directParentUserId: userId,
    }));
  }

  return MOCK_INVITED.map((person) => ({
    id: person.id,
    firstName: person.firstName,
    lastName: person.lastName,
    fullName: person.fullName,
    level: person.level ?? 1,
    joinDate: person.joinDate ?? new Date().toISOString(),
    subMembersCount: person.subMembersCount ?? 0,
    leaderboardRank: undefined,
    directParentUserId: userId,
  }));
}

export async function getAdminStats() {
  await ensureMockStore();
  const users = [...getMockUsers().values()];
  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "active").length,
    activeMissions: getMockMissions().filter((m) => !m.completed).length,
  };
}

export async function getAdminUsersDemographics(): Promise<AdminUsersDemographicsResponse> {
  await ensureMockStore();
  return MOCK_ADMIN_DEMOGRAPHICS;
}

/** GET /admin/users/kyc-summary — identity verification counts. */
export async function getAdminUsersKycSummary(): Promise<AdminUsersKycSummaryResponse> {
  await ensureMockStore();
  const users = [...getMockUsers().values()];
  const verifiedCount = users.filter((u) => resolveHasSejamIdentity(u)).length;
  const totalUsers = users.length;
  return {
    totalUsers,
    verifiedCount,
    unverifiedCount: totalUsers - verifiedCount,
  };
}

export async function listAdminUsers(params: {
  page: number;
  pageSize: number;
  search: string;
  status: string;
  hasSejamIdentity?: "" | "true" | "false";
}) {
  await ensureMockStore();
  let users = [...getMockUsers().values()];
  if (params.status) {
    users = users.filter((u) => u.status === params.status);
  }
  if (params.hasSejamIdentity === "true") {
    users = users.filter((u) => resolveHasSejamIdentity(u));
  } else if (params.hasSejamIdentity === "false") {
    users = users.filter((u) => !resolveHasSejamIdentity(u));
  }
  if (params.search) {
    const q = normalizeSearchInput(params.search);
    users = users.filter(
      (u) =>
        u.mobile.includes(q) ||
        u.email.includes(q) ||
        u.firstName.includes(q) ||
        u.lastName.includes(q) ||
        `${u.firstName} ${u.lastName}`.trim().includes(q) ||
        u.referralCode.includes(q),
    );
  }
  const total = users.length;
  const slice = users.slice(params.page * params.pageSize, (params.page + 1) * params.pageSize);
  return {
    data: slice.map(toAdminUserListItem),
    total,
    page: params.page,
    pageSize: params.pageSize,
    pageCount: Math.ceil(total / params.pageSize) || 1,
  };
}

/** Mock stand-in for POST /admin/users/sync (Nibmarket refresh). */
export async function syncAdminUsersFromNibmarket() {
  await ensureMockStore();
  const count = getMockUsers().size;
  return {
    success: true as const,
    syncedCount: count,
    message: "mock_users_synced",
  };
}

export async function getAdminUserProfile(
  userId: string,
): Promise<AdminUserProfileResponse | null> {
  await ensureMockStore();
  const user = getMockUsers().get(userId);
  if (!user) return null;

  const subordinates = buildSubordinates(userId);
  const missions = getMockMissions();
  const completed = missions.filter((m) => m.completed).length;

  return {
    user: {
      ...toAdminUserListItem(user),
      birthDate: user.birthDate,
      gender: user.gender,
      nationalId: user.nationalId,
      nibMarketLinked: user.nibMarketLinked,
    },
    wallet: buildWalletSummary(user.balance),
    subordinates,
    directSubordinatesCount: subordinates.filter((s) => s.level === 1).length,
    totalNetworkSize: subordinates.length,
    modules: buildClientModules(user),
    subsetDeposits: {
      today: user.id === MOCK_USER_ID ? 120 : 0,
      thisMonth: user.id === MOCK_USER_ID ? 1850 : 240,
      total: user.id === MOCK_USER_ID ? 12400 : 980,
      activeSubsets: subordinates.filter((s) => s.level === 1).length,
      pendingAmount: user.id === MOCK_USER_ID ? 320 : 0,
    },
    missionProgress: {
      completed,
      total: missions.length,
      activeCount: missions.filter((m) => !m.completed).length,
    },
    recentSessions: getMockLoginSessions(userId),
    referrer:
      user.id === MOCK_USER_ID
        ? {
            id: "ref-001",
            fullName: "محمد نباتي",
            level: 2,
            inviteCode: "NIB998877",
            inviteType: "regular",
          }
        : null,
  };
}

export async function updateAdminUserStatus(userId: string, status: string) {
  const user = getMockUsers().get(userId);
  if (!user) return false;
  user.status = status as typeof user.status;
  return true;
}

export async function updateAdminUserRole(userId: string, roleCode: string) {
  const user = getMockUsers().get(userId);
  if (!user) return false;
  user.role = roleCode as typeof user.role;
  return true;
}

export {
  getAdminMissionJobsHealth,
  getAdminMissionsOverview,
  listAdminMissionCompletions,
  listAdminMissions,
  updateAdminMissionStatus,
} from "./admin-missions";

export async function listNetworkClosure() {
  return { data: [], total: 0, page: 0, pageSize: 50, pageCount: 0 };
}

function resolveAllocationSource(userId: string): AdminTwinAllocationSource {
  let hash = 0;
  for (let i = 0; i < userId.length; i += 1) {
    hash = (hash + userId.charCodeAt(i)) % ALLOCATION_SOURCES.length;
  }
  return ALLOCATION_SOURCES[hash];
}

/** Mock treasury (unallocated). Adjusted by supply-adjustments. */
let mockUnallocatedTokens = 50_000;

const mockSupplyAdjustments: AdminTwinSupplyAdjustmentRow[] = [];

function buildSourceBreakdown(
  users: { id: string; balance: number }[],
): AdminTwinOverviewResponse["sourceBreakdown"] {
  const sums = new Map<AdminTwinAllocationSource, number>();
  for (const source of ALLOCATION_SOURCES) sums.set(source, 0);

  for (const user of users) {
    if (user.balance <= 0) continue;
    const source = resolveAllocationSource(user.id);
    sums.set(source, (sums.get(source) ?? 0) + user.balance);
  }

  return ALLOCATION_SOURCES.map((source) => ({
    source,
    totalTokens: sums.get(source) ?? 0,
  }));
}

export async function listAdminTwinSources(): Promise<AdminTwinSourcesResponse> {
  await ensureMockStore();
  return {
    items: ALLOCATION_SOURCES.map((code) => ({
      code,
      label: ALLOCATION_SOURCE_LABELS[code],
    })),
  };
}

export async function getAdminTwinOverview(): Promise<AdminTwinOverviewResponse> {
  await ensureMockStore();
  const users = [...getMockUsers().values()];
  let allocatedTokens = 0;
  let totalFrozen = 0;
  let totalAvailable = 0;

  for (const user of users) {
    const wallet = buildWalletSummary(user.balance);
    allocatedTokens += wallet.totalTokens;
    totalFrozen += wallet.frozenTokens;
    totalAvailable += wallet.availableTokens;
  }

  const history = getTokenPriceHistory(7);
  const latest = history.at(-1)?.price ?? 24_500;
  const previous = history.at(-2)?.price ?? latest;
  const change = previous === 0 ? 0 : ((latest - previous) / previous) * 100;
  const totalTokens = allocatedTokens + mockUnallocatedTokens;

  return {
    tokenPriceRial: latest,
    tokenPriceChangePercent24h: Number(change.toFixed(2)),
    totalTokens,
    allocatedTokens,
    unallocatedTokens: mockUnallocatedTokens,
    totalFrozenTokens: totalFrozen,
    frozenPercent:
      allocatedTokens > 0 ? Number(((totalFrozen / allocatedTokens) * 100).toFixed(1)) : 0,
    totalAvailableTokens: totalAvailable,
    sourceBreakdown: buildSourceBreakdown(users),
  };
}

export async function listAdminTwinAllocations(params: {
  page: number;
  pageSize: number;
  search: string;
  source?: string;
}): Promise<AdminTwinAllocationsResponse> {
  await ensureMockStore();
  let users = [...getMockUsers().values()].filter((user) => user.balance > 0);

  if (params.search) {
    const q = normalizeSearchInput(params.search);
    users = users.filter(
      (user) =>
        user.mobile.includes(q) ||
        user.firstName.includes(q) ||
        user.lastName.includes(q) ||
        user.referralCode.includes(q),
    );
  }

  let rows = users
    .map((user) => {
      const wallet = buildWalletSummary(user.balance);
      const frozenPercent =
        wallet.totalTokens > 0
          ? Number(((wallet.frozenTokens / wallet.totalTokens) * 100).toFixed(1))
          : 0;

      return {
        id: `alloc-${user.id}`,
        userId: user.id,
        fullName: `${user.firstName} ${user.lastName}`.trim(),
        mobile: user.mobile,
        totalTokens: wallet.totalTokens,
        availableTokens: wallet.availableTokens,
        frozenTokens: wallet.frozenTokens,
        frozenPercent,
        primarySource: resolveAllocationSource(user.id),
        lastAllocationAt: user.createdAt,
      };
    })
    .sort((a, b) => b.totalTokens - a.totalTokens);

  if (params.source && params.source.length > 0) {
    rows = rows.filter((row) => row.primarySource === params.source);
  }

  const total = rows.length;
  const slice = rows.slice(params.page * params.pageSize, (params.page + 1) * params.pageSize);

  return {
    data: slice,
    total,
    page: params.page,
    pageSize: params.pageSize,
    pageCount: Math.ceil(total / params.pageSize) || 1,
  };
}

export async function listAdminTwinSupplyAdjustments(params: {
  page: number;
  pageSize: number;
}): Promise<AdminTwinSupplyAdjustmentsResponse> {
  await ensureMockStore();
  const rows = [...mockSupplyAdjustments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const total = rows.length;
  const slice = rows.slice(params.page * params.pageSize, (params.page + 1) * params.pageSize);
  return {
    data: slice,
    total,
    page: params.page,
    pageSize: params.pageSize,
    pageCount: Math.ceil(total / params.pageSize) || 1,
  };
}

export async function createAdminTwinSupplyAdjustment(
  body: AdminTwinSupplyAdjustmentRequest,
  actor: { name: string; userId?: string },
) {
  await ensureMockStore();
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount === 0) {
    throw new Error("INVALID_AMOUNT");
  }

  const next = mockUnallocatedTokens + amount;
  if (next < 0) {
    throw new Error("INSUFFICIENT_UNALLOCATED");
  }

  mockUnallocatedTokens = next;
  const overview = await getAdminTwinOverview();
  const entry: AdminTwinSupplyAdjustmentRow = {
    id: `supply-${Date.now()}`,
    amount,
    approxValueRial: Math.round(amount * overview.tokenPriceRial),
    effectiveDate: body.effectiveDate,
    createdAt: new Date().toISOString(),
    createdByName: actor.name,
    createdByUserId: actor.userId,
    note: body.note?.trim() || null,
  };
  mockSupplyAdjustments.unshift(entry);

  return { ok: true as const, entry, overview };
}
