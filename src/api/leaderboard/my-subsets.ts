import { apiClient } from 'src/lib/api-client'

export async function fetchLeaderboardMySubsetsRaw(): Promise<unknown> {
  const { data } = await apiClient.get('/api/leaderboard/my-subsets')

  return data
}
