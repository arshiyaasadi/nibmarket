import { apiClient } from 'src/lib/api-client'
import type { SendNetworkInviteRequest, SendNetworkInviteResponse } from 'src/types/api/network'

export async function fetchNetworkInviteRaw(): Promise<unknown> {
  const { data } = await apiClient.get('/api/network/invite')

  return data
}

export async function postNetworkInviteRaw(body: SendNetworkInviteRequest): Promise<unknown> {
  const { data } = await apiClient.post('/api/network/invite', body)

  return data
}

export function mapSendInviteResponse(raw: unknown): SendNetworkInviteResponse {
  if (raw && typeof raw === 'object' && 'data' in raw) {
    return mapSendInviteResponse((raw as { data: unknown }).data)
  }

  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>

  return {
    success: o.success !== false,
    remainingInvites: typeof o.remainingInvites === 'number' ? o.remainingInvites : 0,
    remainingInvitesYear:
      typeof o.remainingInvitesYear === 'number' ? o.remainingInvitesYear : undefined,
    referralLink: typeof o.referralLink === 'string' ? o.referralLink : undefined
  }
}
