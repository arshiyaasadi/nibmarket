'use client'

import { Suspense } from 'react'

import Spinner from 'src/@core/components/spinner'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import Box from '@mui/material/Box'
import ManualTokenLogin from 'src/components/auth/ManualTokenLogin'

/**
 * Manual SSO bypass — no panel redirect. Paste nib_auth when cross-domain cookies fail.
 */
export default function LoginTokenManualPage() {
  return (
    <Suspense
      fallback={
        <BlankLayout>
          <Box className='content-center' sx={{ minHeight: '100vh' }}>
            <Spinner />
          </Box>
        </BlankLayout>
      }
    >
      <ManualTokenLogin showSsoBypassHint />
    </Suspense>
  )
}
