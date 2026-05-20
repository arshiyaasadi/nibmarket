'use client'

import { fetchLeaderboardMissionsRaw } from 'src/api/leaderboard/missions'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapLeaderboardMissions } from 'src/lib/leaderboard/mappers'
import { mockLeaderboardMissions } from 'src/mocks/leaderboard'

export function useLeaderboardMissions() {
  return useApiResource({
    slug: 'leaderboard-missions',
    mockData: mockLeaderboardMissions,
    fetcher: fetchLeaderboardMissionsRaw,
    mapResponse: mapLeaderboardMissions
  })
}
