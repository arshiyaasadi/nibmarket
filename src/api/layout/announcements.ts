import axios from 'axios'

import { apiClient } from 'src/lib/api-client'

export async function fetchLayoutAnnouncementsRaw(): Promise<unknown> {
  try {
    const { data } = await apiClient.get('/api/User/Announcements')

    return data
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return { items: [] }
    }

    throw err
  }
}
