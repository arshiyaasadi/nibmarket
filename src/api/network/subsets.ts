import { apiClient } from 'src/lib/api-client'

export async function fetchNetworkSubsetsRaw(): Promise<unknown> {
  const { data } = await apiClient.get('/api/network/subsets')

  return data
}
