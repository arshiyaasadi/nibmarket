'use client'

import { RETENTION_MISSION_IDS } from 'src/configs/wallet-missions'
import { fetchReportsWalletRaw } from 'src/api/reports/wallet'
import { useApiResource } from 'src/hooks/useApiResource'
import { mapReportsWallet } from 'src/lib/reports/mappers'
import { mockReportsSubsets } from 'src/mocks/reports'

function buildMissionIdParam(missionIds: number[]): string {
  const effective =
    missionIds.length > 0 ? missionIds : [...RETENTION_MISSION_IDS]

  return effective.join(',')
}

export function useReportsSubsets(
  startDate: string,
  endDate: string,
  missionType: string,
  missionIds: number[]
) {
  return useApiResource({
    slug: 'reports-subsets',
    mockData: mockReportsSubsets,
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
