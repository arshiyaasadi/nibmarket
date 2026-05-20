import { apiClient } from 'src/lib/api-client'

export async function fetchLeaderboardHonorsRaw(): Promise<unknown> {
  const { data } = await apiClient.get('/api/leaderboard/honors')

  return data
}
