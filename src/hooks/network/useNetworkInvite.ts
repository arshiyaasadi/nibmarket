'use client'

import { fetchNetworkInviteRaw } from 'src/api/network/invite'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapNetworkInvite } from 'src/lib/network/mappers'
import { mockNetworkInvite } from 'src/mocks/network'

export function useNetworkInvite() {
  return useApiResource({
    slug: 'network-invite',
    mockData: mockNetworkInvite,
    fetcher: fetchNetworkInviteRaw,
    mapResponse: mapNetworkInvite
  })
}
