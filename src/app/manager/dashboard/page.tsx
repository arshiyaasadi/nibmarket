'use client'

// ** React Imports
import { Suspense, useState, useEffect, useMemo } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

// ** Component Imports
import UserLocationMap from 'src/views/dashboards/manager/UserLocationMap'
import UserCountStats from 'src/views/dashboards/manager/UserCountStats'
import UserGrowthChart from 'src/views/dashboards/manager/UserGrowthChart'
import Spinner from 'src/@core/components/spinner'

// ** Utils
import { getUserLocations } from 'src/data/user-locations'

// ** Types
import type { UserLocation } from 'src/types/location'

const ManagerDashboardPageContent = () => {
  const [userLocations, setUserLocations] = useState<UserLocation[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch user locations to calculate stats
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const locations = await getUserLocations()
        setUserLocations(locations)
      } catch (error) {
        console.error('Error fetching user locations:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  // Calculate stats
  const stats = useMemo(() => {
    const currentCount = userLocations.length
    // Simulate previous month count (could be from API)
    // For now, we'll use 90% of current count as previous (10% growth)
    const previousCount = Math.round(currentCount * 0.9)
    const growthPercentage = currentCount > 0 
      ? ((currentCount - previousCount) / previousCount) * 100 
      : 0

    return {
      currentCount,
      previousCount,
      growthPercentage
    }
  }, [userLocations])

  if (loading) {
    return <Spinner />
  }

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Grid container spacing={6}>
        {/* Stats Cards */}
        <Grid item xs={12} md={6}>
          <UserCountStats 
            totalUsers={stats.currentCount} 
            growthPercentage={stats.growthPercentage} 
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <UserGrowthChart 
            currentCount={stats.currentCount}
            previousCount={stats.previousCount}
          />
        </Grid>
        
        {/* Map */}
        <Grid item xs={12}>
          <UserLocationMap />
        </Grid>
      </Grid>
    </Box>
  )
}

const ManagerDashboardPage = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <ManagerDashboardPageContent />
    </Suspense>
  )
}

export default ManagerDashboardPage

