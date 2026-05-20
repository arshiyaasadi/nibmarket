import type {
  HonorsResponse,
  LeaderboardListResponse,
  MissionsResponse,
  PoolBalanceResponse
} from 'src/types/api/leaderboard'

export const mockLeaderboardPoolBalance: PoolBalanceResponse = {
  poolBalance: 1500000,
  participantsCount: 1234,
  monthlyChangePercent: 12.5
}

export const mockLeaderboardCurrentMonth: LeaderboardListResponse = {
  entries: [
    { id: 1, rank: 1, name: 'علی احمدی', points: 12500, subordinates: 45 },
    { id: 2, rank: 2, name: 'محمد رضایی', points: 11200, subordinates: 38 },
    { id: 3, rank: 3, name: 'فاطمه کریمی', points: 9800, subordinates: 32 },
    { id: 4, rank: 4, name: 'حسن موسوی', points: 8750, subordinates: 28 },
    { id: 5, rank: 5, name: 'زهرا نوری', points: 8200, subordinates: 25 }
  ]
}

export const mockLeaderboardMySubsets: LeaderboardListResponse = {
  entries: [
    { id: 1, rank: 1, name: 'سارا محمدی', points: 8500, subordinates: 25, currentMonthRank: 8 },
    { id: 2, rank: 2, name: 'رضا کریمی', points: 7200, subordinates: 18, currentMonthRank: 12 },
    { id: 3, rank: 3, name: 'زهرا رضایی', points: 6800, subordinates: 15, currentMonthRank: 15 },
    { id: 4, rank: 4, name: 'امیر حسینی', points: 5500, subordinates: 12, currentMonthRank: 22 },
    { id: 5, rank: 5, name: 'مریم احمدی', points: 4800, subordinates: 10, currentMonthRank: 28 }
  ]
}

export const mockLeaderboardLastMonth: LeaderboardListResponse = {
  entries: [
    { id: 1, rank: 1, name: 'حسین احمدی', points: 11800, subordinates: 42 },
    { id: 2, rank: 2, name: 'محمد رضایی', points: 10500, subordinates: 35 },
    { id: 3, rank: 3, name: 'فاطمه کریمی', points: 9200, subordinates: 30 },
    { id: 4, rank: 4, name: 'علی موسوی', points: 8100, subordinates: 26 },
    { id: 5, rank: 5, name: 'زهرا نوری', points: 7500, subordinates: 22 }
  ]
}

export const mockLeaderboardHonors: HonorsResponse = {
  honors: [
    {
      id: 1,
      title: 'قهرمان ماه',
      icon: 'mdi:trophy',
      color: '#FFD700',
      description: 'بهترین عملکرد در ماه جاری',
      count: 3,
      totalPoints: 15000
    },
    {
      id: 2,
      title: 'ستاره طلایی',
      icon: 'mdi:star',
      color: '#FFA500',
      description: 'دستاورد برتر',
      count: 5,
      totalPoints: 25000
    },
    {
      id: 3,
      title: 'مدال نقره',
      icon: 'mdi:medal',
      color: '#C0C0C0',
      description: 'رتبه دوم',
      count: 2,
      totalPoints: 8000
    }
  ]
}

export const mockLeaderboardMissions: MissionsResponse = {
  missions: [
    { id: 1, title: 'ثبت نام در سامانه', completed: false, reward: 'A توکن' },
    { id: 2, title: 'احراز هویت', completed: false, reward: 'B توکن' },
    { id: 3, title: 'معرفی هر فرد جدید', completed: false, reward: 'C توکن' },
    { id: 4, title: 'لاگین روزانه', completed: false, reward: 'D توکن' },
    { id: 5, title: 'رسیدن به ۳ زیر مجموعه مستقیم', completed: false, reward: 'E توکن' },
    { id: 6, title: 'رسیدن به ۷ زیر مجموعه مستقیم', completed: false, reward: 'F توکن' },
    { id: 7, title: 'رسیدن به ۲۰ زیر مجموعه مستقیم و غیر مستقیم', completed: false, reward: 'G توکن' },
    { id: 8, title: 'رسیدن به ۵۰ زیر مجموعه مستقیم و غیر مستقیم', completed: false, reward: 'H توکن' }
  ]
}
