'use client'

// ** React Imports
import { Suspense, useState, useEffect, useMemo } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

// ** Component Imports
import UserLocationMap from 'src/views/dashboards/manager/UserLocationMap'
import UserStatsCard from 'src/views/dashboards/manager/UserStatsCard'
import PoolStatsCard from 'src/views/dashboards/manager/PoolStatsCard'
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

  // Calculate user stats
  const userStats = useMemo(() => {
    const currentCount = userLocations.length
    // Simulate previous month count (could be from API)
    // For now, we'll use 90% of current count as previous (11.1% growth)
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

  // Calculate pool stats from user data
  const poolStats = useMemo(() => {
    const totalCapital = userLocations.reduce((sum, user) => sum + user.capital, 0)
    const participantCount = userLocations.length
    // Simulate 12.5% monthly growth
    const monthlyChange = 12.5

    return {
      poolBalance: totalCapital,
      participants: participantCount,
      monthlyChange
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
          <UserStatsCard 
            totalUsers={userStats.currentCount} 
            growthPercentage={userStats.growthPercentage}
            currentCount={userStats.currentCount}
            previousCount={userStats.previousCount}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <PoolStatsCard 
            poolBalance={poolStats.poolBalance}
            participants={poolStats.participants}
            monthlyChange={poolStats.monthlyChange}
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

