'use client'

// ** React Imports
import { Suspense } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

const RecordsPageContent = () => {
  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        سوابق و افتخارات من
      </Typography>
      <Card>
        <CardContent>
          <Typography variant='body1'>محتوای صفحه سوابق و افتخارات من</Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

const RecordsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RecordsPageContent />
    </Suspense>
  )
}

export default RecordsPage

