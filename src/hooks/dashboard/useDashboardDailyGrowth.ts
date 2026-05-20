'use client'

import { fetchDashboardDailyGrowthRaw } from 'src/api/dashboard/charts'
import { useApiResource } from 'src/hooks/dashboard/useApiResource'
import { mapDashboardDailyGrowth } from 'src/lib/dashboard/mappers'
import { mockDashboardDailyGrowth } from 'src/mocks/dashboard'

export function useDashboardDailyGrowth() {
  return useApiResource({
    slug: 'dashboard-chart-daily-growth',
    mockData: mockDashboardDailyGrowth,
    fetcher: fetchDashboardDailyGrowthRaw,
    mapResponse: mapDashboardDailyGrowth
  })
}
