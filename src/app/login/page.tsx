'use client'

import { Suspense } from 'react'

import Spinner from 'src/@core/components/spinner'
import BlankLayout from 'src/@core/layouts/BlankLayout'
import Box from '@mui/material/Box'
import ManualTokenLogin from 'src/components/auth/ManualTokenLogin'

export default function LoginPage() {
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
      <ManualTokenLogin />
    </Suspense>
  )
}
