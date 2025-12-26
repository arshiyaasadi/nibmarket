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
 */
const getRandomSubordinates = (): number => {
  // Exponential distribution: more users have fewer subordinates
  return Math.floor(Math.random() * Math.random() * 50)
}

/**
 * Generates a random capital amount (100-100000 TWIN)
 */
const getRandomCapital = (): number => {
  // Log-normal distribution for capital
  const min = 100
  const max = 100000
  return Math.floor(min + Math.random() * Math.random() * (max - min))
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

