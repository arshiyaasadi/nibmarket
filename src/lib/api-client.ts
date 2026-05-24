import axios from 'axios'

import { API_BACKEND_URL, API_VERSION_PREFIX, resolveApiBaseUrl } from 'src/configs/api'
import { getAccessToken } from 'src/lib/auth-token'

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

  const url = config.url
  if (url && url.startsWith('/api/') && !url.startsWith(`${API_VERSION_PREFIX}/`)) {
    config.url = url.replace(/^\/api\//, `${API_VERSION_PREFIX}/`)
  }

  return config
})
