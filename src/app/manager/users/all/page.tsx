'use client'

// ** React Imports
import { Suspense, useState, useMemo } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

// ** Component Imports
import DailyRegistrationsWidget from 'src/views/dashboards/manager/users/DailyRegistrationsWidget'
import DailyChangeWidget from 'src/views/dashboards/manager/users/DailyChangeWidget'
import AllUsersTable, { User } from 'src/views/dashboards/manager/users/AllUsersTable'

// ** Mock Data Generator
const generateMockUsers = (count: number): User[] => {
  const firstNames = ['علی', 'محمد', 'حسین', 'رضا', 'امیر', 'سعید', 'مهدی', 'احمد', 'حسن', 'فرهاد']
  const lastNames = ['احمدی', 'رضایی', 'کریمی', 'موسوی', 'نوری', 'حسینی', 'محمدی', 'صادقی', 'جعفری', 'زمانی']
  const statuses: ('active' | 'inactive' | 'suspended')[] = ['active', 'inactive', 'suspended']
  
  const users: User[] = []
  
  for (let i = 1; i <= count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    
    // Generate random join date within last 2 years
    const joinDate = new Date()
    joinDate.setDate(joinDate.getDate() - Math.floor(Math.random() * 730))
    
    users.push({
      id: i,
      fullName: `${firstName} ${lastName}`,
      email: `user${i}@example.com`,
      phone: `09${Math.floor(Math.random() * 90000000) + 10000000}`,
      joinDate: joinDate.toISOString(),
      status,
      subordinates: Math.floor(Math.random() * 50),
      capital: Math.floor(Math.random() * 100000) + 1000,
      subordinatesCapital: Math.floor(Math.random() * 500000) + 5000
    })
  }
  
  return users
}

const AllUsersPageContent = () => {
  // ** Mock data - in real app, this would come from API
  const [users] = useState<User[]>(() => generateMockUsers(150))
  
  // Calculate today's registrations
  const todayRegistrations = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return users.filter(user => {
      const joinDate = new Date(user.joinDate)
      joinDate.setHours(0, 0, 0, 0)
      return joinDate.getTime() === today.getTime()
    }).length
  }, [users])
  
  // Calculate yesterday's registrations
  const yesterdayRegistrations = useMemo(() => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    return users.filter(user => {
      const joinDate = new Date(user.joinDate)
      joinDate.setHours(0, 0, 0, 0)
      return joinDate.getTime() === yesterday.getTime()
    }).length
  }, [users])
  
  // Calculate percentage change
  const changePercentage = useMemo(() => {
    if (yesterdayRegistrations === 0) {
      return todayRegistrations > 0 ? 100 : 0
    }
    return ((todayRegistrations - yesterdayRegistrations) / yesterdayRegistrations) * 100
  }, [todayRegistrations, yesterdayRegistrations])

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        تمام کاربران
      </Typography>
      
      {/* Widgets Row */}
      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} md={6}>
          <DailyRegistrationsWidget todayRegistrations={todayRegistrations} />
        </Grid>
        <Grid item xs={12} md={6}>
          <DailyChangeWidget changePercentage={changePercentage} />
        </Grid>
      </Grid>
      
      {/* Users Table */}
      <AllUsersTable users={users} />
    </Box>
  )
}

const AllUsersPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AllUsersPageContent />
    </Suspense>
  )
}

export default AllUsersPage
