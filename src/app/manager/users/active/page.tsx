'use client'

// ** React Imports
import { Suspense, useState, useMemo } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

// ** Component Imports
import ActiveUsersMetrics from 'src/views/dashboards/manager/users/ActiveUsersMetrics'
import ActiveUsersTable, { ActiveUser } from 'src/views/dashboards/manager/users/ActiveUsersTable'

// ** Mock Data Generator
const generateMockActiveUsers = (count: number): ActiveUser[] => {
  const firstNames = ['علی', 'محمد', 'حسین', 'رضا', 'امیر', 'سعید', 'مهدی', 'احمد', 'حسن', 'فرهاد']
  const lastNames = ['احمدی', 'رضایی', 'کریمی', 'موسوی', 'نوری', 'حسینی', 'محمدی', 'صادقی', 'جعفری', 'زمانی']
  
  const users: ActiveUser[] = []
  const now = new Date()
  
  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    
    // Generate random join date within last 2 years
    const joinDate = new Date()
    joinDate.setDate(joinDate.getDate() - Math.floor(Math.random() * 730))
    
    // Generate last invite date (within last 90 days, or null for some users)
    const lastInviteDate = Math.random() > 0.1 
      ? new Date(now.getTime() - Math.random() * 90 * 24 * 60 * 60 * 1000)
      : null
    
    // Generate last capital increase date (within last 60 days, or null for some users)
    const lastCapitalIncreaseDate = Math.random() > 0.15
      ? new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000)
      : null
    
    const subordinates = Math.floor(Math.random() * 50) + 1
    const activeSubordinates = Math.floor(subordinates * (0.3 + Math.random() * 0.6)) // 30-90% active
    
    users.push({
      id: i,
      fullName: `${firstName} ${lastName}`,
      email: `user${i}@example.com`,
      phone: `09${Math.floor(Math.random() * 90000000) + 10000000}`,
      joinDate: joinDate.toISOString(),
      status: 'active',
      subordinates,
      capital: Math.floor(Math.random() * 100000) + 10000,
      subordinatesCapital: Math.floor(Math.random() * 500000) + 10000,
      lastInviteDate: lastInviteDate ? lastInviteDate.toISOString() : null,
      lastCapitalIncreaseDate: lastCapitalIncreaseDate ? lastCapitalIncreaseDate.toISOString() : null,
      activeSubordinates
    })
  }
  
  return users
}

const ActiveUsersPageContent = () => {
  // ** Mock data - in real app, this would come from API
  const [activeUsers] = useState<ActiveUser[]>(() => generateMockActiveUsers(85))
  
  // Calculate metrics
  const metrics = useMemo(() => {
    const totalSubordinates = activeUsers.reduce((sum, user) => sum + user.subordinates, 0)
    const totalCapital = activeUsers.reduce((sum, user) => sum + user.capital, 0)
    const totalSubordinatesCapital = activeUsers.reduce((sum, user) => sum + user.subordinatesCapital, 0)
    
    return {
      totalSubordinates,
      totalCapital,
      totalSubordinatesCapital
    }
  }, [activeUsers])

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        کاربران فعال
      </Typography>
      
      {/* Metrics */}
      <Box sx={{ mb: 6 }}>
        <ActiveUsersMetrics 
          totalSubordinates={metrics.totalSubordinates}
          totalCapital={metrics.totalCapital}
          totalSubordinatesCapital={metrics.totalSubordinatesCapital}
        />
      </Box>
      
      {/* Active Users Table */}
      <ActiveUsersTable users={activeUsers} />
    </Box>
  )
}

const ActiveUsersPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ActiveUsersPageContent />
    </Suspense>
  )
}

export default ActiveUsersPage
