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
import { buildAbilityFor, canAccessPage } from 'src/configs/acl'

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
  /**
   * Optional per-page CASL rule (Pages Router `Component.acl`).
   * Role rules come from buildAbilityFor(auth.user.role) only.
   * When omitted, any authenticated user may view the page.
   */
  pageAcl?: ACLObj
}

const AclGuard = (props: AclGuardProps) => {
  const { pageAcl, children, guestGuard = false, authGuard = true } = props

  const auth = useAuth()
  const router = useRouter()

  const ability: AppAbility | undefined = auth.user ? buildAbilityFor(auth.user.role) : undefined

  useEffect(() => {
    if (auth.user && auth.user.role && !guestGuard && router.route === '/') {
      const homeRoute = getHomeRoute(auth.user.role)
      router.replace(homeRoute)
    }
  }, [auth.user, guestGuard, router])

  const wrapWithAbility = (content: ReactNode) =>
    ability ? <AbilityContext.Provider value={ability}>{content}</AbilityContext.Provider> : content

  if (guestGuard || router.route === '/404' || router.route === '/500' || !authGuard) {
    if (auth.user && ability) {
      return wrapWithAbility(children)
    }

    return <>{children}</>
  }

  if (auth.user && ability) {
    const allowed = pageAcl ? canAccessPage(ability, pageAcl) : true

    if (!allowed) {
      return (
        <BlankLayout>
          <NotAuthorized />
        </BlankLayout>
      )
    }

    if (router.route === '/') {
      return <Spinner />
    }

    return wrapWithAbility(children)
  }

  if (auth.loading) {
    return <Spinner />
  }

  return <>{children}</>
}

export default AclGuard
