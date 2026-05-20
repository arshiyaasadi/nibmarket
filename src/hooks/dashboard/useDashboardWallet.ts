'use client'

import { fetchDashboardWalletRaw } from 'src/api/dashboard/wallet'
import { useApiResource } from 'src/hooks/dashboard/useApiResource'
import { mapDashboardWallet } from 'src/lib/dashboard/mappers'
import { mockDashboardWallet } from 'src/mocks/dashboard'

export function useDashboardWallet() {
  return useApiResource({
    slug: 'dashboard-wallet',
    mockData: mockDashboardWallet,
    fetcher: fetchDashboardWalletRaw,
    mapResponse: mapDashboardWallet
  })
}
