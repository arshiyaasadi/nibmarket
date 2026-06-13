import type {
  ReportsCapitalDepositResponse,
  ReportsIncomeResponse,
  ReportsSubsetsResponse,
  ReportsWalletResponse
} from 'src/types/api/reports'

export const mockReportsIncome: ReportsIncomeResponse = {
  rows: [
    { id: '1', date: '۱۴۰۴/۱۲/۰۶', type: 'فعالیت در سامانه', description: 'درآمد ۱۰ توکن بابت فعالیت در سامانه' },
    { id: '2', date: '۱۴۰۴/۱۲/۰۵', type: 'توسعه شبکه', description: 'درآمد ۵ توکن بابت توسعه شبکه' },
    { id: '3', date: '۱۴۰۴/۱۲/۰۴', type: 'پورسانت', description: 'درآمد ۲۰ توکن بابت پورسانت' },
    { id: '4', date: '۱۴۰۴/۱۲/۰۳', type: 'فعالیت در سامانه', description: 'درآمد ۱۵ توکن بابت فعالیت در سامانه' },
    { id: '5', date: '۱۴۰۴/۱۲/۰۲', type: 'توسعه شبکه', description: 'درآمد ۸ توکن بابت توسعه شبکه' }
  ]
}

export const mockReportsWallet: ReportsWalletResponse = {
  rows: [
    {
      id: '1',
      date: '۱۴۰۴/۱۲/۰۶',
      type: 'واریز',
      missionId: 4,
      missionCode: 'daily_login',
      missionTitle: 'لاگین روزانه',
      description: 'پاداش لاگین روزانه — ۱۰ توکن'
    },
    {
      id: '2',
      date: '۱۴۰۴/۱۲/۰۵',
      type: 'واریز',
      missionId: 3,
      missionCode: 'new_referral',
      missionTitle: 'معرفی فرد جدید',
      description: 'پاداش معرفی فرد جدید — ۵ توکن'
    },
    {
      id: '3',
      date: '۱۴۰۴/۱۲/۰۴',
      type: 'واریز',
      missionId: 2,
      missionCode: 'identity_verification',
      missionTitle: 'احراز هویت',
      description: 'پاداش احراز هویت — ۱۰ توکن'
    },
    {
      id: '4',
      date: '۱۴۰۴/۱۲/۰۳',
      type: 'واریز',
      missionId: 1,
      missionCode: 'registration',
      missionTitle: 'ثبت‌نام در سامانه',
      description: 'پاداش ثبت‌نام — ۱۰ توکن'
    },
    {
      id: '5',
      date: '۱۴۰۴/۱۲/۰۲',
      type: 'واریز',
      missionId: 9,
      missionCode: 'retention_share_layer1',
      missionTitle: 'سهم رسوب — معرف مستقیم',
      description: 'سهم رسوب لایه ۱ — ۱۵ توکن'
    },
    {
      id: '6',
      date: '۱۴۰۴/۱۲/۰۱',
      type: 'واریز',
      missionId: 10,
      missionCode: 'retention_share_layer2',
      missionTitle: 'سهم رسوب — معرف لایه ۲',
      description: 'سهم رسوب لایه ۲ — ۸ توکن'
    },
    {
      id: '7',
      date: '۱۴۰۳/۱۱/۳۰',
      type: 'واریز',
      missionId: 11,
      missionCode: 'retention_share_layer3',
      missionTitle: 'سهم رسوب — معرف لایه ۳',
      description: 'سهم رسوب لایه ۳ — ۶ توکن'
    }
  ]
}

export const mockReportsSubsets: ReportsSubsetsResponse = {
  rows: mockReportsWallet.rows.filter(row => row.missionId != null && row.missionId >= 9)
}

const capitalFunds = [
  { id: '1', name: 'نهال سرمایه ایرانیان', symbol: 'صنهال', category: 'درآمد ثابت | ETF', investors: 180, capital: 8500000000, percentage: 14.4 },
  { id: '2', name: 'فراز اندیش نوین', symbol: '', category: 'درآمد ثابت', investors: 145, capital: 5200000000, percentage: 11.6 },
  { id: '3', name: 'ثابت یکم ایرانیان', symbol: '', category: 'درآمد ثابت', investors: 132, capital: 4800000000, percentage: 10.56 },
  { id: '4', name: 'طلای گلدیس', symbol: '', category: 'طلا | ETF', investors: 98, capital: 4100000000, percentage: 7.84 },
  { id: '5', name: 'میعاد ایرانیان', symbol: '', category: 'سهامی', investors: 156, capital: 6200000000, percentage: 12.48 },
  { id: '6', name: 'سپهر اندیشه نوین', symbol: 'صنوین', category: 'مختلط | ETF', investors: 167, capital: 7100000000, percentage: 13.36 },
  { id: '7', name: 'ارمغان ایرانیان', symbol: 'ارمغان', category: 'درآمد ثابت | ETF', investors: 142, capital: 5400000000, percentage: 11.36 },
  { id: '8', name: 'نوین پیشرو', symbol: '', category: 'بازار گردانی اختصاصی', investors: 88, capital: 3200000000, percentage: 7.04 },
  { id: '9', name: 'پالایشی یکم', symbol: 'پالایش', category: 'سهامی | ETF', investors: 142, capital: 5500000000, percentage: 11.36 }
]

const totalInvestors = capitalFunds.reduce((s, f) => s + f.investors, 0)
const totalCapital = capitalFunds.reduce((s, f) => s + f.capital, 0)

export const mockReportsCapitalDeposit: ReportsCapitalDepositResponse = {
  funds: capitalFunds,
  statistics: {
    totalInvestors,
    totalCapital,
    firstInvestorsCapital: Math.floor(totalCapital * 0.3),
    networkCapital: totalCapital - Math.floor(totalCapital * 0.3)
  }
}
