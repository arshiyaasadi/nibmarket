import { ensureArray, toNumber, toString } from 'src/lib/dashboard/normalize'
import {
  mockLeaderboardCurrentMonth,
  mockLeaderboardHonors,
  mockLeaderboardLastMonth,
  mockLeaderboardMissions,
  mockLeaderboardMySubsets,
  mockLeaderboardPoolBalance
} from 'src/mocks/leaderboard'
import type {
  HonorItem,
  HonorsResponse,
  LeaderboardEntry,
  LeaderboardListResponse,
  Mission,
  MissionsResponse,
  PoolBalanceResponse
} from 'src/types/api/leaderboard'

function unwrapPayload(raw: unknown): unknown {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const inner = (raw as { data?: unknown }).data
    if (inner != null) return inner
  }

  return raw
}

function mapEntry(item: Record<string, unknown>, index: number, fallback: LeaderboardEntry): LeaderboardEntry {
  const entry: LeaderboardEntry = {
    id: toNumber(item.id, fallback.id),
    rank: toNumber(item.rank, fallback.rank),
    name: toString(item.name ?? item.fullName, fallback.name),
    points: toNumber(item.points, fallback.points),
    subordinates: toNumber(item.subordinates ?? item.subMembersCount, fallback.subordinates)
  }
  if (item.currentMonthRank != null) {
    entry.currentMonthRank = toNumber(item.currentMonthRank, fallback.currentMonthRank ?? 0)
  }

  return entry
}

function mapLeaderboardList(raw: unknown, fallback: LeaderboardListResponse): LeaderboardListResponse {
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return fallback

  const o = payload as Record<string, unknown>
  const rawEntries = ensureArray<Record<string, unknown>>(o.entries ?? o.rows ?? o.leaderboard ?? o.items)
  if (rawEntries.length === 0) return fallback

  return {
    entries: rawEntries.map((item, i) => mapEntry(item, i, fallback.entries[i] ?? fallback.entries[0]))
  }
}

export function mapLeaderboardPoolBalance(raw: unknown): PoolBalanceResponse {
  const fallback = mockLeaderboardPoolBalance
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return fallback

  const o = payload as Record<string, unknown>

  return {
    poolBalance: toNumber(o.poolBalance ?? o.balance, fallback.poolBalance),
    participantsCount: toNumber(o.participantsCount ?? o.participants, fallback.participantsCount),
    monthlyChangePercent: toNumber(o.monthlyChangePercent ?? o.changePercent, fallback.monthlyChangePercent)
  }
}

export function mapLeaderboardCurrentMonth(raw: unknown): LeaderboardListResponse {
  return mapLeaderboardList(raw, mockLeaderboardCurrentMonth)
}

export function mapLeaderboardMySubsets(raw: unknown): LeaderboardListResponse {
  return mapLeaderboardList(raw, mockLeaderboardMySubsets)
}

export function mapLeaderboardLastMonth(raw: unknown): LeaderboardListResponse {
  return mapLeaderboardList(raw, mockLeaderboardLastMonth)
}

export function mapLeaderboardHonors(raw: unknown): HonorsResponse {
  const fallback = mockLeaderboardHonors
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return fallback

  const o = payload as Record<string, unknown>
  const rawHonors = ensureArray<Record<string, unknown>>(o.honors ?? o.items)
  if (rawHonors.length === 0) return fallback

  const honors: HonorItem[] = rawHonors.map((item, index) => {
    const fb = fallback.honors[index] ?? fallback.honors[0]

    return {
      id: toNumber(item.id, fb.id),
      title: toString(item.title, fb.title),
      icon: toString(item.icon, fb.icon),
      color: toString(item.color, fb.color),
      description: toString(item.description, fb.description),
      count: toNumber(item.count, fb.count),
      totalPoints: toNumber(item.totalPoints ?? item.points, fb.totalPoints)
    }
  })

  return { honors }
}

export function mapLeaderboardMissions(raw: unknown): MissionsResponse {
  const fallback = mockLeaderboardMissions
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return fallback

  const o = payload as Record<string, unknown>
  const rawMissions = ensureArray<Record<string, unknown>>(o.missions ?? o.items)
  if (rawMissions.length === 0) return fallback

  const missions: Mission[] = rawMissions.map((item, index) => {
    const fb = fallback.missions[index] ?? fallback.missions[0]

    return {
      id: toNumber(item.id, fb.id),
      title: toString(item.title, fb.title),
      completed: Boolean(item.completed ?? fb.completed),
      reward: toString(item.reward, fb.reward)
    }
  })

  return { missions }
}
