import { prisma } from "@/lib/db/prisma";
import { decimalToNumber, getFullName, mapLeaderboardEntry } from "@/types/mappers";
import type { CompetitionPeriod, CompetitionPool, HonorItem, LeaderboardEntry, PoolBalance } from "@/types/mlm";

async function getUserLeaderboardRows(limit = 20) {
  const wallets = await prisma.wallets.findMany({
    where: { owner_type: "USER", owner_id: { not: null }, status: "active" },
  });
  const walletIds = wallets.map((wallet) => wallet.id);
  const balances = await prisma.wallet_balances.findMany({
    where: { wallet_id: { in: walletIds } },
  });

  const balanceByWallet = new Map(balances.map((balance) => [balance.wallet_id, balance]));
  const userIds = wallets.map((wallet) => wallet.owner_id).filter((id): id is string => !!id);
  const profiles = await prisma.user_profiles.findMany({ where: { user_id: { in: userIds } } });
  const profileByUser = new Map(profiles.map((profile) => [profile.user_id, profile]));

  return wallets
    .map((wallet) => ({
      userId: wallet.owner_id ?? "",
      fullName: getFullName(profileByUser.get(wallet.owner_id ?? "")),
      tokens: decimalToNumber(balanceByWallet.get(wallet.id)?.total),
    }))
    .filter((row) => row.userId)
    .sort((a, b) => b.tokens - a.tokens)
    .slice(0, limit);
}

export async function getLeaderboard(currentUserId?: string, limit = 20): Promise<LeaderboardEntry[]> {
  const rows = await getUserLeaderboardRows(limit);
  return rows.map((row, index) => mapLeaderboardEntry(row, index, currentUserId));
}

export async function getPoolBalance(userId: string): Promise<PoolBalance> {
  const pool = await prisma.pools.findFirst({
    where: { code: "REWARDS" },
  });
  const poolBalance = pool
    ? await prisma.wallet_balances.findUnique({ where: { wallet_id: pool.wallet_id } })
    : null;
  const userWallet = await prisma.wallets.findFirst({
    where: { owner_type: "USER", owner_id: userId },
  });
  const userBalance = userWallet
    ? await prisma.wallet_balances.findUnique({ where: { wallet_id: userWallet.id } })
    : null;

  const totalPool = decimalToNumber(poolBalance?.total);
  const userShare = decimalToNumber(userBalance?.total);

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
