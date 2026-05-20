'use client'

// ** React Imports
import { ReactNode, useEffect, useState } from 'react'

// ** Next Imports
import { useRouter, usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'
import { normalizeUserRole } from 'src/configs/acl'

// ** Component Import
import Spinner from 'src/@core/components/spinner'

interface ManagerLayoutProps {
  children: ReactNode
}

// ** Dynamic Import UserLayout to avoid SSR issues with next/router
// Router shim is configured in next.config.js to alias next/router imports
const UserLayout = dynamic(() => import('src/layouts/UserLayout'), {
  ssr: false,
  loading: () => <Spinner />
})

const ManagerLayout = ({ children }: ManagerLayoutProps) => {
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

    if (!auth.loading && auth.user) {
      const role = normalizeUserRole(auth.user.role)
      if (role !== 'manager' && role !== 'admin') {
        router.replace('/dashboard')
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

  const userRole = normalizeUserRole(auth.user.role)
  if (userRole !== 'manager' && userRole !== 'admin') {
    return <Spinner />
  }

  // Return UserLayout with menu and header
  // Router shim ensures next/router imports are compatible with App Router
  const LayoutComponent = UserLayout as any

  return <LayoutComponent>{children}</LayoutComponent>
}

export default ManagerLayout

