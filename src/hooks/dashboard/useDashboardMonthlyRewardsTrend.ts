'use client'

import { fetchDashboardMonthlyRewardsTrendRaw } from 'src/api/dashboard/charts'
import { useApiResource } from 'src/hooks/dashboard/useApiResource'
import { mapDashboardMonthlyRewardsTrend } from 'src/lib/dashboard/mappers'
import { mockDashboardMonthlyRewardsTrend } from 'src/mocks/dashboard'

export function useDashboardMonthlyRewardsTrend() {
  return useApiResource({
    slug: 'dashboard-chart-monthly-rewards-alt',
    mockData: mockDashboardMonthlyRewardsTrend,
    fetcher: fetchDashboardMonthlyRewardsTrendRaw,
    mapResponse: mapDashboardMonthlyRewardsTrend
  })
}
