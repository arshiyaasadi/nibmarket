'use client'

import { Suspense, useMemo } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'

import DashboardWidgetState from 'src/components/dashboard/DashboardWidgetState'
import { useCurrentUser } from 'src/hooks/layout/useCurrentUser'
import { useNetworkSubsetTree } from 'src/hooks/network/useNetworkSubsetTree'
import { wrapWithCurrentUserRoot } from 'src/lib/network/subset-tree-builder'
import NetworkOrgChart from 'src/views/network/NetworkOrgChart'

const CHART_MIN_HEIGHT = 480

const SubsetTreePageContent = () => {
  const { data, loading, retrying, error, usedFallback, refetch } = useNetworkSubsetTree()
  const { data: currentUser, loading: userLoading } = useCurrentUser()

  const treeRoot = useMemo(() => {
    const user =
      currentUser?.id != null
        ? {
            id: currentUser.id,
            firstName: currentUser.firstName ?? '',
            lastName: currentUser.lastName ?? ''
          }
        : null

    return wrapWithCurrentUserRoot(data.roots, user)
  }, [data.roots, currentUser])

  const isLoading = loading || userLoading

  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4 }}>
        درخت زیر مجموعه
      </Typography>
      <Card>
        <DashboardWidgetState
          loading={isLoading}
          retrying={retrying}
          error={error}
          usedFallback={usedFallback}
          onRetry={refetch}
          skeletonHeight={CHART_MIN_HEIGHT}
          widgetTitle='درخت زیر مجموعه'
        >
          <CardContent
            sx={{
              p: theme => `${theme.spacing(5)} !important`,
              width: '100%',
              minHeight: CHART_MIN_HEIGHT,
              boxSizing: 'border-box'
            }}
          >
            <NetworkOrgChart root={treeRoot} truncated={data.truncated} minHeight={CHART_MIN_HEIGHT - 40} />
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
