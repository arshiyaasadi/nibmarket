export type PoolBalanceResponse = {
  poolBalance: number
  participantsCount: number
  monthlyChangePercent: number
}

export type LeaderboardEntry = {
  id: number
  rank: number
  name: string
  points: number
  subordinates: number
  currentMonthRank?: number
}

export type LeaderboardListResponse = {
  entries: LeaderboardEntry[]
}

export type HonorItem = {
  id: number
  title: string
  icon: string
  color: string
  description: string
  count: number
  totalPoints: number
}

export type HonorsResponse = {
  honors: HonorItem[]
}

export type Mission = {
  id: number
  title: string
  completed: boolean
  reward: string
}

export type MissionsResponse = {
  missions: Mission[]
}
