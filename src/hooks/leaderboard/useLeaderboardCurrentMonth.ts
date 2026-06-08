'use client'

import { fetchLeaderboardCurrentMonthRaw } from 'src/api/leaderboard/current-month'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapDashboardLeaderboardToPoolEntries } from 'src/lib/leaderboard/dashboard-leaderboard-adapter'
import { mockLeaderboardCurrentMonth } from 'src/mocks/leaderboard'

export function useLeaderboardCurrentMonth() {
  return useApiResource({
    slug: 'leaderboard-current-month',
    mockData: mockLeaderboardCurrentMonth,
    fetcher: fetchLeaderboardCurrentMonthRaw,
    mapResponse: raw => mapDashboardLeaderboardToPoolEntries(raw, 'current')
  })
}
