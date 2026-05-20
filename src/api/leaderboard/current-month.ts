import { apiClient } from 'src/lib/api-client'

export async function fetchLeaderboardCurrentMonthRaw(): Promise<unknown> {
  const { data } = await apiClient.get('/api/leaderboard/current-month')

  return data
}
