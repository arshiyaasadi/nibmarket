'use client'

import { ReactNode } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'

import Icon from 'src/@core/components/icon'
import DashboardWidgetErrorBoundary from 'src/components/dashboard/DashboardWidgetErrorBoundary'

type DashboardWidgetStateProps = {
  loading: boolean
  retrying?: boolean
  error: string | null
  usedFallback: boolean
  onRetry?: () => void
  skeletonHeight?: number
  isEmpty?: boolean
  emptyMessage?: string
  widgetTitle?: string
  children: ReactNode
}

function WidgetErrorOverlay({
  message,
  onRetry,
  retrying
}: {
  message: string
  onRetry?: () => void
  retrying?: boolean
}) {
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2.5,
        px: 4,
        textAlign: 'center',
        bgcolor: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(2px)',
        borderRadius: 1
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Icon icon={retrying ? 'mdi:loading' : 'mdi:cloud-off-outline'} fontSize={28} style={{ color: '#6d788d' }} />
      </Box>
      <Typography variant='body2' sx={{ fontWeight: 600, color: 'text.primary', maxWidth: 300, lineHeight: 1.6 }}>
        {message}
      </Typography>
      {onRetry && !retrying && (
        <Button
          variant='contained'
          size='small'
          onClick={onRetry}
          startIcon={<Icon icon='mdi:refresh' fontSize={18} />}
          sx={{ minWidth: 140 }}
        >
          تلاش مجدد
        </Button>
      )}
      {retrying && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CircularProgress size={18} />
          <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 500 }}>
            در حال تلاش مجدد...
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default function DashboardWidgetState({
  loading,
  retrying = false,
  error,
  usedFallback,
  onRetry,
  skeletonHeight = 280,
  isEmpty = false,
  emptyMessage = 'اطلاعاتی برای نمایش وجود ندارد',
  widgetTitle,
  children
}: DashboardWidgetStateProps) {
  if (loading) {
    return (
      <Box sx={{ p: 6 }}>
        <Skeleton variant='rounded' height={skeletonHeight} animation='wave' />
      </Box>
    )
  }

  const showOverlay = Boolean(error) || retrying
  const overlayMessage = retrying && !error ? 'در حال بارگذاری مجدد...' : error || ''

  return (
    <DashboardWidgetErrorBoundary title={widgetTitle} onReset={onRetry}>
      <Box sx={{ position: 'relative', minHeight: skeletonHeight }}>
        <Box
          sx={{
            opacity: showOverlay ? 0.45 : 1,
            pointerEvents: showOverlay ? 'none' : 'auto',
            transition: 'opacity 0.2s ease'
          }}
        >
          {usedFallback && !error && !retrying && (
            <Box sx={{ px: 6, pt: 4, pb: 0 }}>
              <Typography variant='caption' sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon icon='mdi:information-outline' fontSize={16} />
                نمایش داده آزمایشی
              </Typography>
            </Box>
          )}
          {isEmpty && !showOverlay ? (
            <Box
              sx={{
                px: 6,
                py: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: skeletonHeight,
                gap: 2
              }}
            >
              <Icon icon='mdi:database-off-outline' fontSize='3rem' style={{ opacity: 0.4 }} />
              <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                {emptyMessage}
              </Typography>
              {onRetry && (
                <Button variant='outlined' size='small' startIcon={<Icon icon='mdi:refresh' />} onClick={onRetry}>
                  به‌روزرسانی
                </Button>
              )}
            </Box>
          ) : (
            children
          )}
        </Box>
        {showOverlay && overlayMessage && (
          <WidgetErrorOverlay message={overlayMessage} onRetry={onRetry} retrying={retrying} />
        )}
      </Box>
    </DashboardWidgetErrorBoundary>
  )
}
