import authConfig from 'src/configs/auth'
import { normalizeUserRole } from 'src/configs/acl'
import { fetchCheckToken } from 'src/api/auth/check-token'
import {
  clearEntryToken,
  clearSessionTokens,
  persistSessionAccessToken,
  stripBearerPrefix
} from 'src/lib/auth-token'
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

/** Drop session only — keeps SSO entry token for check_token exchange. */
export function clearStaleSession(): void {
  clearSessionTokens()
}

export function clearAuthSession(): void {
  clearSessionTokens()
  clearEntryToken()
}

export function hasSessionAccessToken(): boolean {
  if (typeof window === 'undefined') return false

  return Boolean(window.localStorage.getItem(authConfig.storageTokenKeyName)?.trim())
}

/** Restore user profile from session JWT when userData is missing (api mode). */
export function userFromSessionTokenJwt(): UserDataType | null {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(authConfig.storageTokenKeyName)?.trim()
  if (!raw) return null

  try {
    const payload = JSON.parse(atob(stripBearerPrefix(raw).split('.')[1])) as Record<string, unknown>
    const userId = payload.user_id ?? payload.userId ?? payload.sub
    const role = payload.role
    if (userId == null || role == null) return null

    return userDataFromCheckToken({
      accessToken: stripBearerPrefix(raw),
      userId: Number(userId),
      role: Number(role)
    })
  } catch {
    return null
  }
}
