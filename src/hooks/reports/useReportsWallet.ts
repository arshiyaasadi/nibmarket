'use client'

import { fetchReportsWalletRaw } from 'src/api/reports/wallet'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapReportsWallet } from 'src/lib/reports/mappers'
import { mockReportsWallet } from 'src/mocks/reports'

export function useReportsWallet(startDate: string, endDate: string, transactionType: string) {
  const typeParam =
    transactionType === 'واریز' ? 'deposit' : transactionType === 'برداشت' ? 'withdraw' : 'all'

  return useApiResource({
    slug: 'reports-wallet',
    mockData: mockReportsWallet,
    fetcher: () =>
      fetchReportsWalletRaw({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        type: typeParam
      }),
    mapResponse: mapReportsWallet,
    deps: [startDate, endDate, transactionType]
  })
}
