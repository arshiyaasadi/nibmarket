import { apiClient } from 'src/lib/api-client'

export async function fetchLeaderboardPoolBalanceRaw(): Promise<unknown> {
  const { data } = await apiClient.get('/api/leaderboard/pool-balance')

  return data
}
