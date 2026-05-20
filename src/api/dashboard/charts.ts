import { apiClient } from 'src/lib/api-client'

export async function fetchDashboardMonthlyRewardsRaw(): Promise<unknown> {
  const { data } = await apiClient.get('/api/dashboard/charts/monthly-rewards')

  return data
}

export async function fetchDashboardDailyGrowthRaw(): Promise<unknown> {
  const { data } = await apiClient.get('/api/dashboard/charts/daily-subordinate-growth')

  return data
}

export async function fetchDashboardMonthlyRewardsTrendRaw(): Promise<unknown> {
  const { data } = await apiClient.get('/api/dashboard/charts/monthly-rewards-trend')

  return data
}
