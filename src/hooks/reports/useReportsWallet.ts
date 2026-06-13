'use client'

import { fetchReportsWalletRaw } from 'src/api/reports/wallet'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapReportsWallet } from 'src/lib/reports/mappers'
import { mockReportsWallet } from 'src/mocks/reports'

function buildMissionIdParam(missionIds: number[]): string | undefined {
  if (missionIds.length === 0) return undefined

  return missionIds.join(',')
}

export function useReportsWallet(
  startDate: string,
  endDate: string,
  missionType: string,
  missionIds: number[]
) {
  return useApiResource({
    slug: 'reports-wallet',
    mockData: mockReportsWallet,
    fetcher: () =>
      fetchReportsWalletRaw({
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        type: missionType !== 'all' ? missionType : undefined,
        missionId: buildMissionIdParam(missionIds)
      }),
    mapResponse: mapReportsWallet,
    deps: [startDate, endDate, missionType, missionIds.join(',')]
  })
}
