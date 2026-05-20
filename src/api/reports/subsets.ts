import { apiClient } from 'src/lib/api-client'
import type { ReportsIncomeQuery } from 'src/types/api/reports'

export async function fetchReportsSubsetsRaw(params?: ReportsIncomeQuery): Promise<unknown> {
  const { data } = await apiClient.get('/api/reports/subsets', { params })

  return data
}
