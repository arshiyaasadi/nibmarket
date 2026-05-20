'use client'

import { fetchLeaderboardCurrentMonthRaw } from 'src/api/leaderboard/current-month'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapLeaderboardCurrentMonth } from 'src/lib/leaderboard/mappers'
import { mockLeaderboardCurrentMonth } from 'src/mocks/leaderboard'

export function useLeaderboardCurrentMonth() {
  return useApiResource({
    slug: 'leaderboard-current-month',
    mockData: mockLeaderboardCurrentMonth,
    fetcher: fetchLeaderboardCurrentMonthRaw,
    mapResponse: mapLeaderboardCurrentMonth
  })
}
