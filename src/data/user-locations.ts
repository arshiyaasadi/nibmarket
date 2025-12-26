import type { UserLocation } from 'src/types/location'

/**
 * Persian names for data generation
 */
const persianFirstNames = [
  'علی', 'محمد', 'حسین', 'رضا', 'احمد', 'مهدی', 'حسن', 'امیر', 'سعید', 'مجید',
  'فاطمه', 'زهرا', 'مریم', 'سارا', 'نرگس', 'لیلا', 'شیما', 'پریسا', 'مینا', 'نسیم'
]

const persianLastNames = [
  'احمدی', 'محمدی', 'رضایی', 'کریمی', 'موسوی', 'نوری', 'کاظمی', 'صادقی', 'حسینی', 'ملکی',
  'رحیمی', 'عباسی', 'جعفری', 'علوی', 'باقری', 'نوروزی', 'محمودی', 'اکبری', 'خوانساری', 'تقوی'
]

/**
 * Major Iranian cities with their approximate coordinates
 */
const iranianCities = [
  { name: 'Tehran', persianName: 'تهران', lat: 35.6892, lng: 51.3890, weight: 150 }, // Capital, most users
  { name: 'Mashhad', persianName: 'مشهد', lat: 36.2605, lng: 59.6168, weight: 80 },
  { name: 'Isfahan', persianName: 'اصفهان', lat: 32.6546, lng: 51.6680, weight: 70 },
  { name: 'Karaj', persianName: 'کرج', lat: 35.8327, lng: 50.9345, weight: 60 },
  { name: 'Shiraz', persianName: 'شیراز', lat: 29.5918, lng: 52.5837, weight: 55 },
  { name: 'Tabriz', persianName: 'تبریز', lat: 38.0962, lng: 46.2738, weight: 50 },
  { name: 'Qom', persianName: 'قم', lat: 34.6416, lng: 50.8746, weight: 45 },
  { name: 'Ahvaz', persianName: 'اهواز', lat: 31.3183, lng: 48.6706, weight: 40 },
  { name: 'Kermanshah', persianName: 'کرمانشاه', lat: 34.3142, lng: 47.0650, weight: 35 },
  { name: 'Urmia', persianName: 'ارومیه', lat: 37.5527, lng: 45.0760, weight: 30 },
  { name: 'Rasht', persianName: 'رشت', lat: 37.2808, lng: 49.5832, weight: 28 },
  { name: 'Zahedan', persianName: 'زاهدان', lat: 29.4960, lng: 60.8629, weight: 25 },
  { name: 'Hamadan', persianName: 'همدان', lat: 34.7992, lng: 48.5146, weight: 22 },
  { name: 'Kerman', persianName: 'کرمان', lat: 30.2839, lng: 57.0834, weight: 20 },
  { name: 'Yazd', persianName: 'یزد', lat: 31.8974, lng: 54.3569, weight: 18 },
  { name: 'Ardabil', persianName: 'اردبیل', lat: 38.2498, lng: 48.2933, weight: 15 },
  { name: 'Bandar Abbas', persianName: 'بندرعباس', lat: 27.1865, lng: 56.2808, weight: 15 },
  { name: 'Arak', persianName: 'اراک', lat: 34.0956, lng: 49.7019, weight: 12 },
  { name: 'Eslamshahr', persianName: 'اسلامشهر', lat: 35.5446, lng: 51.2302, weight: 10 },
  { name: 'Zanjan', persianName: 'زنجان', lat: 36.6769, lng: 48.4963, weight: 10 }
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
 * Generates a random Persian full name
 */
const getRandomPersianName = (): string => {
  const firstName = persianFirstNames[Math.floor(Math.random() * persianFirstNames.length)]
  const lastName = persianLastNames[Math.floor(Math.random() * persianLastNames.length)]
  return `${firstName} ${lastName}`
}

/**
 * Generates a random join date within the last 2 years
 */
const getRandomJoinDate = (): string => {
  const now = new Date()
  const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate())
  const randomTime = twoYearsAgo.getTime() + Math.random() * (now.getTime() - twoYearsAgo.getTime())
  return new Date(randomTime).toISOString()
}

/**
 * Generates a random number of subordinates (0-50 with more weight on lower numbers)
 * Uses exponential distribution: P(X > x) = e^(-λx)
 */
const getRandomSubordinates = (): number => {
  // Exponential distribution with λ = 1/15 (mean = 15)
  // Inverse CDF: x = -ln(1-U)/λ, capped at 50
  const lambda = 1 / 15
  const maxValue = 50
  const exponentialValue = -Math.log(1 - Math.random()) / lambda
  return Math.min(maxValue, Math.floor(exponentialValue))
}

/**
 * Generates a random capital amount (100-100000 TWIN)
 * Uses log-normal distribution: log(X) ~ N(μ, σ²)
 */
const getRandomCapital = (): number => {
  const min = 100
  const max = 100000
  const logMin = Math.log(min)
  const logMax = Math.log(max)
  const logRange = logMax - logMin
  
  // Generate normal distribution using Box-Muller transform approximation
  // For simplicity, use sum of 12 uniform randoms (Central Limit Theorem)
  // This approximates N(0, 1), then scale and shift
  let normal = 0
  for (let i = 0; i < 12; i++) {
    normal += Math.random()
  }
  normal = (normal - 6) / 2 // Approximate N(0, 1)
  
  // Convert to log-normal: X = exp(μ + σ * Z)
  // Use μ = (logMin + logMax) / 2 and σ = logRange / 4 for reasonable spread
  const mu = (logMin + logMax) / 2
  const sigma = logRange / 4
  const logValue = mu + sigma * normal
  
  // Ensure within bounds and convert back
  const clampedLogValue = Math.max(logMin, Math.min(logMax, logValue))
  return Math.floor(Math.exp(clampedLogValue))
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
        lng: city.lng + offset.lngOffset,
        fullName: getRandomPersianName(),
        joinDate: getRandomJoinDate(),
        subordinates: getRandomSubordinates(),
        capital: getRandomCapital()
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
      lng: randomCity.lng + offset.lngOffset,
      fullName: getRandomPersianName(),
      joinDate: getRandomJoinDate(),
      subordinates: getRandomSubordinates(),
      capital: getRandomCapital()
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

