import { ensureArray, toNumber, toString } from 'src/lib/dashboard/normalize'
import { formatRelativeTimeFa } from 'src/lib/network/subset-previews'
import type { NetworkRecentInvite } from 'src/types/api/network'

function buildName(item: Record<string, unknown>): string {
  const direct = toString(item.name, '').trim()
  if (direct) return direct

  const firstName = toString(item.firstName, '').trim()
  const lastName = toString(item.lastName, '').trim()

  return `${firstName} ${lastName}`.trim() || '—'
}

function buildDateLabel(item: Record<string, unknown>): string {
  const label = toString(item.date ?? item.invitedAtLabel, '').trim()
  if (label && (label.includes('پیش') || label.includes('ago') || label === 'امروز' || label === 'دیروز')) {
    return label
  }

  const raw = toString(item.creationDate ?? item.joinedAt ?? item.invitedAt, '')
  if (!raw) return label || '—'

  return formatRelativeTimeFa(raw)
}

/** Map invitee rows from GET /api/network/referrer (and compatible shapes). */
export function mapReferrerInviteesFromPayload(payload: unknown): NetworkRecentInvite[] {
  if (!payload || typeof payload !== 'object') return []

  const o = payload as Record<string, unknown>
  const rawRows = ensureArray<Record<string, unknown>>(
    o.recentInvites ?? o.invitedUsers ?? o.invitees ?? o.rows ?? o.subsets ?? o.invited
  )

  if (rawRows.length === 0) return []

  return rawRows.map((item, index) => ({
    id: toNumber(item.id, index + 1),
    name: buildName(item),
    date: buildDateLabel(item),
    avatar: toString(item.avatar, `/images/avatars/${(index % 8) + 1}.png`)
  }))
}
