import { ensureArray, toNumber, toString } from 'src/lib/dashboard/normalize'
import {
  mockReportsCapitalDeposit,
  mockReportsIncome,
  mockReportsSubsets,
  mockReportsWallet
} from 'src/mocks/reports'
import type {
  CapitalDepositFund,
  IncomeTransaction,
  IncomeTransactionType,
  ReportsCapitalDepositResponse,
  ReportsIncomeResponse,
  ReportsSubsetsResponse,
  ReportsWalletResponse,
  SubsetReportRow,
  WalletTransaction,
  WalletTransactionType
} from 'src/types/api/reports'

function unwrapPayload(raw: unknown): unknown {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const inner = (raw as { data?: unknown }).data
    if (inner != null) return inner
  }

  return raw
}

const INCOME_TYPES: IncomeTransactionType[] = ['فعالیت در سامانه', 'توسعه شبکه', 'پورسانت']
const WALLET_TYPES: WalletTransactionType[] = ['واریز', 'برداشت']

function mapIncomeRow(item: Record<string, unknown>, index: number, fallback: IncomeTransaction): IncomeTransaction {
  const rawType = toString(item.type, fallback.type)
  const type = INCOME_TYPES.includes(rawType as IncomeTransactionType)
    ? (rawType as IncomeTransactionType)
    : fallback.type

  return {
    id: toString(item.id, String(index + 1)),
    date: toString(item.date, fallback.date),
    type,
    description: toString(item.description, fallback.description)
  }
}

export function mapReportsIncome(raw: unknown): ReportsIncomeResponse {
  const fallback = mockReportsIncome
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return fallback

  const o = payload as Record<string, unknown>
  const rawRows = ensureArray<Record<string, unknown>>(o.rows ?? o.items ?? o.transactions)
  if (rawRows.length === 0) return fallback

  return {
    rows: rawRows.map((item, i) => mapIncomeRow(item, i, fallback.rows[i] ?? fallback.rows[0]))
  }
}

export function mapReportsSubsets(raw: unknown): ReportsSubsetsResponse {
  const fallback = mockReportsSubsets
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return fallback

  const o = payload as Record<string, unknown>
  const rawRows = ensureArray<Record<string, unknown>>(o.rows ?? o.items ?? o.reports)
  if (rawRows.length === 0) return fallback

  const rows: SubsetReportRow[] = rawRows.map((item, index) => {
    const fb = fallback.rows[index] ?? fallback.rows[0]

    return {
      id: toString(item.id, fb.id),
      rowNumber: toNumber(item.rowNumber ?? item.row, index + 1),
      fullName: toString(item.fullName ?? item.name, fb.fullName),
      joinDate: toString(item.joinDate, fb.joinDate),
      level: toNumber(item.level, fb.level),
      lastMonthAvgInvestment: toNumber(item.lastMonthAvgInvestment, fb.lastMonthAvgInvestment),
      lastMonthReward: toNumber(item.lastMonthReward, fb.lastMonthReward),
      currentMonthAvgInvestment: toNumber(item.currentMonthAvgInvestment, fb.currentMonthAvgInvestment),
      totalReward: toNumber(item.totalReward, fb.totalReward)
    }
  })

  return { rows }
}

function mapWalletRow(item: Record<string, unknown>, index: number, fallback: WalletTransaction): WalletTransaction {
  const rawType = toString(item.type, fallback.type)
  const type = WALLET_TYPES.includes(rawType as WalletTransactionType)
    ? (rawType as WalletTransactionType)
    : fallback.type

  return {
    id: toString(item.id, String(index + 1)),
    date: toString(item.date, fallback.date),
    type,
    description: toString(item.description, fallback.description)
  }
}

export function mapReportsWallet(raw: unknown): ReportsWalletResponse {
  const fallback = mockReportsWallet
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return fallback

  const o = payload as Record<string, unknown>
  const rawRows = ensureArray<Record<string, unknown>>(o.rows ?? o.items ?? o.transactions)
  if (rawRows.length === 0) return fallback

  return {
    rows: rawRows.map((item, i) => mapWalletRow(item, i, fallback.rows[i] ?? fallback.rows[0]))
  }
}

function mapFund(item: Record<string, unknown>, index: number, fallback: CapitalDepositFund): CapitalDepositFund {
  return {
    id: toString(item.id, fallback.id),
    name: toString(item.name, fallback.name),
    symbol: toString(item.symbol, fallback.symbol),
    category: toString(item.category, fallback.category),
    investors: toNumber(item.investors, fallback.investors),
    capital: toNumber(item.capital, fallback.capital),
    percentage: toNumber(item.percentage, fallback.percentage)
  }
}

export function mapReportsCapitalDeposit(raw: unknown): ReportsCapitalDepositResponse {
  const fallback = mockReportsCapitalDeposit
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return fallback

  const o = payload as Record<string, unknown>
  const rawFunds = ensureArray<Record<string, unknown>>(o.funds ?? o.items)
  const statsRaw = (o.statistics ?? o.stats) as Record<string, unknown> | undefined

  const funds =
    rawFunds.length > 0
      ? rawFunds.map((item, i) => mapFund(item, i, fallback.funds[i] ?? fallback.funds[0]))
      : fallback.funds

  const totalInvestors = toNumber(statsRaw?.totalInvestors, fallback.statistics.totalInvestors)
  const totalCapital = toNumber(statsRaw?.totalCapital, fallback.statistics.totalCapital)
  const firstInvestorsCapital = toNumber(
    statsRaw?.firstInvestorsCapital,
    fallback.statistics.firstInvestorsCapital
  )
  const networkCapital = toNumber(statsRaw?.networkCapital, fallback.statistics.networkCapital)

  return {
    funds,
    statistics: {
      totalInvestors,
      totalCapital,
      firstInvestorsCapital,
      networkCapital: networkCapital || totalCapital - firstInvestorsCapital
    }
  }
}
