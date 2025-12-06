'use client'

// ** React Imports
import { Suspense } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

const MySubsetsPageContent = () => {
  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        زیر محموعه های من
      </Typography>
      <Card>
        <CardContent>
          <Typography variant='body1'>محتوای صفحه زیر محموعه های من</Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

const MySubsetsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MySubsetsPageContent />
    </Suspense>
  )
}

export default MySubsetsPage

