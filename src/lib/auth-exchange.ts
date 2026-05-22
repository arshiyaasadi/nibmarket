import authConfig from 'src/configs/auth'
import { normalizeUserRole } from 'src/configs/acl'
import { fetchCheckToken } from 'src/api/auth/check-token'
import { clearEntryToken, clearSessionTokens, persistSessionAccessToken } from 'src/lib/auth-token'
import type { UserDataType } from 'src/context/types'
import type { CheckTokenResponse } from 'src/types/api/auth'

export function userDataFromCheckToken(data: CheckTokenResponse): UserDataType {
  const role = normalizeUserRole(data.role)

  return {
    id: data.userId,
    role,
    email: '',
    fullName: '',
    username: String(data.userId),
    password: ''
  }
}

/** Exchange SSO / external token for session accessToken and user profile. */
export async function exchangeEntryToken(entryToken: string): Promise<UserDataType> {
  const response = await fetchCheckToken(entryToken)
  const user = userDataFromCheckToken(response)

  persistSessionAccessToken(response.accessToken)
  window.localStorage.setItem('userData', JSON.stringify(user))
  clearEntryToken()

  return user
}

export function clearAuthSession(): void {
  clearSessionTokens()
  clearEntryToken()
}

export function hasSessionAccessToken(): boolean {
  if (typeof window === 'undefined') return false

  return Boolean(window.localStorage.getItem(authConfig.storageTokenKeyName)?.trim())
}
