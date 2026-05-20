import type { UserLocation, ObfuscatedLocation } from 'src/types/location'

/**
 * Obfuscates user coordinates to protect privacy
 * Rounds coordinates to approximately 500m-1km precision
 * (~0.005 degrees at Iran's latitude)
 * 
 * @param location - User location with lat and lng
 * @returns Obfuscated location with reduced precision
 */
export const obfuscateLocation = (location: UserLocation): ObfuscatedLocation => {
  // Round to ~0.005 degrees (~500m precision at Iran's latitude)
  // This ensures exact user locations are never exposed
  const precision = 0.005
  
  return {
    id: location.id, // Preserve id for stable React keys
    lat: Math.round(location.lat / precision) * precision,
    lng: Math.round(location.lng / precision) * precision,
    fullName: location.fullName,
    joinDate: location.joinDate,
    subordinates: location.subordinates,
    capital: location.capital
  }
}

/**
 * Obfuscates an array of user locations
 * 
 * @param locations - Array of user locations
 * @returns Array of obfuscated locations
 */
export const obfuscateLocations = (locations: UserLocation[]): ObfuscatedLocation[] => {
  return locations.map(obfuscateLocation)
}

