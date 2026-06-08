import type {
  NetworkInvitePageResponse,
  NetworkReferrerInfo,
  NetworkReferrerResponse,
  NetworkSubsetsResponse,
  NetworkSubsetTreeResponse
} from 'src/types/api/network'
import { buildNetworkTreeFromSubsetRows, limitNetworkTree } from 'src/lib/network/subset-tree-builder'

export const mockNetworkSubsets: NetworkSubsetsResponse = {
  rows: [
    {
      id: 10051,
      firstName: 'فریده',
      lastName: 'زینالیان',
      fullName: 'فریده زینالیان',
      level: 3,
      joinDate: '۱۴۰۲/۰۱/۲۲',
      joinedAt: '2023-03-13T06:21:44.483295Z',
      subMembersCount: 0,
      leaderboardRank: 0,
      directParentUserId: 10050
    },
    {
      id: 10050,
      firstName: 'بهرام',
      lastName: 'حاجی هاشمی',
      fullName: 'بهرام حاجی هاشمی',
      level: 2,
      joinDate: '۱۴۰۲/۰۱/۲۲',
      joinedAt: '2023-03-13T06:21:32.334092Z',
      subMembersCount: 2,
      leaderboardRank: 0,
      directParentUserId: 11
    },
    {
      id: 11,
      firstName: 'امیر',
      lastName: 'زارع کاریزی',
      fullName: 'امیر زارع کاریزی',
      level: 1,
      joinDate: '۱۴۰۱/۱۱/۰۹',
      joinedAt: '2023-01-29T14:12:03.81867Z',
      subMembersCount: 1,
      leaderboardRank: 0,
      directParentUserId: 123606
    },
    {
      id: 4,
      firstName: 'سعید',
      lastName: 'نیکنام',
      fullName: 'سعید نیکنام',
      level: 3,
      joinDate: '۱۴۰۱/۱۱/۰۵',
      joinedAt: '2023-01-25T07:55:56.189047Z',
      subMembersCount: 0,
      leaderboardRank: 0,
      directParentUserId: 10050
    },
    {
      id: 1,
      firstName: 'محمد',
      lastName: 'نباتی',
      fullName: 'محمد نباتی',
      level: 1,
      joinDate: '۱۴۰۱/۱۱/۰۴',
      joinedAt: '2023-01-24T14:33:08.792183Z',
      subMembersCount: 0,
      leaderboardRank: 0,
      directParentUserId: 123606
    }
  ]
}

export const mockNetworkSubsetTree: NetworkSubsetTreeResponse = (() => {
  const roots = buildNetworkTreeFromSubsetRows(mockNetworkSubsets.rows)
  const { roots: limited, truncated } = limitNetworkTree(roots)

  return { roots: limited, truncated }
})()

export const mockNetworkInvite: NetworkInvitePageResponse = {
  referralCode: 'NIB55077306',
  maxInvitesPerMonth: 20,
  remainingInvites: 18,
  funds: [
    {
      id: '1',
      name: 'نهال سرمایه ایرانیان',
      symbol: 'صنهال',
      category: 'درآمد ثابت | ETF',
      investors: 0,
      capital: 0,
      percentage: 0
    },
    {
      id: '2',
      name: 'فراز اندیش نوین',
      symbol: '',
      category: 'درآمد ثابت',
      investors: 0,
      capital: 0,
      percentage: 0
    },
    {
      id: '3',
      name: 'ثابت یکم ایرانیان',
      symbol: '',
      category: 'درآمد ثابت',
      investors: 0,
      capital: 0,
      percentage: 0
    },
    {
      id: '4',
      name: 'طلای گلدیس',
      symbol: '',
      category: 'طلا | ETF',
      investors: 0,
      capital: 0,
      percentage: 0
    },
    {
      id: '5',
      name: 'میعاد ایرانیان',
      symbol: '',
      category: 'سهامی',
      investors: 0,
      capital: 0,
      percentage: 0
    },
    {
      id: '6',
      name: 'سپهر اندیشه نوین',
      symbol: 'صنوین',
      category: 'مختلط | ETF',
      investors: 0,
      capital: 0,
      percentage: 0
    },
    {
      id: '7',
      name: 'ارمغان ایرانیان',
      symbol: 'ارمغان',
      category: 'درآمد ثابت | ETF',
      investors: 0,
      capital: 0,
      percentage: 0
    },
    {
      id: '8',
      name: 'نوین پیشرو',
      symbol: '',
      category: 'بازار گردانی اختصاصی',
      investors: 0,
      capital: 0,
      percentage: 0
    },
    {
      id: '9',
      name: 'پالایشی یکم',
      symbol: 'پالایش',
      category: 'سهامی | ETF',
      investors: 0,
      capital: 0,
      percentage: 0
    }
  ],
  recentInvites: [
    { id: 1, name: 'فریده زینالیان', date: '2 روز پیش', avatar: '/images/avatars/1.png' },
    { id: 2, name: 'سعید نیکنام', date: '3 روز پیش', avatar: '/images/avatars/2.png' },
    { id: 3, name: 'فریده زینالیان', date: '5 روز پیش', avatar: '/images/avatars/3.png' },
    { id: 4, name: 'سعید نیکنام', date: '1 هفته پیش', avatar: '/images/avatars/4.png' },
    { id: 5, name: 'علی احمدی', date: '2 هفته پیش', avatar: '/images/avatars/5.png' },
    { id: 6, name: 'سارا محمدی', date: '3 هفته پیش', avatar: '/images/avatars/6.png' }
  ]
}

export const mockNetworkReferrer: NetworkReferrerResponse = {
  hasSubsets: false,
  referrer: null
}

export const MOCK_VALID_REFERRER_CODES = ['NIB55077306', 'INVITE2024', 'MR2024'] as const

export const mockSubmitReferrerResult: NetworkReferrerInfo = {
  firstName: 'محمد',
  lastName: 'رضایی',
  usedDate: '۱۴۰۳/۰۹/۱۵'
}
