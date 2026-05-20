import type { AppRole } from 'src/configs/acl'
import type { NavGroup, NavLink, NavSectionTitle, VerticalNavItemsType } from 'src/@core/layouts/types'

export function isManagerNavPath(path: string | undefined): boolean {
  return Boolean(path?.startsWith('/manager'))
}

function isManagerNavEntry(item: NavLink | NavGroup | NavSectionTitle): boolean {
  if ('path' in item && isManagerNavPath(item.path)) {
    return true
  }
  if ('children' in item && item.children) {
    return item.children.some(child => isManagerNavEntry(child))
  }

  return false
}

/** Strip manager routes unless role may access the manager panel. */
export function filterNavItemsByAppRole(items: VerticalNavItemsType, appRole: AppRole): VerticalNavItemsType {
  if (appRole === 'admin' || appRole === 'manager') {
    return items
  }

  return items
    .map(item => {
      if (isManagerNavEntry(item)) {
        return null
      }
      if ('children' in item && item.children) {
        const children = item.children.filter(child => !isManagerNavEntry(child))
        if (children.length === 0) return null

        return { ...item, children }
      }

      return item
    })
    .filter((item): item is NavLink | NavGroup | NavSectionTitle => item !== null)
}
