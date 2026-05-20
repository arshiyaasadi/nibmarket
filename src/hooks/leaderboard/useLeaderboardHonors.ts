'use client'

import { fetchLeaderboardHonorsRaw } from 'src/api/leaderboard/honors'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapLeaderboardHonors } from 'src/lib/leaderboard/mappers'
import { mockLeaderboardHonors } from 'src/mocks/leaderboard'

export function useLeaderboardHonors() {
  return useApiResource({
    slug: 'leaderboard-honors',
    mockData: mockLeaderboardHonors,
    fetcher: fetchLeaderboardHonorsRaw,
    mapResponse: mapLeaderboardHonors
  })
}
