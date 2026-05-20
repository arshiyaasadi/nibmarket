'use client'

import { fetchDashboardMonthlyRewardsRaw } from 'src/api/dashboard/charts'
import { useApiResource } from 'src/hooks/dashboard/useApiResource'
import { mapDashboardMonthlyRewards } from 'src/lib/dashboard/mappers'
import { mockDashboardMonthlyRewards } from 'src/mocks/dashboard'

export function useDashboardMonthlyRewards() {
  return useApiResource({
    slug: 'dashboard-chart-monthly-rewards',
    mockData: mockDashboardMonthlyRewards,
    fetcher: fetchDashboardMonthlyRewardsRaw,
    mapResponse: mapDashboardMonthlyRewards
  })
}
