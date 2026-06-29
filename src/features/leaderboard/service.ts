import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { CompetitionPeriod, CompetitionPool, HonorItem, LeaderboardEntry, Mission, PoolBalance } from "@/types/mlm";

export const LeaderboardService = {
  getPoolBalance: (): Promise<PoolBalance> =>
    apiClient.get(ENDPOINTS.LEADERBOARD.POOL_BALANCE),

  getCurrentMonth: (): Promise<LeaderboardEntry[]> =>
    apiClient.get(ENDPOINTS.LEADERBOARD.CURRENT_MONTH),

  getLastMonth: (): Promise<LeaderboardEntry[]> =>
    apiClient.get(ENDPOINTS.LEADERBOARD.LAST_MONTH),

  getMySubsets: (): Promise<LeaderboardEntry[]> =>
    apiClient.get(ENDPOINTS.LEADERBOARD.MY_SUBSETS),

  getHonors: (): Promise<HonorItem[]> =>
    apiClient.get(ENDPOINTS.LEADERBOARD.HONORS),

  getMissions: (): Promise<Mission[]> =>
    apiClient.get(ENDPOINTS.LEADERBOARD.MISSIONS),

  getCompetitionPool: (): Promise<CompetitionPool> =>
    apiClient.get(ENDPOINTS.LEADERBOARD.COMPETITION_POOL),

  getHistory: (): Promise<CompetitionPeriod[]> =>
    apiClient.get(ENDPOINTS.LEADERBOARD.HISTORY),
};
