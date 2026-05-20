import axios from 'axios'

import { API_BASE_URL, API_VERSION_PREFIX } from 'src/configs/api'
import { getAccessToken } from 'src/lib/auth-token'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
})

apiClient.interceptors.request.use(config => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = token
  }

  const url = config.url
  if (url && url.startsWith('/api/') && !url.startsWith(`${API_VERSION_PREFIX}/`)) {
    config.url = `${API_VERSION_PREFIX}${url}`
  }

  return config
})
