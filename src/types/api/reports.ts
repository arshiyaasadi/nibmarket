/** Swagger: IncomeTransactionDto */
export type IncomeTransactionType = 'فعالیت در سامانه' | 'توسعه شبکه' | 'پورسانت'

export type IncomeTransaction = {
  id: string
  date: string
  type: IncomeTransactionType
  description: string
}

/** Swagger: ReportsIncomeResponse */
export type ReportsIncomeResponse = {
  rows: IncomeTransaction[]
}

/** Swagger: WalletTransactionDto */
export type WalletTransactionType = 'واریز' | 'برداشت'

export type WalletTransaction = {
  id: string
  date: string
  type: WalletTransactionType
  missionId?: number
  missionCode?: string
  missionTitle?: string
  description: string
}

/** Swagger: ReportsWalletResponse */
export type ReportsWalletResponse = {
  rows: WalletTransaction[]
}

/** Swagger: ReportsSubsetsResponse — same transaction rows as wallet report */
export type ReportsSubsetsResponse = {
  rows: WalletTransaction[]
}

/** Swagger: CapitalDepositFundDto */
export type CapitalDepositFund = {
  id: string
  name: string
  symbol: string
  category: string
  investors: number
  capital: number
  percentage: number
}

/** Swagger: CapitalDepositStatisticsDto */
export type ReportsCapitalDepositStatistics = {
  totalInvestors: number
  totalCapital: number
  firstInvestorsCapital: number
  networkCapital: number
}

/** Swagger: ReportsCapitalDepositResponse */
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
  /** Mission code, e.g. `registration` */
  type?: string
  /** Comma-separated mission ids, e.g. `9,10,11` */
  missionId?: string
}

export type ReportsSubsetsQuery = ReportsWalletQuery
