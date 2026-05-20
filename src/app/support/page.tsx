'use client'

// ** React Imports
import { Suspense } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

const SupportPageContent = () => {
  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        پشتیبانی
      </Typography>
      <Card>
        <CardContent>
          <Typography variant='body1'>محتوای صفحه پشتیبانی</Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

const SupportPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SupportPageContent />
    </Suspense>
  )
}

export default SupportPage

