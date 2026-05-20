import { apiClient } from 'src/lib/api-client'
import type { SubmitReferrerRequest } from 'src/types/api/network'

export async function fetchNetworkReferrerRaw(): Promise<unknown> {
  const { data } = await apiClient.get('/api/network/referrer')

  return data
}

export async function postNetworkReferrerRaw(body: SubmitReferrerRequest): Promise<unknown> {
  const { data } = await apiClient.post('/api/network/referrer', body)

  return data
}
