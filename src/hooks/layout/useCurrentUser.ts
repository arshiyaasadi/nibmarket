'use client'

import { fetchCurrentUserRaw } from 'src/api/layout/user'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapCurrentUser } from 'src/lib/layout/mappers'
import { mockLayoutUser } from 'src/mocks/layout'

export function useCurrentUser() {
  return useApiResource({
    slug: 'layout-user',
    mockData: mockLayoutUser,
    fetcher: fetchCurrentUserRaw,
    mapResponse: mapCurrentUser
  })
}
