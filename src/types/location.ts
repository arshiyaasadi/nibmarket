export interface UserLocation {
  id: string
  lat: number
  lng: number
  fullName: string
  joinDate: string // ISO date string
  subordinates: number
  capital: number // Amount in TWIN
}

export interface ObfuscatedLocation {
  id: string
  lat: number
  lng: number
  fullName: string
  joinDate: string
  subordinates: number
  capital: number
}

