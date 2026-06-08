import type { InvitedUserPreview } from 'src/types/api/dashboard'
import type { NetworkRecentInvite, NetworkSubsetRow } from 'src/types/api/network'

export function formatRelativeTimeFa(dateString: string | null | undefined): string {
  if (!dateString) return '—'

  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return '—'

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) return 'امروز'
  if (diffDays === 1) return 'دیروز'
  if (diffDays < 7) return `${diffDays} روز پیش`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} هفته پیش`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} ماه پیش`

  return `${Math.floor(diffDays / 365)} سال پیش`
}

function sortByJoinedAtDesc(rows: NetworkSubsetRow[]): NetworkSubsetRow[] {
  return [...rows].sort((a, b) => new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime())
}

export function dedupeByName<T extends { name: string }>(items: T[]): T[] {
  return items.filter((item, index, arr) => arr.findIndex(i => i.name === item.name) === index)
}

export function mapSubsetsToRecentInvites(rows: NetworkSubsetRow[], limit?: number): NetworkRecentInvite[] {
  const sorted = sortByJoinedAtDesc(rows)
  const sliced = limit != null ? sorted.slice(0, limit) : sorted

  return sliced.map((row, index) => ({
    id: row.id,
    name: row.fullName,
    date: formatRelativeTimeFa(row.joinedAt),
    avatar: `/images/avatars/${(index % 8) + 1}.png`
  }))
}

export function mapSubsetsToInvitedPreviews(rows: NetworkSubsetRow[], limit?: number): InvitedUserPreview[] {
  return mapSubsetsToRecentInvites(rows, limit).map(({ id, name, date }) => ({
    id,
    name,
    invitedAtLabel: date
  }))
}
