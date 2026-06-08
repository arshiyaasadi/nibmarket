'use client'

import { useMemo } from 'react'

import { useNetworkSubsets } from 'src/hooks/network/useNetworkSubsets'
import { buildSubsetTreeFromRows } from 'src/lib/network/subset-tree-builder'

/** Subset tree uses the same API + slug as `/network/my-subsets`. */
export function useNetworkSubsetTree() {
  const result = useNetworkSubsets()

  const data = useMemo(() => buildSubsetTreeFromRows(result.data.rows), [result.data.rows])

  return { ...result, data }
}
