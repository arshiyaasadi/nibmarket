'use client'

import { fetchReportsSubsetsRaw } from 'src/api/reports/subsets'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapReportsSubsets } from 'src/lib/reports/mappers'
import { mockReportsSubsets } from 'src/mocks/reports'

export function useReportsSubsets(year: string, month: string) {
  return useApiResource({
    slug: 'reports-subsets',
    mockData: mockReportsSubsets,
    fetcher: () => fetchReportsSubsetsRaw({ year: year || undefined, month: month || undefined }),
    mapResponse: mapReportsSubsets,
    deps: [year, month]
  })
}
