import authConfig from 'src/configs/auth'

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') || 'https://api-club.nibdev.com'

/** Prepended to backend paths like /api/dashboard/... → /v1/api/dashboard/... */
export const API_VERSION_PREFIX = '/v1'

/** Cookie name aligned with auth localStorage key */
export const ACCESS_TOKEN_COOKIE = authConfig.storageTokenKeyName

export const ENV_USER_TOKEN = process.env.NEXT_PUBLIC_USER_TOKEN?.trim() || ''
