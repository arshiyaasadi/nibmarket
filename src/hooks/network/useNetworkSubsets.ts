'use client'

import { fetchNetworkSubsetsRaw } from 'src/api/network/subsets'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapNetworkSubsets } from 'src/lib/network/mappers'
import { mockNetworkSubsets } from 'src/mocks/network'

export function useNetworkSubsets() {
  return useApiResource({
    slug: 'network-subsets',
    mockData: mockNetworkSubsets,
    fetcher: fetchNetworkSubsetsRaw,
    mapResponse: mapNetworkSubsets
  })
}
