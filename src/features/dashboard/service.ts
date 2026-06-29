import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { TokenSummary, WalletSummary, LeaderboardEntry, Mission, MissionDef, UserReferralInfo } from "@/types/mlm";

export const DashboardService = {
  getRewards: (): Promise<TokenSummary[]> =>
    apiClient.get(ENDPOINTS.DASHBOARD.REWARDS),

  getWallet: (): Promise<WalletSummary> =>
    apiClient.get(ENDPOINTS.DASHBOARD.WALLET),

  getReferral: (): Promise<UserReferralInfo> =>
    apiClient.get(ENDPOINTS.DASHBOARD.REFERRAL),

  getLeaderboard: (): Promise<LeaderboardEntry[]> =>
    apiClient.get(ENDPOINTS.DASHBOARD.LEADERBOARD),

  getMissions: (): Promise<Mission[]> =>
    apiClient.get(ENDPOINTS.LEADERBOARD.MISSIONS),

  getMissionsList: (): Promise<MissionDef[]> =>
    apiClient.get(ENDPOINTS.MISSIONS.LIST),

};
