// ** React Imports
import { ReactNode, useContext } from 'react'

// ** Component Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

// ** Types
import { NavLink } from 'src/@core/layouts/types'

interface Props {
  navLink?: NavLink
  children: ReactNode
}

const CanViewNavLink = (props: Props) => {
  // ** Props
  const { children, navLink } = props

  // ** Hook
  const ability = useContext(AbilityContext)

  // If auth is explicitly false, show the link
  if (navLink && navLink.auth === false) {
    return <>{children}</>
  }

  // If no ability context, don't show the link
  if (!ability) {
    return null
  }

  // If navLink doesn't have action or subject, don't show it (unless auth is false)
  if (!navLink || !navLink.action || !navLink.subject) {
    return null
  }

  // Check if user has permission to view this link
  const canView = ability.can(navLink.action, navLink.subject)
  
  return canView ? <>{children}</> : null
}

export default CanViewNavLink
