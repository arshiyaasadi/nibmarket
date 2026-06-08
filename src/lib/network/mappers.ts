import {
  mockNetworkInvite,
  mockNetworkReferrer,
  mockNetworkSubsets
} from 'src/mocks/network'
import { ensureArray, toNumber, toString } from 'src/lib/dashboard/normalize'
import { buildSubsetTreeFromRows } from 'src/lib/network/subset-tree-builder'
import { mapReferrerInviteesFromPayload } from 'src/lib/network/referrer-invitees'
import { INVITE_LIMITS } from 'src/configs/referral-link'
import type {
  NetworkFund,
  NetworkInvitePageResponse,
  NetworkRecentInvite,
  NetworkReferrerInfo,
  NetworkReferrerResponse,
  NetworkSubsetRow,
  NetworkSubsetsResponse,
  NetworkSubsetTreeResponse
} from 'src/types/api/network'

function unwrapPayload(raw: unknown): unknown {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const inner = (raw as { data?: unknown }).data
    if (inner != null) return inner
  }

  return raw
}

function formatJoinDate(value: unknown): string {
  const raw = toString(value, '')
  if (!raw) return '—'

  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toLocaleDateString('fa-IR')
  }

  return raw
}

function buildFullName(firstName: unknown, lastName: unknown, fallback = '—'): string {
  const fullName = `${toString(firstName, '').trim()} ${toString(lastName, '').trim()}`.trim()

  return fullName || fallback
}

function countDirectSubsets(rows: Record<string, unknown>[]): Map<number, number> {
  const counts = new Map<number, number>()

  for (const item of rows) {
    const parentId = toNumber(item.directParentUserId, 0)
    if (!parentId) continue
    counts.set(parentId, (counts.get(parentId) ?? 0) + 1)
  }

  return counts
}

export function mapNetworkSubsets(raw: unknown): NetworkSubsetsResponse {
  const fallback = mockNetworkSubsets
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') return fallback

  const o = payload as Record<string, unknown>
  const rawRows = ensureArray<Record<string, unknown>>(o.rows ?? o.items ?? o.subsets)

  if (rawRows.length === 0) return { rows: [] }

  const childCounts = countDirectSubsets(rawRows)

  const rows: NetworkSubsetRow[] = rawRows.map((item, index) => {
    const id = toNumber(item.id, index + 1)
    const firstName = toString(item.firstName, '')
    const lastName = toString(item.lastName, '')

    const joinedAtRaw = toString(item.creationDate ?? item.joinDate ?? item.membershipDate, '')
    const joinedAtParsed = joinedAtRaw ? new Date(joinedAtRaw) : null
    const joinedAt =
      joinedAtParsed && !Number.isNaN(joinedAtParsed.getTime())
        ? joinedAtParsed.toISOString()
        : fallback.rows[index]?.joinedAt ?? ''

    return {
      id,
      firstName,
      lastName,
      fullName: buildFullName(
        firstName,
        lastName,
        toString(item.fullName ?? item.name, fallback.rows[index]?.fullName ?? '—')
      ),
      level: toNumber(item.upperLevel ?? item.level, 0),
      joinDate: formatJoinDate(item.creationDate ?? item.joinDate ?? item.membershipDate),
      joinedAt,
      subMembersCount: toNumber(item.subMembersCount ?? item.subordinates, childCounts.get(id) ?? 0),
      leaderboardRank: toNumber(item.leaderboardRank ?? item.rank, 0),
      directParentUserId: toNumber(item.directParentUserId, 0)
    }
  })

  return { rows }
}

/** Build org chart from the same GET /api/network/subsets payload. */
export function mapNetworkSubsetTree(raw: unknown): NetworkSubsetTreeResponse {
  const mapped = mapNetworkSubsets(raw)
  const sourceRows = mapped.rows.length > 0 ? mapped.rows : mockNetworkSubsets.rows

  return buildSubsetTreeFromRows(sourceRows)
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
    maxInvitesPerMonth: toNumber(o.maxInvitesPerMonth ?? o.maxInvites, INVITE_LIMITS.perMonth),
    maxInvitesPerYear: toNumber(o.maxInvitesPerYear ?? o.maxInvitesYear, INVITE_LIMITS.perYear),
    remainingInvites: toNumber(o.remainingInvites ?? o.remaining, fallback.remainingInvites),
    remainingInvitesYear: toNumber(o.remainingInvitesYear ?? o.remainingYear, INVITE_LIMITS.perYear),
    funds,
    recentInvites
  }
}

export function mapNetworkReferrer(raw: unknown): NetworkReferrerResponse {
  const fallback = mockNetworkReferrer
  const payload = unwrapPayload(raw)
  const recentInvitees = mapReferrerInviteesFromPayload(payload)

  if (!payload || typeof payload !== 'object') {
    return { ...fallback, recentInvitees: recentInvitees.length > 0 ? recentInvitees : fallback.recentInvitees }
  }

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
    referrer,
    recentInvitees
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
