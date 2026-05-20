'use client'

import { fetchTwinTokenStatsRaw } from 'src/api/manager/twin-token/stats'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapTwinTokenStats } from 'src/lib/twin-token/mappers'
import { mockTwinTokenStats } from 'src/mocks/twin-token'

export function useTwinTokenStats() {
  return useApiResource({
    slug: 'manager-twin-stats',
    mockData: mockTwinTokenStats,
    fetcher: fetchTwinTokenStatsRaw,
    mapResponse: mapTwinTokenStats
  })
}
