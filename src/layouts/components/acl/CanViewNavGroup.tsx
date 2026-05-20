// ** React Imports
import { ReactNode, useContext } from 'react'

// ** Component Imports
import { AbilityContext } from 'src/layouts/components/acl/Can'

// ** Config
import { normalizeUserRole } from 'src/configs/acl'

// ** Hooks
import { useAuth } from 'src/hooks/useAuth'

// ** Utils
import { isManagerNavPath } from 'src/navigation/vertical/navAccess'

// ** Types
import { NavGroup, NavLink } from 'src/@core/layouts/types'

interface Props {
  navGroup?: NavGroup
  children: ReactNode
}

const CanViewNavGroup = (props: Props) => {
  // ** Props
  const { children, navGroup } = props

  // ** Hooks
  const ability = useContext(AbilityContext)
  const { user } = useAuth()
  const appRole = normalizeUserRole(user?.role)

  const groupHasManagerPath = (item: NavGroup | NavLink): boolean => {
    if ('path' in item && isManagerNavPath(item.path)) {
      return true
    }
    if ('children' in item && item.children) {
      return item.children.some(child => groupHasManagerPath(child))
    }

    return false
  }

  if (appRole === 'client' && navGroup && groupHasManagerPath(navGroup)) {
    return null
  }

  // If auth is explicitly false, show the group
  if (navGroup && navGroup.auth === false) {
    return <>{children}</>
  }

  // If no ability context, don't show the group
  if (!ability) {
    return null
  }

  // If no navGroup, don't show
  if (!navGroup) {
    return null
  }

  const checkForVisibleChild = (arr: NavLink[] | NavGroup[]): boolean => {
    return arr.some((i: NavGroup | NavLink) => {
      if ('children' in i && i.children) {
        return checkForVisibleChild(i.children)
      } else {
        // Check if item has action and subject before checking permission
        if (i.action && i.subject) {
          return ability.can(i.action, i.subject)
        }
        return false
      }
    })
  }

  const canViewMenuGroup = (item: NavGroup) => {
    // First check if there are any visible children
    const hasAnyVisibleChild = item.children && checkForVisibleChild(item.children)

    // If item doesn't have action/subject, only show if it has visible children
    if (!(item.action && item.subject)) {
      return hasAnyVisibleChild || false
    }

    // If item has action/subject, check permission
    const canAccessItem = ability.can(item.action, item.subject)
    
    // Show group if user can access the item AND it has visible children
    return canAccessItem && hasAnyVisibleChild
  }

  return canViewMenuGroup(navGroup) ? <>{children}</> : null
}

export default CanViewNavGroup
