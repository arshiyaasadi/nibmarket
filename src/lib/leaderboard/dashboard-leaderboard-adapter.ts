import { mapDashboardLeaderboard } from 'src/lib/dashboard/mappers'
import type { LeaderboardPeriod } from 'src/types/api/dashboard'
import type { LeaderboardEntry, LeaderboardListResponse } from 'src/types/api/leaderboard'

export function mapDashboardLeaderboardToPoolEntries(
  raw: unknown,
  period: LeaderboardPeriod
): LeaderboardListResponse {
  const mapped = mapDashboardLeaderboard(raw, period)

  const entries: LeaderboardEntry[] = mapped.entries.map((entry, index) => ({
    id: index + 1,
    rank: entry.rank,
    name: entry.name,
    points: entry.totalPoints,
    subordinates: entry.subordinates
  }))

  return { entries }
}
