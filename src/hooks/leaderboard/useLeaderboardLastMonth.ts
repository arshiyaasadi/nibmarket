'use client'

import { useCallback } from 'react'

import { fetchLeaderboardLastMonthRaw } from 'src/api/leaderboard/last-month'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapDashboardLeaderboardToPoolEntries } from 'src/lib/leaderboard/dashboard-leaderboard-adapter'
import { mockLeaderboardLastMonth } from 'src/mocks/leaderboard'
import type { LeaderboardPeriod } from 'src/types/api/dashboard'

export function useLeaderboardLastMonth(period: LeaderboardPeriod = 'previous') {
  const fetcher = useCallback(() => fetchLeaderboardLastMonthRaw(period), [period])
  const mapResponse = useCallback(
    (raw: unknown) => mapDashboardLeaderboardToPoolEntries(raw, period),
    [period]
  )

  return useApiResource({
    slug: 'leaderboard-last-month',
    mockData: mockLeaderboardLastMonth,
    fetcher,
    mapResponse,
    deps: [period]
  })
}
