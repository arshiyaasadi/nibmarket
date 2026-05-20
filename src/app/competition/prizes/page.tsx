'use client'

// ** React Imports
import { Suspense } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

const PrizesPageContent = () => {
  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        جوایز و هدابا
      </Typography>
      <Card>
        <CardContent>
          <Typography variant='body1'>محتوای صفحه جوایز و هدابا</Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

const PrizesPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PrizesPageContent />
    </Suspense>
  )
}

export default PrizesPage

