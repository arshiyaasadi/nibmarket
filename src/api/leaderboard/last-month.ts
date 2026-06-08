import { fetchDashboardLeaderboardRaw } from 'src/api/dashboard/leaderboard'
import type { LeaderboardPeriod } from 'src/types/api/dashboard'

export async function fetchLeaderboardLastMonthRaw(period: LeaderboardPeriod = 'previous'): Promise<unknown> {
  return fetchDashboardLeaderboardRaw(period)
}
