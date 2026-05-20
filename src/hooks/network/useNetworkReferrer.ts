'use client'

import { fetchNetworkReferrerRaw } from 'src/api/network/referrer'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapNetworkReferrer } from 'src/lib/network/mappers'
import { mockNetworkReferrer } from 'src/mocks/network'

export function useNetworkReferrer() {
  return useApiResource({
    slug: 'network-referrer',
    mockData: mockNetworkReferrer,
    fetcher: fetchNetworkReferrerRaw,
    mapResponse: mapNetworkReferrer
  })
}
