import { apiClient } from 'src/lib/api-client'

export async function fetchReportsCapitalDepositRaw(): Promise<unknown> {
  const { data } = await apiClient.get('/api/reports/capital-deposit')

  return data
}
