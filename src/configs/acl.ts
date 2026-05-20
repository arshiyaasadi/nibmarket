import { AbilityBuilder, PureAbility } from '@casl/ability'

export type AppRole = 'admin' | 'manager' | 'client'

export type Subjects = 'client-pages' | 'manager-dashboard' | 'all'
export type Actions = 'manage' | 'create' | 'read' | 'update' | 'delete'

export type AppAbility = PureAbility<[Actions, Subjects]>

export type ACLObj = {
  action: Actions
  subject: Subjects
}

/**
 * Map API / SSO / JWT role values to app ACL roles.
 * Backend JWT uses numeric role (e.g. role: 1 = regular member).
 */
export function normalizeUserRole(role: string | number | undefined | null): AppRole {
  if (role === null || role === undefined) {
    return 'client'
  }

  if (typeof role === 'number') {
    if (role === 2) return 'manager'
    if (role === 3 || role === 9 || role === 99) return 'admin'

    return 'client'
  }

  const r = String(role).trim().toLowerCase()

  if (r === 'admin' || r === 'administrator' || r === '3' || r === '9' || r === '99') {
    return 'admin'
  }
  if (r === 'manager' || r === 'مدیر' || r === '2') {
    return 'manager'
  }
  if (r === 'client' || r === 'user' || r === 'member' || r === 'customer' || r === '1' || r === '0') {
    return 'client'
  }

  return 'client'
}

export function buildAbilityFor(role: string | number | undefined | null): AppAbility {
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(PureAbility)
  const normalized = normalizeUserRole(role)

  if (normalized === 'admin') {
    can('manage', 'all')
  } else if (normalized === 'manager') {
    can(['read', 'manage'], 'manager-dashboard')
    cannot(['read', 'manage'], 'client-pages')
  } else {
    can(['read'], 'client-pages')
    cannot(['read', 'manage'], 'manager-dashboard')
  }

  return build()
}

export const defaultACLObj: ACLObj = {
  action: 'manage',
  subject: 'all'
}

export default buildAbilityFor
