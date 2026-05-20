export type IncomeTransactionType = 'فعالیت در سامانه' | 'توسعه شبکه' | 'پورسانت'

export type IncomeTransaction = {
  id: string
  date: string
  type: IncomeTransactionType
  description: string
}

export type ReportsIncomeResponse = {
  rows: IncomeTransaction[]
}

export type SubsetReportRow = {
  id: string
  rowNumber: number
  fullName: string
  joinDate: string
  level: number
  lastMonthAvgInvestment: number
  lastMonthReward: number
  currentMonthAvgInvestment: number
  totalReward: number
}

export type ReportsSubsetsResponse = {
  rows: SubsetReportRow[]
}

export type WalletTransactionType = 'واریز' | 'برداشت'

export type WalletTransaction = {
  id: string
  date: string
  type: WalletTransactionType
  description: string
}

export type ReportsWalletResponse = {
  rows: WalletTransaction[]
}

export type CapitalDepositFund = {
  id: string
  name: string
  symbol: string
  category: string
  investors: number
  capital: number
  percentage: number
}

export type ReportsCapitalDepositStatistics = {
  totalInvestors: number
  totalCapital: number
  firstInvestorsCapital: number
  networkCapital: number
}

export type ReportsCapitalDepositResponse = {
  funds: CapitalDepositFund[]
  statistics: ReportsCapitalDepositStatistics
}

export type ReportsIncomeQuery = {
  year?: string
  month?: string
}

export type ReportsWalletQuery = {
  startDate?: string
  endDate?: string
  type?: string
}
