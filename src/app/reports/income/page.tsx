'use client'

// ** React Imports
import { Suspense } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

const IncomeReportsPageContent = () => {
  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        گزارش درامد ها
      </Typography>
      <Card>
        <CardContent>
          <Typography variant='body1'>محتوای صفحه گزارش درامد ها</Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

const IncomeReportsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <IncomeReportsPageContent />
    </Suspense>
  )
}

export default IncomeReportsPage

