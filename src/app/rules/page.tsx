'use client'

// ** React Imports
import { Suspense } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

const RulesPageContent = () => {
  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        قوانین و مقررات
      </Typography>
      <Card>
        <CardContent>
          <Typography variant='body1'>محتوای صفحه قوانین و مقررات</Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

const RulesPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RulesPageContent />
    </Suspense>
  )
}

export default RulesPage

