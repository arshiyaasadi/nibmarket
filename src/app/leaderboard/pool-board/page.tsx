'use client'

// ** React Imports
import { Suspense } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

const PoolBoardPageContent = () => {
  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        استخر و بورد
      </Typography>
      <Card>
        <CardContent>
          <Typography variant='body1'>محتوای صفحه استخر و بورد</Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

const PoolBoardPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PoolBoardPageContent />
    </Suspense>
  )
}

export default PoolBoardPage

