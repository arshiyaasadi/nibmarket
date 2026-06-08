'use client'

// ** React Imports
import { ReactNode, ReactElement, useEffect } from 'react'

// ** Next Import
import { usePathname, useRouter } from 'next/navigation'

// ** Hooks Import
import { useAuth } from 'src/hooks/useAuth'
import { hasSessionAccessToken } from 'src/lib/auth-exchange'

interface AuthGuardProps {
  children: ReactNode
  fallback: ReactElement | null
}

const AuthGuard = (props: AuthGuardProps) => {
  const { children, fallback } = props
  const auth = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (auth.loading) return

    if (auth.user === null && !window.localStorage.getItem('userData') && !hasSessionAccessToken()) {
      router.replace(`/login/token?returnUrl=${encodeURIComponent(pathname)}`)
    }
  }, [auth.loading, auth.user, pathname, router])

  if (auth.loading || auth.user === null) {
    return fallback
  }

  return <>{children}</>
}

export default AuthGuard
