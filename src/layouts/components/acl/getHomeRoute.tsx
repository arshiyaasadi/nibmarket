import { normalizeUserRole } from 'src/configs/acl'

/**
 * Home URL based on user role
 */
const getHomeRoute = (role: string) => {
  const normalized = normalizeUserRole(role)
  if (normalized === 'manager') return '/manager/dashboard'
  if (normalized === 'admin') return '/dashboard'

  return '/dashboard'
}

export default getHomeRoute
