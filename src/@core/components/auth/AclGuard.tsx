'use client'

// ** React Imports
import { ReactNode, useEffect } from 'react'

// ** Next Import
import { useRouter } from 'src/lib/next-router-shim'

// ** Types
import type { ACLObj, AppAbility } from 'src/configs/acl'

// ** Context Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

// ** Config Import
import { buildAbilityFor } from 'src/configs/acl'

// ** Component Import
import NotAuthorized from 'src/template-pages/401'
import Spinner from 'src/@core/components/spinner'
import BlankLayout from 'src/@core/layouts/BlankLayout'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'

// ** Util Import
import getHomeRoute from 'src/layouts/components/acl/getHomeRoute'

interface AclGuardProps {
  children: ReactNode
  authGuard?: boolean
  guestGuard?: boolean
  aclAbilities: ACLObj
}

const AclGuard = (props: AclGuardProps) => {
  // ** Props
  const { aclAbilities, children, guestGuard = false, authGuard = true } = props

  // ** Hooks
  const auth = useAuth()
  const router = useRouter()

  // ** Build ability for logged in user
  let ability: AppAbility
  if (auth.user) {
    ability = buildAbilityFor(auth.user.role, aclAbilities.subject)
  }

  useEffect(() => {
    if (auth.user && auth.user.role && !guestGuard && router.route === '/') {
      const homeRoute = getHomeRoute(auth.user.role)
      router.replace(homeRoute)
    }
  }, [auth.user, guestGuard, router])

  // If guest guard or no guard is true or any error page
  if (guestGuard || router.route === '/404' || router.route === '/500' || !authGuard) {
    // If user is logged in and his ability is built, provide ability context
    if (auth.user && ability) {
      return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
    } else {
      // If user is not logged in (render pages like login, register etc..)
      return <>{children}</>
    }
  }

  // For authenticated users, always provide ability context for navigation
  if (auth.user && ability) {
    // Check page-level access
    if (ability.can(aclAbilities.action, aclAbilities.subject)) {
      if (router.route === '/') {
        return <Spinner />
      }
      return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>
    } else {
      // Render Not Authorized component if the current user has limited access to this page
      return (
        <BlankLayout>
          <NotAuthorized />
        </BlankLayout>
      )
    }
  }

  // If no user and not guest, show spinner
  if (auth.loading) {
    return <Spinner />
  }

  // Render children without ability context (for unauthenticated pages)
  return <>{children}</>
}

export default AclGuard
