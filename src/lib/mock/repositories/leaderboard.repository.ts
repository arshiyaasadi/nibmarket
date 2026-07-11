import { mapLeaderboardEntry } from "@/types/mappers";
import { getMockUser } from "@/lib/mock/store";
import type {
  CompetitionPeriod,
  CompetitionPool,
  HonorItem,
  LeaderboardEntry,
  PoolBalance,
} from "@/types/mlm";

export async function getLeaderboard(
  currentUserId?: string,
  limit = 20,
): Promise<LeaderboardEntry[]> {
  const rows = [
    {
      userId: currentUserId ?? "u1",
      fullName: "شما",
      tokens: getMockUser(currentUserId ?? "")?.balance ?? 1250,
    },
    { userId: "u2", fullName: "علی رضایی", tokens: 980 },
    { userId: "u3", fullName: "مریم احمدی", tokens: 760 },
  ]
    .sort((a, b) => b.tokens - a.tokens)
    .slice(0, limit);

  return rows.map((row, index) => mapLeaderboardEntry(row, index, currentUserId));
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
    topWinners: 20,
    myRank,
  };
}

export async function getEmptyHonors(): Promise<HonorItem[]> {
  return [];
}

export async function getEmptyCompetitionHistory(): Promise<CompetitionPeriod[]> {
  return [];
}
