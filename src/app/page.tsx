import { cookies } from 'next/headers'
import { Suspense } from 'react'

import { NIB_AUTH_COOKIE } from 'src/configs/api'
import { stripBearerPrefix } from 'src/lib/auth-token'

import RootEntryClient from './RootEntryClient'

export default async function RootEntryPage() {
  const cookieStore = await cookies()
  const nibAuthRaw = cookieStore.get(NIB_AUTH_COOKIE)?.value ?? null
  const serverNibAuthToken = nibAuthRaw ? stripBearerPrefix(nibAuthRaw) : null

  return (
    <Suspense
      fallback={
        <div className='content-center' style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Loading...
        </div>
      }
    >
      <RootEntryClient serverNibAuthToken={serverNibAuthToken} />
    </Suspense>
  )
}
