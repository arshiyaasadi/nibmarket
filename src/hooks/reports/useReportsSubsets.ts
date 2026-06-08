'use client'

import { fetchReportsSubsetsRaw } from 'src/api/reports/subsets'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapReportsSubsets } from 'src/lib/reports/mappers'
import { mockReportsSubsets } from 'src/mocks/reports'

function toWalletTypeParam(transactionType: string): string | undefined {
  if (transactionType === 'واریز') return 'deposit'
  if (transactionType === 'برداشت') return 'withdraw'
  if (transactionType === 'all') return 'all'

  return undefined
}

export function useReportsSubsets(startDate: string, endDate: string, transactionType: string) {
  return useApiResource({
    slug: 'reports-subsets',
    mockData: mockReportsSubsets,
    fetcher: () =>
      fetchReportsSubsetsRaw({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        type: toWalletTypeParam(transactionType)
      }),
    mapResponse: mapReportsSubsets,
    deps: [startDate, endDate, transactionType]
  })
}
