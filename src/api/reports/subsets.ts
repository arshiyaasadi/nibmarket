import { apiClient } from 'src/lib/api-client'
import type { ReportsSubsetsQuery } from 'src/types/api/reports'

export async function fetchReportsSubsetsRaw(params?: ReportsSubsetsQuery): Promise<unknown> {
  const { data } = await apiClient.get('/api/reports/subsets', { params })

  return data
}
