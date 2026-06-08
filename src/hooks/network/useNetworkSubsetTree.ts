'use client'

import { fetchNetworkSubsetsRaw } from 'src/api/network/subsets'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapNetworkSubsetTree } from 'src/lib/network/mappers'
import { mockNetworkSubsetTree } from 'src/mocks/network'

export function useNetworkSubsetTree() {
  return useApiResource({
    slug: 'network-subset-tree',
    mockData: mockNetworkSubsetTree,
    fetcher: fetchNetworkSubsetsRaw,
    mapResponse: mapNetworkSubsetTree
  })
}
