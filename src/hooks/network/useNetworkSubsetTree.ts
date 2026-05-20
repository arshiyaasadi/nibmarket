'use client'

import { fetchNetworkSubsetTreeRaw } from 'src/api/network/subset-tree'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapNetworkSubsetTree } from 'src/lib/network/mappers'
import { mockNetworkSubsetTree } from 'src/mocks/network'

export function useNetworkSubsetTree() {
  return useApiResource({
    slug: 'network-subset-tree',
    mockData: mockNetworkSubsetTree,
    fetcher: fetchNetworkSubsetTreeRaw,
    mapResponse: mapNetworkSubsetTree
  })
}
