'use client'

import { Suspense } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import DashboardWidgetState from 'src/components/dashboard/DashboardWidgetState'
import { useNetworkSubsetTree } from 'src/hooks/network/useNetworkSubsetTree'
import NetworkOrgChart from 'src/views/network/NetworkOrgChart'

const SubsetTreePageContent = () => {
  const { data, loading, retrying, error, usedFallback, refetch } = useNetworkSubsetTree()

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        درخت زیر مجموعه
      </Typography>
      <Card>
        <DashboardWidgetState
          loading={loading}
          retrying={retrying}
          error={error}
          usedFallback={usedFallback}
          onRetry={refetch}
          skeletonHeight={420}
          widgetTitle='درخت زیر مجموعه'
        >
          <CardContent sx={{ p: theme => `${theme.spacing(5)} !important` }}>
            <NetworkOrgChart roots={data.roots} truncated={data.truncated} />
          </CardContent>
        </DashboardWidgetState>
      </Card>
    </Box>
  )
}

const SubsetTreePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubsetTreePageContent />
    </Suspense>
  )
}

export default SubsetTreePage
