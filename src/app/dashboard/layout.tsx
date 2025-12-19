'use client'

// ** React Imports
import { ReactNode, useEffect, useState } from 'react'

// ** Next Imports
import { useRouter, usePathname } from 'next/navigation'
import dynamic from 'next/dynamic'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'

// ** Config Import
import { buildAbilityFor } from 'src/configs/acl'

// ** Component Import
import Spinner from 'src/@core/components/spinner'
import NotAuthorized from 'src/template-pages/401'
import BlankLayout from 'src/@core/layouts/BlankLayout'

interface DashboardLayoutProps {
  children: ReactNode
}

// ** Dynamic Import UserLayout to avoid SSR issues with next/router
// Router shim is configured in next.config.js to alias next/router imports
const UserLayout = dynamic(() => import('src/layouts/UserLayout'), {
  ssr: false,
  loading: () => <Spinner />
})

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
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

  // Check ACL permission for dashboard access
  // Dashboard requires 'read' permission on 'client-pages'
  if (auth.user) {
    const ability = buildAbilityFor(auth.user.role, 'client-pages')
    if (!ability || !ability.can('read', 'client-pages')) {
      return (
        <BlankLayout>
          <NotAuthorized />
        </BlankLayout>
      )
    }
  }

  // Return UserLayout with menu and header
  // Router shim ensures next/router imports are compatible with App Router
  const LayoutComponent = UserLayout as any

  return <LayoutComponent>{children}</LayoutComponent>
}

export default DashboardLayout

