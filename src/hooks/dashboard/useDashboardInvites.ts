'use client'

import { fetchDashboardInvitesRaw } from 'src/api/dashboard/invites'
import { useApiResource } from 'src/hooks/dashboard/useApiResource'
import { mapDashboardInvites } from 'src/lib/dashboard/mappers'
import { mockDashboardInvites } from 'src/mocks/dashboard'

export function useDashboardInvites() {
  return useApiResource({
    slug: 'dashboard-invites',
    mockData: mockDashboardInvites,
    fetcher: fetchDashboardInvitesRaw,
    mapResponse: mapDashboardInvites
  })
}
