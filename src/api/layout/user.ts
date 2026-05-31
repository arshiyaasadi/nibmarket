import axios from 'axios'

import { apiClient } from 'src/lib/api-client'
import { mockLayoutUser } from 'src/mocks/layout'

export async function fetchCurrentUserRaw(): Promise<unknown> {
  try {
    const { data } = await apiClient.get('/api/auth/getinfo')

    return data
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return mockLayoutUser
    }

    throw err
  }
}
