import type { NotificationsType } from 'src/@core/layouts/components/shared-components/NotificationDropdown'
import { mockLayoutAnnouncements, mockLayoutUser } from 'src/mocks/layout'
import type { AuthGetInfoResponse, LayoutAnnouncementsResponse } from 'src/types/api/layout'

function unwrapPayload(raw: unknown): unknown {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    const inner = (raw as { data?: unknown }).data
    if (inner != null) return inner
  }

  return raw
}

function toString(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value.trim()

  return String(value)
}

function toNumber(value: unknown): number {
  const n = Number(value)

  return Number.isFinite(n) ? n : 0
}

function toNullableString(value: unknown): string | null {
  if (value == null) return null
  if (typeof value === 'string') {
    const trimmed = value.trim()

    return trimmed.length ? trimmed : null
  }

  return String(value)
}

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') return value

  return Boolean(value)
}

export function mapCurrentUser(raw: unknown): AuthGetInfoResponse {
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') {
    return { ...mockLayoutUser }
  }

  const o = payload as Record<string, unknown>

  return {
    id: toNumber(o.id),
    lastLogin: toNullableString(o.lastLogin),
    identifier: toNumber(o.identifier),
    email: toNullableString(o.email),
    mobile: toNullableString(o.mobile),
    creationDate: toString(o.creationDate),
    isMobileConfirmed: toBoolean(o.isMobileConfirmed),
    firstName: toNullableString(o.firstName),
    lastName: toNullableString(o.lastName),
    nationalCode: toNullableString(o.nationalCode),
    birthDate: toNullableString(o.birthDate),
    gender: toNullableString(o.gender),
    legalType: toNumber(o.legalType),
    referrer: toNullableString(o.referrer)
  }
}

function mapAnnouncementRow(row: unknown, index: number): LayoutAnnouncementsResponse['items'][0] | null {
  if (!row || typeof row !== 'object') return null

  const o = row as Record<string, unknown>
  const title = toString(o.title ?? o.subject ?? o.name)
  const subtitle = toString(o.subtitle ?? o.body ?? o.description ?? o.message ?? o.content)
  const meta = toString(o.meta ?? o.dateLabel ?? o.publishedAt ?? o.createdAt)
  const id = toString(o.id ?? o.identifier) || String(index)

  if (!title && !subtitle) return null

  return {
    id,
    title: title || 'اطلاعیه',
    subtitle,
    meta,
    publishedAt: toString(o.publishedAt ?? o.creationDate ?? o.createdAt) || undefined
  }
}

export function mapLayoutAnnouncements(raw: unknown): LayoutAnnouncementsResponse {
  const payload = unwrapPayload(raw)
  if (!payload || typeof payload !== 'object') {
    return { items: [] }
  }

  const o = payload as Record<string, unknown>
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(o.items)
      ? o.items
      : Array.isArray(o.announcements)
        ? o.announcements
        : Array.isArray(o.messages)
          ? o.messages
          : Array.isArray(o.data)
            ? o.data
            : []

  const items = list
    .map((row, i) => mapAnnouncementRow(row, i))
    .filter((x): x is LayoutAnnouncementsResponse['items'][0] => x != null)

  return { items }
}

export function toNotificationDropdownItems(
  response: LayoutAnnouncementsResponse
): NotificationsType[] {
  return response.items.map(item => ({
    meta: item.meta,
    title: item.title,
    subtitle: item.subtitle,
    avatarIcon: 'mdi:newspaper-variant-outline',
    avatarColor: 'primary' as const
  }))
}

export function formatUserDisplayName(user: AuthGetInfoResponse): string {
  const parts = [user.firstName, user.lastName].filter(Boolean)

  return parts.join(' ').trim()
}
