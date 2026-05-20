import type { AppAbility } from 'src/configs/acl'
import type { Actions, Subjects } from 'src/configs/acl'
import type { NavGroup, NavLink, NavSectionTitle, VerticalNavItemsType } from 'src/@core/layouts/types'

function canViewItem(
  ability: AppAbility,
  action: string | undefined,
  subject: string | undefined
): boolean {
  if (!action || !subject) return false

  return ability.can(action as Actions, subject as Subjects)
}

function filterChildren(children: (NavGroup | NavLink)[], ability: AppAbility): (NavGroup | NavLink)[] {
  return children
    .map(child => {
      if ('children' in child && child.children) {
        const nested = filterChildren(child.children, ability)
        if (nested.length === 0) return null

        return { ...child, children: nested }
      }

      return canViewItem(ability, child.action, child.subject) ? child : null
    })
    .filter((item): item is NavGroup | NavLink => item !== null)
}

/** Hide nav entries the current CASL ability cannot read (defense in depth). */
export function filterVerticalNavByAbility(
  items: VerticalNavItemsType,
  ability: AppAbility | undefined
): VerticalNavItemsType {
  if (!ability) return items

  return items
    .map(item => {
      if ('sectionTitle' in item) {
        return canViewItem(ability, item.action, item.subject) ? item : null
      }

      if ('children' in item && item.children) {
        const children = filterChildren(item.children, ability)
        if (children.length === 0) return null

        const groupVisible =
          canViewItem(ability, item.action, item.subject) ||
          children.some(child => canViewItem(ability, child.action, child.subject))

        return groupVisible ? { ...item, children } : null
      }

      return canViewItem(ability, item.action, item.subject) ? item : null
    })
    .filter((item): item is NavLink | NavGroup | NavSectionTitle => item !== null)
}
