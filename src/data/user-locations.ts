import type { UserLocation } from 'src/types/location'

/**
 * Major Iranian cities with their approximate coordinates
 */
const iranianCities = [
  { name: 'Tehran', lat: 35.6892, lng: 51.3890, weight: 150 }, // Capital, most users
  { name: 'Mashhad', lat: 36.2605, lng: 59.6168, weight: 80 },
  { name: 'Isfahan', lat: 32.6546, lng: 51.6680, weight: 70 },
  { name: 'Karaj', lat: 35.8327, lng: 50.9345, weight: 60 },
  { name: 'Shiraz', lat: 29.5918, lng: 52.5837, weight: 55 },
  { name: 'Tabriz', lat: 38.0962, lng: 46.2738, weight: 50 },
  { name: 'Qom', lat: 34.6416, lng: 50.8746, weight: 45 },
  { name: 'Ahvaz', lat: 31.3183, lng: 48.6706, weight: 40 },
  { name: 'Kermanshah', lat: 34.3142, lng: 47.0650, weight: 35 },
  { name: 'Urmia', lat: 37.5527, lng: 45.0760, weight: 30 },
  { name: 'Rasht', lat: 37.2808, lng: 49.5832, weight: 28 },
  { name: 'Zahedan', lat: 29.4960, lng: 60.8629, weight: 25 },
  { name: 'Hamadan', lat: 34.7992, lng: 48.5146, weight: 22 },
  { name: 'Kerman', lat: 30.2839, lng: 57.0834, weight: 20 },
  { name: 'Yazd', lat: 31.8974, lng: 54.3569, weight: 18 },
  { name: 'Ardabil', lat: 38.2498, lng: 48.2933, weight: 15 },
  { name: 'Bandar Abbas', lat: 27.1865, lng: 56.2808, weight: 15 },
  { name: 'Arak', lat: 34.0956, lng: 49.7019, weight: 12 },
  { name: 'Eslamshahr', lat: 35.5446, lng: 51.2302, weight: 10 },
  { name: 'Zanjan', lat: 36.6769, lng: 48.4963, weight: 10 }
]

/**
 * Generates a random offset within a city area
 * Creates realistic distribution within ~10km radius
 */
const getRandomOffset = (): { latOffset: number; lngOffset: number } => {
  // Random offset within ~0.1 degrees (~10km)
  const maxOffset = 0.1
  return {
    latOffset: (Math.random() - 0.5) * maxOffset,
    lngOffset: (Math.random() - 0.5) * maxOffset
  }
}

/**
 * Generates mock user locations distributed across Iranian cities
 * 
 * @param totalUsers - Total number of users to generate (default: 1000)
 * @returns Array of user locations
 */
export const generateMockUserLocations = (totalUsers: number = 1000): UserLocation[] => {
  const locations: UserLocation[] = []
  let userId = 1

  // Calculate total weight for distribution
  const totalWeight = iranianCities.reduce((sum, city) => sum + city.weight, 0)

  // Generate users for each city based on weight
  iranianCities.forEach(city => {
    const usersInCity = Math.round((city.weight / totalWeight) * totalUsers)
    
    for (let i = 0; i < usersInCity; i++) {
      const offset = getRandomOffset()
      locations.push({
        id: `user-${userId++}`,
        lat: city.lat + offset.latOffset,
        lng: city.lng + offset.lngOffset
      })
    }
  })

  // Fill remaining users (due to rounding) randomly across cities
  while (locations.length < totalUsers) {
    const randomCity = iranianCities[Math.floor(Math.random() * iranianCities.length)]
    const offset = getRandomOffset()
    locations.push({
      id: `user-${userId++}`,
      lat: randomCity.lat + offset.latOffset,
      lng: randomCity.lng + offset.lngOffset
    })
  }

  return locations.slice(0, totalUsers) // Ensure exact count
}

/**
 * Mock user locations data
 * In production, this would be replaced with an API call
 */
const mockUserLocations = generateMockUserLocations(1000)

/**
 * Fetches user locations
 * Currently returns mock data, but structured to easily replace with API call
 * 
 * @returns Promise resolving to array of user locations
 */
export const getUserLocations = async (): Promise<UserLocation[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100))
  
  return mockUserLocations
  
  // Future API integration:
  // const response = await axios.get('/api/users/locations')
  // return response.data
}

/**
 * Synchronous version for immediate access to mock data
 * Useful for initial render or when async is not needed
 */
export const getMockUserLocations = (): UserLocation[] => {
  return mockUserLocations
}

