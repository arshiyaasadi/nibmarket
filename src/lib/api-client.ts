import axios from 'axios'

import {
  API_BACKEND_URL,
  API_VERSION_PREFIX,
  isApiProxyMode,
  resolveApiBaseUrl
} from 'src/configs/api'
import { getAccessToken } from 'src/lib/auth-token'

/** Normalize /api/... paths for v1 + Next trailingSlash when using same-origin proxy. */
export function normalizeApiRequestUrl(url: string | undefined): string | undefined {
  if (!url || !url.startsWith('/api/')) return url

  const [pathPart, query = ''] = url.split('?')
  let path = pathPart

  if (path.startsWith('/api/') && !path.startsWith(`${API_VERSION_PREFIX}/`)) {
    path = path.replace(/^\/api\//, `${API_VERSION_PREFIX}/`)
  }

  if (isApiProxyMode() && !path.endsWith('/')) {
    path = `${path}/`
  }

  return query ? `${path}?${query}` : path
}

/** Browser: direct NEXT_PUBLIC_API_BASE_URL unless NEXT_PUBLIC_API_USE_PROXY=true. */
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

  return config
})
