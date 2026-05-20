'use client'

import { fetchLeaderboardLastMonthRaw } from 'src/api/leaderboard/last-month'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapLeaderboardLastMonth } from 'src/lib/leaderboard/mappers'
import { mockLeaderboardLastMonth } from 'src/mocks/leaderboard'

export function useLeaderboardLastMonth() {
  return useApiResource({
    slug: 'leaderboard-last-month',
    mockData: mockLeaderboardLastMonth,
    fetcher: fetchLeaderboardLastMonthRaw,
    mapResponse: mapLeaderboardLastMonth
  })
}
