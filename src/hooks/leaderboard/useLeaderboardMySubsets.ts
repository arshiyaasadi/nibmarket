'use client'

import { fetchLeaderboardMySubsetsRaw } from 'src/api/leaderboard/my-subsets'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapLeaderboardMySubsets } from 'src/lib/leaderboard/mappers'
import { mockLeaderboardMySubsets } from 'src/mocks/leaderboard'

export function useLeaderboardMySubsets() {
  return useApiResource({
    slug: 'leaderboard-my-subsets',
    mockData: mockLeaderboardMySubsets,
    fetcher: fetchLeaderboardMySubsetsRaw,
    mapResponse: mapLeaderboardMySubsets
  })
}
