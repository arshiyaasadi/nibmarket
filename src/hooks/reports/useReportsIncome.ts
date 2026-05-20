'use client'

import { fetchReportsIncomeRaw } from 'src/api/reports/income'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapReportsIncome } from 'src/lib/reports/mappers'
import { mockReportsIncome } from 'src/mocks/reports'

export function useReportsIncome(year: string, month: string) {
  return useApiResource({
    slug: 'reports-income',
    mockData: mockReportsIncome,
    fetcher: () => fetchReportsIncomeRaw({ year: year || undefined, month: month || undefined }),
    mapResponse: mapReportsIncome,
    deps: [year, month]
  })
}
