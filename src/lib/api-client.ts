import axios from 'axios'

import { API_BACKEND_URL, API_VERSION_PREFIX, buildApiUrl, resolveApiBaseUrl } from 'src/configs/api'
import { redirectToPanelLogin } from 'src/configs/auth-redirect'
import { getAccessToken } from 'src/lib/auth-token'

let handlingUnauthorized = false

const DEBUG_API =
  process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG_API === 'true'

/** Map /api/dashboard/... → /api/v1/dashboard/... */
export function normalizeApiRequestUrl(url: string | undefined): string | undefined {
  if (!url || !url.startsWith('/api/')) return url
  if (url.startsWith(`${API_VERSION_PREFIX}/`)) return url

  return url.replace(/^\/api\//, `${API_VERSION_PREFIX}/`)
}

/** Client calls NEXT_PUBLIC_API_BASE_URL directly (see docs/CORS.md for API server headers). */
export const apiClient = axios.create({
  baseURL: API_BACKEND_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    config.baseURL = resolveApiBaseUrl()
  }

  const hasAuthHeader =
    typeof config.headers?.get === 'function'
      ? config.headers.get('Authorization')
      : config.headers?.Authorization

  if (!hasAuthHeader) {
    const token = getAccessToken()
    if (token) {
      if (typeof config.headers.set === 'function') {
        config.headers.set('Authorization', token)
      } else {
        config.headers.Authorization = token
      }
    }
  }

  config.url = normalizeApiRequestUrl(config.url)

  if (DEBUG_API && typeof window !== 'undefined' && config.url) {
    const method = (config.method || 'get').toUpperCase()
    console.info('[api-client]', method, buildApiUrl(config.url))
  }

  return config
})

apiClient.interceptors.response.use(
  response => response,
  error => {
    if (
      DEBUG_API &&
      axios.isAxiosError(error) &&
      error.config?.url &&
      error.response?.status !== 404
    ) {
      console.error('[api-client] failed', buildApiUrl(error.config.url), error.code, error.message)
    }

    if (
      axios.isAxiosError(error) &&
      error.response?.status === 401 &&
      typeof window !== 'undefined' &&
      !handlingUnauthorized
    ) {
      handlingUnauthorized = true
      redirectToPanelLogin()
    }

    return Promise.reject(error)
  }
)
