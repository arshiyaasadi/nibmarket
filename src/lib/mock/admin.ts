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
  AdminTwinAllocationSource,
  AdminTwinAllocationsResponse,
  AdminTwinOverviewResponse,
} from "@/types/admin";
import type { MockUserRecord } from "@/lib/mock/fixtures";
import type { NetworkSubset } from "@/types/mlm";
import { getTokenPriceHistory } from "@/lib/token-price/history";

const ALLOCATION_SOURCES: AdminTwinAllocationSource[] = [
  "mission_reward",
  "commission_reward",
  "registration",
  "adjustment",
  "mint",
  "pool_deposit",
];

function toAdminUserListItem(user: MockUserRecord): AdminUserListItem {
  return {
    id: user.id,
    mobile: user.mobile,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    role: user.role,
    status: user.status,
    kycStatus: user.kycStatus,
    referralCode: user.referralCode,
    createdAt: user.createdAt,
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
      description: "موجودی TWIN",
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

export async function listAdminUsers(params: {
  page: number;
  pageSize: number;
  search: string;
  status: string;
}) {
  await ensureMockStore();
  let users = [...getMockUsers().values()];
  if (params.status) {
    users = users.filter((u) => u.status === params.status);
  }
  if (params.search) {
    const q = params.search.trim();
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

export async function getAdminTwinOverview(): Promise<AdminTwinOverviewResponse> {
  await ensureMockStore();
  const users = [...getMockUsers().values()];
  let totalTokens = 0;
  let totalFrozen = 0;
  let totalAvailable = 0;

  for (const user of users) {
    const wallet = buildWalletSummary(user.balance);
    totalTokens += wallet.totalTokens;
    totalFrozen += wallet.frozenTokens;
    totalAvailable += wallet.availableTokens;
  }

  const history = getTokenPriceHistory(7);
  const latest = history.at(-1)?.price ?? 24_500;
  const previous = history.at(-2)?.price ?? latest;
  const change = previous === 0 ? 0 : ((latest - previous) / previous) * 100;

  return {
    tokenPriceRial: latest,
    tokenPriceChangePercent24h: Number(change.toFixed(2)),
    totalTokens,
    totalFrozenTokens: totalFrozen,
    frozenPercent: totalTokens > 0 ? Number(((totalFrozen / totalTokens) * 100).toFixed(1)) : 0,
    totalAvailableTokens: totalAvailable,
  };
}

export async function listAdminTwinAllocations(params: {
  page: number;
  pageSize: number;
  search: string;
}): Promise<AdminTwinAllocationsResponse> {
  await ensureMockStore();
  let users = [...getMockUsers().values()].filter((user) => user.balance > 0);

  if (params.search) {
    const q = params.search.trim();
    users = users.filter(
      (user) =>
        user.mobile.includes(q) ||
        user.firstName.includes(q) ||
        user.lastName.includes(q) ||
        user.referralCode.includes(q),
    );
  }

  const rows = users
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
