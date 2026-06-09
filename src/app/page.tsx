import { Suspense } from 'react'

import RootEntryClient from './RootEntryClient'

export default function RootEntryPage() {
  return (
    <Suspense
      fallback={
        <div
          className='content-center'
          style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          Loading...
        </div>
      }
    >
      <RootEntryClient />
    </Suspense>
  )
}
