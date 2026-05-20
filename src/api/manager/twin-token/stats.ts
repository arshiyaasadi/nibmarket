import { apiClient } from 'src/lib/api-client'

export async function fetchTwinTokenStatsRaw(): Promise<unknown> {
  const { data } = await apiClient.get('/api/manager/twin-token/stats')

  return data
}
