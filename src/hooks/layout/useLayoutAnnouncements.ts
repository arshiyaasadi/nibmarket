'use client'

import { useMemo } from 'react'

import { fetchLayoutAnnouncementsRaw } from 'src/api/layout/announcements'
import type { NotificationsType } from 'src/@core/layouts/components/shared-components/NotificationDropdown'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapLayoutAnnouncements, toNotificationDropdownItems } from 'src/lib/layout/mappers'
import { mockLayoutAnnouncements } from 'src/mocks/layout'

export function useLayoutAnnouncements() {
  const resource = useApiResource({
    slug: 'layout-announcements',
    mockData: mockLayoutAnnouncements,
    fetcher: fetchLayoutAnnouncementsRaw,
    mapResponse: mapLayoutAnnouncements
  })

  const notifications: NotificationsType[] = useMemo(
    () => toNotificationDropdownItems(resource.data),
    [resource.data]
  )

  return {
    ...resource,
    notifications
  }
}
