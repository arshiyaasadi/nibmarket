import { apiClient } from 'src/lib/api-client'
import type { LeaderboardPeriod } from 'src/types/api/dashboard'

export async function fetchDashboardLeaderboardRaw(period: LeaderboardPeriod = 'current'): Promise<unknown> {
  const { data } = await apiClient.get('/api/dashboard/leaderboard', {
    params: { period }
  })

  return data
}
