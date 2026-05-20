import { apiClient } from 'src/lib/api-client'

export async function fetchDashboardInvitesRaw(): Promise<unknown> {
  const { data } = await apiClient.get('/api/dashboard/invites')

  return data
}
