'use client'

import { fetchTwinPriceChartRaw } from 'src/api/manager/twin-token/price-history'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapTwinPriceChart } from 'src/lib/twin-token/mappers'
import { mockTwinPriceChart } from 'src/mocks/twin-token'

export function useTwinTokenPriceChart() {
  return useApiResource({
    slug: 'manager-twin-price-chart',
    mockData: mockTwinPriceChart,
    fetcher: fetchTwinPriceChartRaw,
    mapResponse: mapTwinPriceChart
  })
}
