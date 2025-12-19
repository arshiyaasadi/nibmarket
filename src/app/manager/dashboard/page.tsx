'use client'

// ** React Imports
import { Suspense } from 'react'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

// ** Component Imports
import UserLocationMap from 'src/views/dashboards/manager/UserLocationMap'
import Spinner from 'src/@core/components/spinner'

const ManagerDashboardPageContent = () => {
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <Grid container spacing={6}>
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

