'use client'

// ** React Imports
import { Suspense } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

const MyReferrerPageContent = () => {
  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        معرف من
      </Typography>
      <Card>
        <CardContent>
          <Typography variant='body1'>محتوای صفحه معرف من</Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

const MyReferrerPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyReferrerPageContent />
    </Suspense>
  )
}

export default MyReferrerPage

