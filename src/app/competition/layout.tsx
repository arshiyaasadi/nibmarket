'use client'

// ** React Imports
import { ReactNode, useEffect, useState } from 'react'

// ** Next Imports
import { useRouter, usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'

// ** Component Import
import Spinner from 'src/@core/components/spinner'

interface CompetitionLayoutProps {
  children: ReactNode
}

// ** Dynamic Import UserLayout to avoid SSR issues with next/router
const UserLayout = dynamic(() => import('src/layouts/UserLayout'), {
  ssr: false,
  loading: () => <Spinner />
})

const CompetitionLayout = ({ children }: CompetitionLayoutProps) => {
  // ** Hooks
  const auth = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return

    if (!auth.loading && auth.user === null) {
      const hasUserData = window.localStorage.getItem('userData')
      if (!hasUserData) {
        router.replace(`/?returnUrl=${encodeURIComponent(pathname)}`)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, auth.loading, auth.user, pathname])

  // Show spinner while loading or not mounted
  if (!mounted || auth.loading) {
    return <Spinner />
  }

  // If user is not authenticated, show spinner (redirect is happening)
  if (auth.user === null) {
    return <Spinner />
  }

  // Return UserLayout with menu and header
  const LayoutComponent = UserLayout as any

  return <LayoutComponent>{children}</LayoutComponent>
}

export default CompetitionLayout

