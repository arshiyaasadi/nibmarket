'use client'

// ** React Imports
import { Suspense } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

const InviteFriendsPageContent = () => {
  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        دعوت از دوستان
      </Typography>
      <Card>
        <CardContent>
          <Typography variant='body1'>محتوای صفحه دعوت از دوستان</Typography>
        </CardContent>
      </Card>
    </Box>
  )
}

const InviteFriendsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <InviteFriendsPageContent />
    </Suspense>
  )
}

export default InviteFriendsPage

