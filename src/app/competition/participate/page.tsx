'use client'

// ** React Imports
import { Suspense } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

const ParticipatePageContent = () => {
  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        شرکت در مسابقه
      </Typography>
      <Card>
        <CardContent>
          <Typography variant='body1'>محتوای صفحه شرکت در مسابقه</Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

const ParticipatePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ParticipatePageContent />
    </Suspense>
  )
}

export default ParticipatePage

