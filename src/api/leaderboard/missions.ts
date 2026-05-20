import { apiClient } from 'src/lib/api-client'

export async function fetchLeaderboardMissionsRaw(): Promise<unknown> {
  const { data } = await apiClient.get('/api/leaderboard/missions')

  return data
}
