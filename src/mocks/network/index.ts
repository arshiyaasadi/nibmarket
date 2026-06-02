import type {
  NetworkInvitePageResponse,
  NetworkReferrerInfo,
  NetworkReferrerResponse,
  NetworkSubsetRow,
  NetworkSubsetsResponse,
  NetworkSubsetTreeResponse,
  NetworkTreeNode
} from 'src/types/api/network'

export const mockNetworkSubsets: NetworkSubsetsResponse = {
  rows: [
    {
      id: 1,
      fullName: 'علی احمدی',
      level: 0,
      joinDate: '—',
      subMembersCount: 0,
      leaderboardRank: 0,
      avatar: '/images/avatars/1.png'
    },
    {
      id: 2,
      fullName: 'سارا محمدی',
      level: 0,
      joinDate: '—',
      subMembersCount: 0,
      leaderboardRank: 0,
      avatar: '/images/avatars/2.png'
    },
    {
      id: 3,
      fullName: 'رضا کریمی',
      level: 4,
      joinDate: '1402/09/10',
      subMembersCount: 8,
      leaderboardRank: 15,
      avatar: '/images/avatars/3.png'
    },
    {
      id: 4,
      fullName: 'زهرا رضایی',
      level: 6,
      joinDate: '1402/06/05',
      subMembersCount: 18,
      leaderboardRank: 5,
      avatar: '/images/avatars/4.png'
    },
    {
      id: 5,
      fullName: 'محمد حسینی',
      level: 3,
      joinDate: '1402/09/25',
      subMembersCount: 5,
      leaderboardRank: 28,
      avatar: '/images/avatars/5.png'
    },
    {
      id: 6,
      fullName: 'فاطمه علیزاده',
      level: 8,
      joinDate: '1402/05/12',
      subMembersCount: 32,
      leaderboardRank: 2,
      avatar: '/images/avatars/6.png'
    },
    {
      id: 7,
      fullName: 'حسن رضوی',
      level: 2,
      joinDate: '1402/10/01',
      subMembersCount: 3,
      leaderboardRank: 42,
      avatar: '/images/avatars/7.png'
    },
    {
      id: 8,
      fullName: 'مریم کاظمی',
      level: 5,
      joinDate: '1402/08/18',
      subMembersCount: 14,
      leaderboardRank: 10,
      avatar: '/images/avatars/8.png'
    }
  ]
}

const mockTreeRoot: NetworkTreeNode = {
  id: '1',
  name: 'علی',
  family: 'احمدی',
  balance: 5000000,
  networks: [
    {
      id: '2',
      name: 'محمد',
      family: 'رضایی',
      balance: 3000000,
      networks: [
        {
          id: '4',
          name: 'حسن',
          family: 'کریمی',
          balance: 1500000,
          networks: []
        },
        {
          id: '5',
          name: 'سارا',
          family: 'رضایی',
          balance: 1100000,
          networks: []
        }
      ]
    },
    {
      id: '3',
      name: 'رضا',
      family: 'محمدی',
      balance: 2500000,
      networks: [
        {
          id: '13',
          name: 'الهام',
          family: 'صبوری',
          balance: 1200000,
          networks: [
            {
              id: '14',
              name: 'نگین',
              family: 'صبوری',
              balance: 510000,
              networks: [
                {
                  id: '15',
                  name: 'سارا',
                  family: 'رضایی',
                  balance: 1100000,
                  networks: []
                },
                {
                  id: '16',
                  name: 'سارا',
                  family: 'رضایی',
                  balance: 1100000,
                  networks: []
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

export const mockNetworkSubsetTree: NetworkSubsetTreeResponse = {
  root: mockTreeRoot
}

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
