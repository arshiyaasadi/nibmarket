import { missionsData } from 'src/data/missions'
import type {
  DailySubordinateGrowthResponse,
  DashboardInvitesResponse,
  DashboardLeaderboardResponse,
  DashboardRewardsResponse,
  MonthlyRewardsChartResponse,
  MonthlyRewardsTrendResponse,
  TwinWalletBalance
} from 'src/types/api/dashboard'

const PERSIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند'
] as const

const MONTHLY_AMOUNTS = [150, 200, 180, 250, 300, 280, 350, 400, 380, 450, 420, 500]

const DAILY_COUNTS = [
  5, 8, 12, 15, 18, 22, 25, 28, 30, 35, 38, 42, 45, 48, 50, 55, 58, 60, 65, 68, 70, 75, 78, 80, 85, 88, 90,
  95, 98, 100
]

export const mockDashboardRewards: DashboardRewardsResponse = {
  summaries: [
    {
      title: 'کل پاداش بدست آمده',
      stats: '0',
      trendNumber: '+0%',
      trend: 'positive',
      color: 'primary',
      icon: 'mdi:trophy'
    },
    {
      title: 'پاداش این ماه',
      stats: '0',
      trendNumber: '+0%',
      trend: 'positive',
      color: 'success',
      icon: 'mdi:calendar-month'
    },
    {
      title: 'پاداش تجمیع شده استخر',
      stats: '0',
      trendNumber: '+0%',
      trend: 'positive',
      color: 'info',
      icon: 'mdi:water'
    }
  ],
  missions: missionsData.slice(0, 3).map((mission, index) => ({
    ...mission,
    completed: index === 0
  }))
}

export const mockDashboardWallet: TwinWalletBalance = {
  totalBalance: 68000,
  withdrawableBalance: 38000,
  frozenBalance: 30000,
  currency: 'TWIN'
}

export const mockDashboardInvites: DashboardInvitesResponse = {
  totalInvited: 24,
  referralCode: 'INVITE2024',
  recentInvites: [
    { id: 1, name: 'علی احمدی', invitedAtLabel: '2 روز پیش' },
    { id: 2, name: 'سارا محمدی', invitedAtLabel: '5 روز پیش' },
    { id: 3, name: 'رضا کریمی', invitedAtLabel: '1 هفته پیش' }
  ]
}

export const mockDashboardLeaderboard = (
  period: 'current' | 'previous' = 'current'
): DashboardLeaderboardResponse => ({
  period,
  entries: [
    { rank: 1, name: 'علی احمدی', subordinates: 45, totalPoints: 12500, growthData: [20, 35, 45, 30, 50, 60, 75] },
    { rank: 2, name: 'محمد رضایی', subordinates: 38, totalPoints: 11200, growthData: [15, 25, 30, 40, 35, 50, 65] },
    { rank: 3, name: 'فاطمه کریمی', subordinates: 32, totalPoints: 9800, growthData: [10, 20, 25, 30, 35, 40, 45] },
    { rank: 4, name: 'حسن موسوی', subordinates: 28, totalPoints: 8750, growthData: [5, 15, 20, 25, 30, 35, 40] },
    { rank: 5, name: 'زهرا نوری', subordinates: 25, totalPoints: 8200, growthData: [8, 12, 18, 22, 28, 32, 38] }
  ]
})

export const mockDashboardMonthlyRewards: MonthlyRewardsChartResponse = {
  seriesName: 'پاداش ماهانه',
  unit: 'token',
  points: MONTHLY_AMOUNTS.map((amount, i) => ({
    month: (i + 1) as MonthlyRewardsChartResponse['points'][0]['month'],
    monthLabel: PERSIAN_MONTHS[i],
    amount
  }))
}

export const mockDashboardDailyGrowth: DailySubordinateGrowthResponse = {
  hasData: false,
  seriesName: 'رشد روزانه',
  points: DAILY_COUNTS.map((count, i) => ({
    day: i + 1,
    dayLabel: `روز ${i + 1}`,
    count
  }))
}

export const mockDashboardDailyGrowthWithData: DailySubordinateGrowthResponse = {
  hasData: true,
  seriesName: 'رشد روزانه',
  points: DAILY_COUNTS.map((count, i) => ({
    day: i + 1,
    dayLabel: `روز ${i + 1}`,
    count
  }))
}

export const mockDashboardMonthlyRewardsTrend: MonthlyRewardsTrendResponse = {
  hasData: false,
  seriesName: 'پاداش ماهانه',
  unit: 'token',
  points: MONTHLY_AMOUNTS.map((amount, i) => ({
    month: i + 1,
    monthLabel: PERSIAN_MONTHS[i],
    amount
  }))
}

export const mockDashboardMonthlyRewardsTrendWithData: MonthlyRewardsTrendResponse = {
  hasData: true,
  seriesName: 'پاداش ماهانه',
  unit: 'token',
  points: MONTHLY_AMOUNTS.map((amount, i) => ({
    month: i + 1,
    monthLabel: PERSIAN_MONTHS[i],
    amount
  }))
}
