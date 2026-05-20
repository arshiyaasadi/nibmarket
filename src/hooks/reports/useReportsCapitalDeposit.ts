'use client'

import { fetchReportsCapitalDepositRaw } from 'src/api/reports/capital-deposit'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapReportsCapitalDeposit } from 'src/lib/reports/mappers'
import { mockReportsCapitalDeposit } from 'src/mocks/reports'

export function useReportsCapitalDeposit() {
  return useApiResource({
    slug: 'reports-capital-deposit',
    mockData: mockReportsCapitalDeposit,
    fetcher: fetchReportsCapitalDepositRaw,
    mapResponse: mapReportsCapitalDeposit
  })
}
