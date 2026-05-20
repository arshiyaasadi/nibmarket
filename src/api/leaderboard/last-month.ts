import { apiClient } from 'src/lib/api-client'

export async function fetchLeaderboardLastMonthRaw(): Promise<unknown> {
  const { data } = await apiClient.get('/api/leaderboard/last-month')

  return data
}
