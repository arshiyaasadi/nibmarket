import { apiClient } from 'src/lib/api-client'

export async function fetchDashboardRewardsRaw(): Promise<unknown> {
  const { data } = await apiClient.get('/api/dashboard/rewards')

  return data
}
