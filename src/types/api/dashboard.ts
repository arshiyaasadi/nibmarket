import type { ThemeColor } from 'src/@core/layouts/types'

export type RewardTrend = 'positive' | 'negative'

export type RewardSummaryItem = {
  title: string
  stats: string
  trendNumber: string
  trend: RewardTrend
  color: ThemeColor
  icon: string
}

export type Mission = {
  id: number
  title: string
  completed: boolean
  reward: string
}

export type DashboardRewardsResponse = {
  summaries: RewardSummaryItem[]
  missions: Mission[]
}

export type TwinWalletBalance = {
  totalBalance: number
  withdrawableBalance: number
  frozenBalance: number
  currency: 'TWIN'
}

export type InvitedUserPreview = {
  id: number
  name: string
  invitedAtLabel: string
}

export type DashboardInvitesResponse = {
  totalInvited: number
  referralCode: string
  recentInvites: InvitedUserPreview[]
}

export type LeaderboardPeriod = 'current' | 'previous'

export type LeaderboardEntry = {
  rank: number
  name: string
  subordinates: number
  totalPoints: number
  growthData: number[]
}

export type DashboardLeaderboardResponse = {
  period: LeaderboardPeriod
  entries: LeaderboardEntry[]
}

export type PersianMonthIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export type MonthlyRewardPoint = {
  month: PersianMonthIndex
  monthLabel: string
  amount: number
}

export type MonthlyRewardsChartResponse = {
  seriesName: string
  unit: 'TWIN' | 'token'
  points: MonthlyRewardPoint[]
}

export type DailyGrowthPoint = {
  day: number
  dayLabel: string
  count: number
}

export type DailySubordinateGrowthResponse = {
  hasData: boolean
  seriesName: string
  points: DailyGrowthPoint[]
}

export type MonthlyRewardsTrendResponse = {
  hasData: boolean
  seriesName: string
  unit: 'TWIN' | 'token'
  points: { month: number; monthLabel?: string; amount: number }[]
}
