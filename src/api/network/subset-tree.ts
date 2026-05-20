import { apiClient } from 'src/lib/api-client'

export async function fetchNetworkSubsetTreeRaw(): Promise<unknown> {
  const { data } = await apiClient.get('/api/network/subset-tree')

  return data
}
