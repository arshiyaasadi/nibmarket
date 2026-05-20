'use client'

import { useCallback } from 'react'

import { fetchDashboardLeaderboardRaw } from 'src/api/dashboard/leaderboard'
import { useApiResource } from 'src/hooks/dashboard/useApiResource'
import { mapDashboardLeaderboard } from 'src/lib/dashboard/mappers'
import { mockDashboardLeaderboard } from 'src/mocks/dashboard'
import type { LeaderboardPeriod } from 'src/types/api/dashboard'

export function useDashboardLeaderboard(period: LeaderboardPeriod) {
  const mockData = mockDashboardLeaderboard(period)
  const fetcher = useCallback(() => fetchDashboardLeaderboardRaw(period), [period])
  const mapResponse = useCallback((raw: unknown) => mapDashboardLeaderboard(raw, period), [period])

  return useApiResource({
    slug: 'dashboard-leaderboard',
    mockData,
    fetcher,
    mapResponse,
    deps: [period]
  })
}
