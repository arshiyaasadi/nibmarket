import { fetchDashboardLeaderboardRaw } from 'src/api/dashboard/leaderboard'

export async function fetchLeaderboardCurrentMonthRaw(): Promise<unknown> {
  return fetchDashboardLeaderboardRaw('current')
}
