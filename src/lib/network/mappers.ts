import {
  mockNetworkInvite,
  mockNetworkReferrer,
  mockNetworkSubsets,
  mockNetworkSubsetTree
} from 'src/mocks/network'
import { ensureArray, toNumber, toString } from 'src/lib/dashboard/normalize'
import type {
  NetworkFund,
  NetworkInvitePageResponse,
  NetworkRecentInvite,
  NetworkReferrerInfo,
  NetworkReferrerResponse,
  NetworkSubsetRow,
  NetworkSubsetsResponse,
  NetworkSubsetTreeResponse,
  NetworkTreeNode
} from 'src/types/api/network'

function unwrapPayload(raw: unknown): unknown {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const inner = (raw as { data?: unknown }).data
    if (inner != null) return inner
  }

  return raw
}

function mapTreeNode(item: Record<string, unknown>): NetworkTreeNode {
  const rawChildren = ensureArray<Record<string, unknown>>(item.networks ?? item.children)

  return {
    id: toString(item.id, '0'),
    name: toString(item.name, '—'),
    family: toString(item.family, '—'),
    balance: item.balance != null ? (typeof item.balance === 'number' ? item.balance : toString(item.balance)) : 0,
    networks: rawChildren.map(mapTreeNode)
  }
}

export function mapNetworkSubsets(raw: unknown): NetworkSubsetsResponse {
  const fallback = mockNetworkSubsets
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return fallback

  const o = payload as Record<string, unknown>
  const rawRows = ensureArray<Record<string, unknown>>(o.rows ?? o.items ?? o.subsets)

  if (rawRows.length === 0) return fallback

  const rows: NetworkSubsetRow[] = rawRows.map((item, index) => ({
    id: toNumber(item.id, index + 1),
    fullName: toString(item.fullName ?? item.name, fallback.rows[index]?.fullName ?? '—'),
    level: toNumber(item.level, 0),
    joinDate: toString(item.joinDate ?? item.membershipDate, '—'),
    subMembersCount: toNumber(item.subMembersCount ?? item.subordinates, 0),
    leaderboardRank: toNumber(item.leaderboardRank ?? item.rank, 0),
    avatar: toString(item.avatar, `/images/avatars/${(index % 8) + 1}.png`)
  }))

  return { rows }
}

export function mapNetworkSubsetTree(raw: unknown): NetworkSubsetTreeResponse {
  const fallback = mockNetworkSubsetTree
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return fallback

  const o = payload as Record<string, unknown>
  const rootRaw = (o.root ?? o) as Record<string, unknown>

  if (!rootRaw.id && !rootRaw.name) return fallback

  return { root: mapTreeNode(rootRaw) }
}

export function mapNetworkInvite(raw: unknown): NetworkInvitePageResponse {
  const fallback = mockNetworkInvite
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return fallback

  const o = payload as Record<string, unknown>
  const rawFunds = ensureArray<Record<string, unknown>>(o.funds)
  const rawRecent = ensureArray<Record<string, unknown>>(o.recentInvites ?? o.recent)

  const funds: NetworkFund[] =
    rawFunds.length > 0
      ? rawFunds.map((item, index) => ({
          id: toString(item.id, String(index + 1)),
          name: toString(item.name, '—'),
          symbol: toString(item.symbol, ''),
          category: toString(item.category, ''),
          investors: toNumber(item.investors, 0),
          capital: toNumber(item.capital, 0),
          percentage: toNumber(item.percentage, 0)
        }))
      : fallback.funds

  const recentInvites: NetworkRecentInvite[] =
    rawRecent.length > 0
      ? rawRecent.map((item, index) => ({
          id: toNumber(item.id, index + 1),
          name: toString(item.name, '—'),
          date: toString(item.date ?? item.invitedAtLabel, '—'),
          avatar: toString(item.avatar, `/images/avatars/${(index % 8) + 1}.png`)
        }))
      : fallback.recentInvites

  return {
    referralCode: toString(o.referralCode ?? o.code, fallback.referralCode),
    maxInvitesPerMonth: toNumber(o.maxInvitesPerMonth ?? o.maxInvites, fallback.maxInvitesPerMonth),
    remainingInvites: toNumber(o.remainingInvites ?? o.remaining, fallback.remainingInvites),
    funds,
    recentInvites
  }
}

export function mapNetworkReferrer(raw: unknown): NetworkReferrerResponse {
  const fallback = mockNetworkReferrer
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return fallback

  const o = payload as Record<string, unknown>
  const refRaw = o.referrer ?? o.referrerInfo

  let referrer: NetworkReferrerInfo | null = null
  if (refRaw && typeof refRaw === 'object') {
    const r = refRaw as Record<string, unknown>
    referrer = {
      firstName: toString(r.firstName, ''),
      lastName: toString(r.lastName, ''),
      usedDate: toString(r.usedDate ?? r.date, '')
    }
  }

  return {
    hasSubsets: Boolean(o.hasSubsets ?? o.hasSubordinates),
    referrer
  }
}

export function mapSubmitReferrerResponse(raw: unknown): NetworkReferrerInfo {
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') {
    throw new Error('پاسخ ثبت کد معرف نامعتبر است')
  }

  const o = payload as Record<string, unknown>
  const r = (o.referrer ?? o) as Record<string, unknown>

  return {
    firstName: toString(r.firstName, '—'),
    lastName: toString(r.lastName, '—'),
    usedDate: toString(r.usedDate ?? r.date, '—')
  }
}
