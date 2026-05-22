import { apiClient } from 'src/lib/api-client'
import { toAuthorizationHeader } from 'src/lib/auth-token'
import type { CheckTokenResponse } from 'src/types/api/auth'

/**
 * Exchange external (SSO) token for app session accessToken.
 * Sends the entry token only on this request — not the stored session token.
 */
export async function fetchCheckToken(entryToken: string): Promise<CheckTokenResponse> {
  const { data } = await apiClient.post<CheckTokenResponse>(
    '/api/auth/check_token',
    {},
    {
      headers: {
        Authorization: toAuthorizationHeader(entryToken)
      }
    }
  )

  return data
}
