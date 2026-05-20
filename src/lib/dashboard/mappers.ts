import {
  mockDashboardDailyGrowth,
  mockDashboardInvites,
  mockDashboardLeaderboard,
  mockDashboardMonthlyRewards,
  mockDashboardMonthlyRewardsTrend,
  mockDashboardRewards,
  mockDashboardWallet
} from 'src/mocks/dashboard'
import { isInvalidMuiColorValue } from 'src/@core/utils/sanitize-sx'
import {
  ensureArray,
  normalizeThemeColor,
  normalizeTrend,
  toNumber,
  toString
} from 'src/lib/dashboard/normalize'
import type {
  DailySubordinateGrowthResponse,
  DashboardInvitesResponse,
  DashboardLeaderboardResponse,
  DashboardRewardsResponse,
  LeaderboardPeriod,
  MonthlyRewardsChartResponse,
  MonthlyRewardsTrendResponse,
  TwinWalletBalance
} from 'src/types/api/dashboard'

/** Some backends wrap payload in `{ data: ... }` */
function unwrapPayload(raw: unknown): unknown {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const inner = (raw as { data?: unknown }).data
    if (inner != null) return inner
  }

  return raw
}

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
]

const REWARD_ICONS = ['mdi:trophy', 'mdi:calendar-month', 'mdi:water']

function logInvalidColorIfDev(field: string, raw: unknown, mapped: string) {
  if (process.env.NODE_ENV === 'development' && isInvalidMuiColorValue(raw)) {
    console.warn(`[dashboard-mapper] ${field}: invalid color "${String(raw)}" → "${mapped}"`)
  }
}

export function mapDashboardRewards(raw: unknown): DashboardRewardsResponse {
  const fallback = mockDashboardRewards
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return fallback

  const o = payload as Record<string, unknown>
  const rawSummaries = ensureArray<Record<string, unknown>>(o.summaries)
  const rawMissions = ensureArray<Record<string, unknown>>(o.missions)

  const summaries =
    rawSummaries.length > 0
      ? rawSummaries.map((item, index) => {
          const mappedColor = normalizeThemeColor(item.color, index)
          logInvalidColorIfDev('rewards.summaries.color', item.color, mappedColor)

          return {
            title: toString(item.title, fallback.summaries[index]?.title ?? '—'),
            stats: toString(item.stats ?? item.value ?? item.amount, '0'),
            trendNumber: toString(item.trendNumber ?? item.trend, '+0%'),
            trend: normalizeTrend(item.trend),
            color: mappedColor,
            icon: toString(item.icon, REWARD_ICONS[index % REWARD_ICONS.length])
          }
        })
      : fallback.summaries.map((item, index) => ({
          ...item,
          color: normalizeThemeColor(item.color, index)
        }))

  const missions =
    rawMissions.length > 0
      ? rawMissions.map((item, index) => ({
          id: toNumber(item.id, index + 1),
          title: toString(item.title, `ماموریت ${index + 1}`),
          completed: Boolean(item.completed ?? item.isCompleted),
          reward: toString(item.reward, '—')
        }))
      : fallback.missions

  return { summaries, missions }
}

export function mapDashboardWallet(raw: unknown): TwinWalletBalance {
  const fallback = mockDashboardWallet
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return fallback

  const o = payload as Record<string, unknown>

  return {
    totalBalance: toNumber(o.totalBalance ?? o.total, fallback.totalBalance),
    withdrawableBalance: toNumber(o.withdrawableBalance ?? o.withdrawable, fallback.withdrawableBalance),
    frozenBalance: toNumber(o.frozenBalance ?? o.frozen, fallback.frozenBalance),
    currency: 'TWIN'
  }
}

export function mapDashboardInvites(raw: unknown): DashboardInvitesResponse {
  const fallback = mockDashboardInvites
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return fallback

  const o = payload as Record<string, unknown>
  const rawRecent = ensureArray<Record<string, unknown>>(o.recentInvites ?? o.recent)

  const recentInvites =
    rawRecent.length > 0
      ? rawRecent.map((item, index) => ({
          id: toNumber(item.id, index + 1),
          name: toString(item.name, '—'),
          invitedAtLabel: toString(item.invitedAtLabel ?? item.date ?? item.invitedAt, '—')
        }))
      : fallback.recentInvites

  return {
    totalInvited: toNumber(o.totalInvited ?? o.total, fallback.totalInvited),
    referralCode: toString(o.referralCode ?? o.code, fallback.referralCode),
    recentInvites
  }
}

export function mapDashboardLeaderboard(raw: unknown, period: LeaderboardPeriod): DashboardLeaderboardResponse {
  const fallback = mockDashboardLeaderboard(period)
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return { ...fallback, period }

  const o = payload as Record<string, unknown>
  const rawEntries = ensureArray<Record<string, unknown>>(o.entries ?? o.items)

  const entries =
    rawEntries.length > 0
      ? rawEntries.map((item, index) => {
          const growth = ensureArray<number>(item.growthData)
          const growthData =
            growth.length > 0
              ? growth.map(v => toNumber(v, 0))
              : fallback.entries[index]?.growthData ?? [0, 0, 0, 0, 0, 0, 0]

          return {
            rank: toNumber(item.rank, index + 1),
            name: toString(item.name, '—'),
            subordinates: toNumber(item.subordinates, 0),
            totalPoints: toNumber(item.totalPoints ?? item.points, 0),
            growthData
          }
        })
      : fallback.entries

  return {
    period: (o.period === 'previous' ? 'previous' : period) as LeaderboardPeriod,
    entries
  }
}

export function mapDashboardMonthlyRewards(raw: unknown): MonthlyRewardsChartResponse {
  const fallback = mockDashboardMonthlyRewards
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return fallback

  const o = payload as Record<string, unknown>
  const rawPoints = ensureArray<Record<string, unknown>>(o.points ?? o.data)

  if (rawPoints.length === 0) return fallback

  const points = rawPoints.map((item, index) => {
    const month = toNumber(item.month, index + 1)
    const idx = Math.min(Math.max(month, 1), 12) - 1

    return {
      month: month as MonthlyRewardsChartResponse['points'][0]['month'],
      monthLabel: toString(item.monthLabel, PERSIAN_MONTHS[idx]),
      amount: toNumber(item.amount ?? item.value, 0)
    }
  })

  return {
    seriesName: toString(o.seriesName, fallback.seriesName),
    unit: 'token',
    points
  }
}

export function mapDashboardDailyGrowth(raw: unknown): DailySubordinateGrowthResponse {
  const fallback = mockDashboardDailyGrowth
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return fallback

  const o = payload as Record<string, unknown>
  const rawPoints = ensureArray<Record<string, unknown>>(o.points ?? o.data)
  const hasData = Boolean(o.hasData ?? rawPoints.length > 0)

  if (!hasData || rawPoints.length === 0) {
    return { ...fallback, hasData: false }
  }

  const points = rawPoints.map((item, index) => ({
    day: toNumber(item.day, index + 1),
    dayLabel: toString(item.dayLabel, `روز ${index + 1}`),
    count: toNumber(item.count ?? item.value, 0)
  }))

  return {
    hasData: true,
    seriesName: toString(o.seriesName, fallback.seriesName),
    points
  }
}

export function mapDashboardMonthlyRewardsTrend(raw: unknown): MonthlyRewardsTrendResponse {
  const fallback = mockDashboardMonthlyRewardsTrend
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return fallback

  const o = payload as Record<string, unknown>
  const rawPoints = ensureArray<Record<string, unknown>>(o.points ?? o.data)
  const hasData = Boolean(o.hasData ?? rawPoints.length > 0)

  if (!hasData || rawPoints.length === 0) {
    return { ...fallback, hasData: false }
  }

  const points = rawPoints.map((item, index) => {
    const month = toNumber(item.month, index + 1)
    const idx = Math.min(Math.max(month, 1), 12) - 1

    return {
      month,
      monthLabel: toString(item.monthLabel, PERSIAN_MONTHS[idx]),
      amount: toNumber(item.amount ?? item.value, 0)
    }
  })

  return {
    hasData: true,
    seriesName: toString(o.seriesName, fallback.seriesName),
    unit: 'token',
    points
  }
}
