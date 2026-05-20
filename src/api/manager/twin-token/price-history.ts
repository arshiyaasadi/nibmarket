import { apiClient } from 'src/lib/api-client'

export async function fetchTwinPriceChartRaw(): Promise<unknown> {
  const { data } = await apiClient.get('/api/manager/twin-token/price-history')

  return data
}
