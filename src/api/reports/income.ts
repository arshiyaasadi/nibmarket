import { apiClient } from 'src/lib/api-client'
import type { ReportsIncomeQuery } from 'src/types/api/reports'

export async function fetchReportsIncomeRaw(params?: ReportsIncomeQuery): Promise<unknown> {
  const { data } = await apiClient.get('/api/reports/income', { params })

  return data
}
