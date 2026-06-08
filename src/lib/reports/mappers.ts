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

function normalizeWalletType(raw: unknown, fallback: WalletTransactionType = 'واریز'): WalletTransactionType {
  const value = toString(raw, '').trim().toLowerCase()

  if (value === 'deposit' || value === 'واریز' || value === 'credit') return 'واریز'
  if (value === 'withdraw' || value === 'withdrawal' || value === 'برداشت' || value === 'debit') {
    return 'برداشت'
  }
  if (WALLET_TYPES.includes(value as WalletTransactionType)) {
    return value as WalletTransactionType
  }

  return fallback
}

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
  if (rawRows.length === 0) return { rows: [] }

  return {
    rows: rawRows.map((item, i) => mapIncomeRow(item, i, fallback.rows[i] ?? fallback.rows[0]))
  }
}

function mapWalletRow(item: Record<string, unknown>, index: number): WalletTransaction {
  return {
    id: toString(item.id, String(index + 1)),
    date: toString(item.date, '—'),
    type: normalizeWalletType(item.type),
    description: toString(item.description, '—')
  }
}

export function mapWalletTransactionRows(raw: unknown): WalletTransaction[] {
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return []

  const o = payload as Record<string, unknown>
  const rawRows = ensureArray<Record<string, unknown>>(o.rows ?? o.items ?? o.transactions)

  return rawRows.map((item, i) => mapWalletRow(item, i))
}

export function mapReportsWallet(raw: unknown): ReportsWalletResponse {
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return mockReportsWallet

  const rows = mapWalletTransactionRows(payload)

  return { rows }
}

export function mapReportsSubsets(raw: unknown): ReportsSubsetsResponse {
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return mockReportsSubsets

  const rows = mapWalletTransactionRows(payload)

  return { rows }
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
