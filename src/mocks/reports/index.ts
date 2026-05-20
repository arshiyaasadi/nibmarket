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

export const mockReportsSubsets: ReportsSubsetsResponse = {
  rows: [
    {
      id: '1',
      rowNumber: 1,
      fullName: 'علی احمدی',
      joinDate: '۱۴۰۳/۰۱/۱۵',
      level: 5,
      lastMonthAvgInvestment: 5000000,
      lastMonthReward: 250000,
      currentMonthAvgInvestment: 6000000,
      totalReward: 1200000
    },
    {
      id: '2',
      rowNumber: 2,
      fullName: 'سارا محمدی',
      joinDate: '۱۴۰۳/۰۲/۱۰',
      level: 7,
      lastMonthAvgInvestment: 8000000,
      lastMonthReward: 400000,
      currentMonthAvgInvestment: 9000000,
      totalReward: 2000000
    },
    {
      id: '3',
      rowNumber: 3,
      fullName: 'رضا کریمی',
      joinDate: '۱۴۰۳/۰۳/۰۵',
      level: 4,
      lastMonthAvgInvestment: 3000000,
      lastMonthReward: 150000,
      currentMonthAvgInvestment: 3500000,
      totalReward: 800000
    },
    {
      id: '4',
      rowNumber: 4,
      fullName: 'زهرا رضایی',
      joinDate: '۱۴۰۳/۰۴/۱۲',
      level: 6,
      lastMonthAvgInvestment: 7000000,
      lastMonthReward: 350000,
      currentMonthAvgInvestment: 7500000,
      totalReward: 1500000
    },
    {
      id: '5',
      rowNumber: 5,
      fullName: 'محمد حسینی',
      joinDate: '۱۴۰۳/۰۵/۲۰',
      level: 3,
      lastMonthAvgInvestment: 2000000,
      lastMonthReward: 100000,
      currentMonthAvgInvestment: 2500000,
      totalReward: 500000
    }
  ]
}

export const mockReportsWallet: ReportsWalletResponse = {
  rows: [
    { id: '1', date: '۱۴۰۴/۱۲/۰۶', type: 'واریز', description: 'واریز ۱۰ توکن بابت ورود به سامانه' },
    { id: '2', date: '۱۴۰۴/۱۲/۰۵', type: 'برداشت', description: 'برداشت ۵ توکن برای خرید پکیج' },
    { id: '3', date: '۱۴۰۴/۱۲/۰۴', type: 'واریز', description: 'واریز ۲۰ توکن بابت دعوت دوستان' },
    { id: '4', date: '۱۴۰۴/۱۲/۰۳', type: 'واریز', description: 'واریز ۱۵ توکن بابت تکمیل ماموریت' },
    { id: '5', date: '۱۴۰۴/۱۲/۰۲', type: 'برداشت', description: 'برداشت ۸ توکن برای ارتقای حساب' }
  ]
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
