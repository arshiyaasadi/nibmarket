import { apiClient } from 'src/lib/api-client'

export async function fetchDashboardWalletRaw(): Promise<unknown> {
  const { data } = await apiClient.get('/api/dashboard/wallet')

  return data
}
