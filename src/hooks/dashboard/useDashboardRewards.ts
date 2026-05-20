'use client'

import { fetchDashboardRewardsRaw } from 'src/api/dashboard/rewards'
import { useApiResource } from 'src/hooks/dashboard/useApiResource'
import { mapDashboardRewards } from 'src/lib/dashboard/mappers'
import { mockDashboardRewards } from 'src/mocks/dashboard'

export function useDashboardRewards() {
  return useApiResource({
    slug: 'dashboard-rewards',
    mockData: mockDashboardRewards,
    fetcher: fetchDashboardRewardsRaw,
    mapResponse: mapDashboardRewards
  })
}
