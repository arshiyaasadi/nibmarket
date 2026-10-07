import { mapLeaderboardEntry } from "@/types/mappers";
import { getMockUser } from "@/lib/mock/store";
import type {
  CompetitionPeriod,
  CompetitionPool,
  HonorItem,
  LeaderboardEntry,
  PoolBalance,
} from "@/types/mlm";

const MOCK_POOL_ROWS = [
  { userId: "u2", fullName: "علی رضایی", tokens: 9800, subsetCount: 42 },
  { userId: "u3", fullName: "مریم احمدی", tokens: 7600, subsetCount: 31 },
  { userId: "u4", fullName: "حسین کریمی", tokens: 6400, subsetCount: 28 },
  { userId: "u5", fullName: "سارا محمدی", tokens: 5200, subsetCount: 19 },
  { userId: "u6", fullName: "رضا نوری", tokens: 4100, subsetCount: 15 },
  { userId: "u7", fullName: "نیلوفر حسینی", tokens: 3300, subsetCount: 12 },
  { userId: "u8", fullName: "امیر صادقی", tokens: 2700, subsetCount: 9 },
  { userId: "u9", fullName: "فاطمه اکبری", tokens: 2100, subsetCount: 7 },
];

const MOCK_SUBSET_ROWS = [
  { userId: "s1", fullName: "محمد نباتی", tokens: 1850, subsetCount: 8 },
  { userId: "s2", fullName: "بهرام حاجی", tokens: 1420, subsetCount: 5 },
  { userId: "s3", fullName: "سعید نیکنام", tokens: 980, subsetCount: 3 },
  { userId: "s4", fullName: "فریده زینالی", tokens: 740, subsetCount: 2 },
  { userId: "s5", fullName: "پریسا مرادی", tokens: 510, subsetCount: 1 },
  { userId: "s6", fullName: "کامران یوسفی", tokens: 320, subsetCount: 0 },
  { userId: "s7", fullName: "لیلا رستمی", tokens: 180, subsetCount: 0 },
];

export async function getLeaderboard(
  currentUserId?: string,
  limit = 7,
): Promise<LeaderboardEntry[]> {
  const selfBalance = getMockUser(currentUserId ?? "")?.balance ?? 1250;
  const rows = [
    {
      userId: currentUserId ?? "u1",
      fullName: "شما",
      tokens: selfBalance,
      subsetCount: 4,
    },
    ...MOCK_POOL_ROWS,
  ]
    .sort((a, b) => b.tokens - a.tokens)
    .slice(0, limit);

  return rows.map((row, index) => mapLeaderboardEntry(row, index, currentUserId));
}

/** Leaderboard of the current user's direct subsets, ranked by Twin balance. */
export async function getMySubsetsLeaderboard(
  _currentUserId?: string,
  limit = 7,
): Promise<LeaderboardEntry[]> {
  const rows = [...MOCK_SUBSET_ROWS].sort((a, b) => b.tokens - a.tokens).slice(0, limit);
  return rows.map((row, index) => mapLeaderboardEntry(row, index));
}

export async function getPoolBalance(userId: string): Promise<PoolBalance> {
  const userShare = getMockUser(userId)?.balance ?? 0;
  const totalPool = 50000;
  return {
    totalPool,
    userShare,
    sharePercent: totalPool > 0 ? Number(((userShare / totalPool) * 100).toFixed(2)) : 0,
  };
}

export async function getCompetitionPool(userId: string): Promise<CompetitionPool> {
  const [pool, leaderboard] = await Promise.all([
    getPoolBalance(userId),
    getLeaderboard(userId, 100),
  ]);
  const myRank = leaderboard.find((entry) => entry.userId === userId)?.rank;
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  return {
    totalPool: pool.totalPool,
    dailyChange: 0,
    participantCount: leaderboard.length,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    contextTitle: "رقابت جاری",
    topWinners: 5,
    myRank,
  };
}

export async function getEmptyHonors(): Promise<HonorItem[]> {
  return [];
}

export async function getEmptyCompetitionHistory(): Promise<CompetitionPeriod[]> {
  return [];
}
