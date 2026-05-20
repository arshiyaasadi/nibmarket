'use client'

import { fetchLeaderboardPoolBalanceRaw } from 'src/api/leaderboard/pool-balance'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapLeaderboardPoolBalance } from 'src/lib/leaderboard/mappers'
import { mockLeaderboardPoolBalance } from 'src/mocks/leaderboard'

export function useLeaderboardPoolBalance() {
  return useApiResource({
    slug: 'leaderboard-pool-balance',
    mockData: mockLeaderboardPoolBalance,
    fetcher: fetchLeaderboardPoolBalanceRaw,
    mapResponse: mapLeaderboardPoolBalance
  })
}
