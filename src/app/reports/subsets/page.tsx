'use client'

// ** React Imports
import { Suspense } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

const SubsetsReportsPageContent = () => {
  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        گزارش زیر مجموعه ها
      </Typography>
      <Card>
        <CardContent>
          <Typography variant='body1'>محتوای صفحه گزارش زیر مجموعه ها</Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

const SubsetsReportsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubsetsReportsPageContent />
    </Suspense>
  )
}

export default SubsetsReportsPage

