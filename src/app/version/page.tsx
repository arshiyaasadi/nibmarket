'use client'

import { useCallback, useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import type { BuildInfo } from 'src/lib/build-info'

type VersionApiResponse = BuildInfo & {
  ok?: boolean
  isProduction?: boolean
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 0.5, py: 1 }}>
      <Typography variant='body2' color='text.secondary' sx={{ minWidth: 160, fontWeight: 600 }}>
        {label}
      </Typography>
      <Typography variant='body2' component='code' sx={{ wordBreak: 'break-all' }}>
        {value}
      </Typography>
    </Box>
  )
}

export default function VersionPage() {
  const [loading, setLoading] = useState(true)
  const [info, setInfo] = useState<VersionApiResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/version', { cache: 'no-store' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as VersionApiResponse
      setInfo(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      setError(message)
      setInfo(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const isProd = info?.environment === 'production' || info?.isProduction

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
        <Card sx={{ maxWidth: 640, width: '100%' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
              <Typography variant='h5' component='h1'>
                اطلاعات نسخه
              </Typography>
              {info ? (
                <Chip
                  label={isProd ? 'پروداکشن' : 'توسعه'}
                  color={isProd ? 'success' : 'warning'}
                  size='small'
                  variant='filled'
                />
              ) : null}
            </Box>

            <Typography variant='body2' color='text.secondary'>
              این صفحه metadata بیلد فعلی را نشان می‌دهد (زمان بیلد، commit، محیط اجرا).
            </Typography>

            <Divider />

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color='error.main'>خطا در خواندن اطلاعات نسخه: {error}</Typography>
            ) : info ? (
              <Box>
                <Row label='نسخه اپ' value={info.version} />
                <Row label='محیط' value={info.environment === 'production' ? 'پروداکشن (Production)' : 'توسعه (Development)'} />
                <Row label='زمان آخرین بیلد (UTC)' value={info.buildTime} />
                <Row label='Commit (کوتاه)' value={info.gitCommit} />
                {info.gitCommitFull && info.gitCommitFull !== info.gitCommit ? (
                  <Row label='Commit (کامل)' value={info.gitCommitFull} />
                ) : null}
                {info.nodeEnv ? <Row label='NODE_ENV' value={info.nodeEnv} /> : null}
              </Box>
            ) : null}

            <Box sx={{ display: 'flex', gap: 2, pt: 1 }}>
              <Button variant='contained' onClick={load} disabled={loading}>
                بروزرسانی
              </Button>
              <Button variant='outlined' href='/'>
                صفحه ورود
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </BlankLayout>
  )
}
