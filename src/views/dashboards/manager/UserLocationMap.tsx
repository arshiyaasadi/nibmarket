'use client'

// ** React Imports
import { useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'

// ** MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Autocomplete from '@mui/material/Autocomplete'
import { useTheme } from '@mui/material/styles'

// ** Types
import type { UserLocation, ObfuscatedLocation } from 'src/types/location'

// ** Utils
import { obfuscateLocations } from 'src/utils/location-privacy'
import { getUserLocations } from 'src/data/user-locations'

// ** Iranian cities data
interface CityOption {
  name: string
  lat: number
  lng: number
}

const iranianCities: CityOption[] = [
  { name: 'تهران', lat: 35.6892, lng: 51.3890 },
  { name: 'مشهد', lat: 36.2605, lng: 59.6168 },
  { name: 'اصفهان', lat: 32.6546, lng: 51.6680 },
  { name: 'کرج', lat: 35.8327, lng: 50.9345 },
  { name: 'شیراز', lat: 29.5918, lng: 52.5837 },
  { name: 'تبریز', lat: 38.0962, lng: 46.2738 },
  { name: 'قم', lat: 34.6416, lng: 50.8746 },
  { name: 'اهواز', lat: 31.3183, lng: 48.6706 },
  { name: 'کرمانشاه', lat: 34.3142, lng: 47.0650 },
  { name: 'ارومیه', lat: 37.5527, lng: 45.0760 },
  { name: 'رشت', lat: 37.2808, lng: 49.5832 },
  { name: 'زاهدان', lat: 29.4960, lng: 60.8629 },
  { name: 'همدان', lat: 34.7992, lng: 48.5146 },
  { name: 'کرمان', lat: 30.2839, lng: 57.0834 },
  { name: 'یزد', lat: 31.8974, lng: 54.3569 },
  { name: 'اردبیل', lat: 38.2498, lng: 48.2933 },
  { name: 'بندرعباس', lat: 27.1865, lng: 56.2808 },
  { name: 'اراک', lat: 34.0956, lng: 49.7019 },
  { name: 'اسلامشهر', lat: 35.5446, lng: 51.2302 },
  { name: 'زنجان', lat: 36.6769, lng: 48.4963 }
]

// ** Dynamic imports for Leaflet (SSR-safe)
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), {
  ssr: false
})

const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), {
  ssr: false
})

const MarkerClusterGroup = dynamic(() => import('react-leaflet-cluster'), {
  ssr: false
})

const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), {
  ssr: false
})

const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), {
  ssr: false
})

// useMap will be imported inside MapController component

// ** Leaflet will be imported dynamically in the component


interface ClusterIconProps {
  count: number
  theme: any
}

/**
 * Creates a custom cluster icon based on user count
 */
const createClusterIcon = (count: number, theme: any) => {
  const L = typeof window !== 'undefined' ? (window as any).L : null
  if (!L) return null

  // Determine size and color based on user count
  let size = 40
  let color = theme.palette.primary.light
  let textColor = theme.palette.primary.contrastText

  if (count <= 10) {
    size = 40
    color = theme.palette.info.light
    textColor = theme.palette.info.contrastText
  } else if (count <= 50) {
    size = 50
    color = theme.palette.primary.main
    textColor = theme.palette.primary.contrastText
  } else if (count <= 100) {
    size = 60
    color = theme.palette.warning.main
    textColor = theme.palette.warning.contrastText
  } else {
    size = 70
    color = theme.palette.error.main
    textColor = theme.palette.error.contrastText
  }

  return L.divIcon({
    html: `<div style="
      background-color: ${color};
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      border: 3px solid ${theme.palette.background.paper};
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: ${size > 50 ? '14px' : '12px'};
      color: ${textColor};
      box-shadow: ${theme.shadows[4]};
    ">${count}</div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(size, size),
    iconAnchor: L.point(size / 2, size / 2)
  })
}

// ** Component to handle map zoom/pan when city changes
// This component must be used inside MapContainer
const MapController = dynamic(
  () =>
    import('react-leaflet').then((mod) => {
      const { useMap } = mod
      return ({ selectedCity, defaultCenter, defaultZoom }: { 
        selectedCity: CityOption | null
        defaultCenter: [number, number]
        defaultZoom: number
      }) => {
        const map = useMap()

        useEffect(() => {
          if (selectedCity) {
            // Zoom to selected city
            map.setView([selectedCity.lat, selectedCity.lng], 11, {
              animate: true,
              duration: 0.5
            })
          } else {
            // Reset to default view
            map.setView(defaultCenter, defaultZoom, {
              animate: true,
              duration: 0.5
            })
          }
        }, [selectedCity, map, defaultCenter, defaultZoom])

        return null
      }
    }),
  { ssr: false }
)

const UserLocationMap = () => {
  const theme = useTheme()
  const [userLocations, setUserLocations] = useState<UserLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null)

  // ** Mount check for client-side only rendering and load CSS/Leaflet
  useEffect(() => {
    if (typeof window === 'undefined') return

    setMounted(true)
    
    // Load Leaflet CSS and library
    Promise.all([
      import('leaflet/dist/leaflet.css'),
      import('leaflet')
    ]).then(([, leaflet]) => {
      const L = leaflet.default
      // Fix for default marker icon in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
      })
      // Store L globally for use in createClusterIcon
      ;(window as any).L = L
      setLeafletLoaded(true)
    })
  }, [])

  // ** Fetch user locations
  useEffect(() => {
    if (!mounted) return

    const fetchLocations = async () => {
      try {
        setLoading(true)
        const locations = await getUserLocations()
        setUserLocations(locations)
      } catch (error) {
        console.error('Error fetching user locations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [mounted])

  // ** Obfuscate locations for privacy
  const obfuscatedLocations = useMemo(() => {
    if (!userLocations.length) return []
    return obfuscateLocations(userLocations)
  }, [userLocations])

  // ** Don't render until mounted and Leaflet is loaded (client-side only)
  if (!mounted || !leafletLoaded || loading) {
    return (
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardHeader
          title='نقشه توزیع کاربران'
          subheader='نمایش توزیع جغرافیایی کاربران در ایران'
          titleTypographyProps={{ variant: 'h6' }}
          subheaderTypographyProps={{ variant: 'body2' }}
        />
        <CardContent sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant='body1' color='text.secondary'>
            در حال بارگذاری نقشه...
          </Typography>
        </CardContent>
      </Card>
    )
  }

  // ** Iran center coordinates
  const iranCenter: [number, number] = [32.4279, 53.6880]
  const defaultZoom = 5
  const maxZoom = 12 // Maximum zoom level to prevent zooming in too much
  
  // ** Iran boundaries (approximate bounding box)
  // Southwest corner and Northeast corner of Iran
  const iranBounds: [[number, number], [number, number]] = [
    [25.0, 44.0], // Southwest (lat, lng)
    [40.0, 63.5]  // Northeast (lat, lng)
  ]

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <CardHeader
        title='نقشه توزیع کاربران'
        titleTypographyProps={{ variant: 'h6' }}
        action={
          <Autocomplete
            sx={{ width: 300 }}
            options={iranianCities}
            getOptionLabel={(option) => option.name}
            value={selectedCity}
            onChange={(event, newValue) => {
              setSelectedCity(newValue)
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label='جستجوی شهر'
                placeholder='شهر را انتخاب کنید'
                size='small'
              />
            )}
            noOptionsText='شهری یافت نشد'
            clearOnEscape
            clearText='پاک کردن'
          />
        }
      />
      <CardContent sx={{ flex: 1, p: '20px', position: 'relative', display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            flex: 1,
            height: '600px',
            minHeight: '500px',
            width: '100%',
            position: 'relative',
            '& .leaflet-container': {
              height: '100%',
              width: '100%',
              zIndex: 0,
              borderRadius: '0 0 4px 4px'
            },
            '& .custom-cluster-icon': {
              background: 'transparent',
              border: 'none'
            }
          }}
        >
          <MapContainer
            center={iranCenter}
            zoom={defaultZoom}
            minZoom={5}
            maxZoom={maxZoom}
            maxBounds={iranBounds}
            maxBoundsViscosity={1.0}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            <MapController 
              selectedCity={selectedCity}
              defaultCenter={iranCenter}
              defaultZoom={defaultZoom}
            />
            {leafletLoaded && obfuscatedLocations.length > 0 && (() => {
              const L = (window as any).L
              if (!L) return null
              
              return (
                <MarkerClusterGroup
                  chunkedLoading
                  iconCreateFunction={(cluster: any) => {
                    const count = cluster.getChildCount()
                    return createClusterIcon(count, theme) || cluster.getClusterIcon()
                  }}
                  maxClusterRadius={80}
                  spiderfyOnMaxZoom={false}
                  showCoverageOnHover={false}
                  zoomToBoundsOnClick={true}
                  removeOutsideVisibleBounds={true}
                >
                  {obfuscatedLocations.map((location: ObfuscatedLocation, index: number) => (
                    <Marker
                      key={`marker-${index}`}
                      position={[location.lat, location.lng]}
                      icon={L.icon({
                        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                        iconSize: [25, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        tooltipAnchor: [16, -28],
                        shadowSize: [41, 41]
                      })}
                    >
                      <Popup>
                        <Typography variant='body2'>
                          تعداد کاربران در این منطقه
                        </Typography>
                      </Popup>
                    </Marker>
                  ))}
                </MarkerClusterGroup>
              )
            })()}
          </MapContainer>
        </Box>
      </CardContent>
    </Card>
  )
}

export default UserLocationMap

