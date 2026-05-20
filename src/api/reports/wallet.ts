import { apiClient } from 'src/lib/api-client'
import type { ReportsWalletQuery } from 'src/types/api/reports'

export async function fetchReportsWalletRaw(params?: ReportsWalletQuery): Promise<unknown> {
  const { data } = await apiClient.get('/api/reports/wallet', { params })

  return data
}
