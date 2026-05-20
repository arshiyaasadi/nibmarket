'use client'

import { useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import BlankLayout from 'src/@core/layouts/BlankLayout'

const BACKEND_HEALTH_URL = 'https://club.nibdev.com/health'
const PROBE_API = '/api/health/backend/'

type HealthProbeResult = {
  ok: boolean
  status: number
  statusText: string
  url: string
  body: { status?: string } | null
  healthy: boolean
  error?: string
}

export default function HealthPage() {
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<HealthProbeResult | null>(null)

  const runCheck = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(PROBE_API, { cache: 'no-store' })
      const data = (await res.json()) as HealthProbeResult
      setResult(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setResult({
        ok: false,
        status: 0,
        statusText: 'client_fetch_failed',
        url: BACKEND_HEALTH_URL,
        body: null,
        healthy: false,
        error: message
      })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    runCheck()
  }, [runCheck])

  const statusColor = result?.healthy ? 'success' : result ? 'error' : 'default'

  return (
    <BlankLayout>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          bgcolor: 'background.default'
        }}
      >
        <Card sx={{ maxWidth: 560, width: '100%' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Typography variant='h5' component='h1'>
              Backend health check
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              This page calls the backend from the Next.js server (same path as{' '}
              <Box component='code' sx={{ fontSize: '0.85em' }}>
                GET {BACKEND_HEALTH_URL}
              </Box>
              ) so you can confirm the app can reach the API.
            </Typography>

            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={28} />
                <Typography variant='body2'>Checking backend…</Typography>
              </Box>
            ) : result ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
                  <Chip
                    label={result.healthy ? 'Healthy' : 'Unreachable or unhealthy'}
                    color={statusColor}
                    variant='filled'
                  />
                  {result.status > 0 && (
                    <Chip label={`HTTP ${result.status}`} variant='outlined' size='small' />
                  )}
                </Box>

                <Box>
                  <Typography variant='caption' color='text.secondary'>
                    Target URL
                  </Typography>
                  <Typography variant='body2' component='p' sx={{ wordBreak: 'break-all' }}>
                    {result.url}
                  </Typography>
                </Box>

                {result.body && (
                  <Box>
                    <Typography variant='caption' color='text.secondary'>
                      Response body
                    </Typography>
                    <Box
                      component='pre'
                      sx={{
                        mt: 0.5,
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'action.hover',
                        fontSize: '0.875rem',
                        overflow: 'auto'
                      }}
                    >
                      {JSON.stringify(result.body, null, 2)}
                    </Box>
                  </Box>
                )}

                {result.error && (
                  <Typography variant='body2' color='error.main'>
                    {result.error}
                  </Typography>
                )}

                {!result.healthy && result.status === 200 && result.body?.status !== 'healthy' && (
                  <Typography variant='body2' color='warning.main'>
                    Expected HTTP 200 with body{' '}
                    <Box component='code' sx={{ fontSize: '0.85em' }}>
                      {'{ "status": "healthy" }'}
                    </Box>
                  </Typography>
                )}
              </Box>
            ) : null}

            <Button variant='outlined' onClick={runCheck} disabled={loading}>
              Run again
            </Button>
          </CardContent>
        </Card>
      </Box>
    </BlankLayout>
  )
}
