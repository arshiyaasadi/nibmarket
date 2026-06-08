export type DataSourceMode = 'mock' | 'api'

export type DashboardEndpointSlug =
  | 'dashboard-rewards'
  | 'dashboard-wallet'
  | 'dashboard-invites'
  | 'dashboard-leaderboard'
  | 'dashboard-chart-monthly-rewards'
  | 'dashboard-chart-daily-growth'
  | 'dashboard-chart-monthly-rewards-alt'

export type NetworkEndpointSlug =
  | 'network-subsets'
  | 'network-subset-tree'
  | 'network-invite'
  | 'network-referrer'

export type ReportsEndpointSlug =
  | 'reports-income'
  | 'reports-subsets'
  | 'reports-wallet'
  | 'reports-capital-deposit'

export type LeaderboardEndpointSlug =
  | 'leaderboard-pool-balance'
  | 'leaderboard-current-month'
  | 'leaderboard-my-subsets'
  | 'leaderboard-last-month'
  | 'leaderboard-honors'
  | 'leaderboard-missions'

export type ManagerTwinEndpointSlug = 'manager-twin-stats' | 'manager-twin-price-chart'

export type LayoutEndpointSlug = 'layout-user' | 'layout-announcements'

export type ApiEndpointSlug =
  | DashboardEndpointSlug
  | NetworkEndpointSlug
  | ReportsEndpointSlug
  | LeaderboardEndpointSlug
  | ManagerTwinEndpointSlug
  | LayoutEndpointSlug

const ALL_DASHBOARD_SLUGS: DashboardEndpointSlug[] = [
  'dashboard-rewards',
  'dashboard-wallet',
  'dashboard-invites',
  'dashboard-leaderboard',
  'dashboard-chart-monthly-rewards',
  'dashboard-chart-daily-growth',
  'dashboard-chart-monthly-rewards-alt'
]

const ALL_NETWORK_SLUGS: NetworkEndpointSlug[] = [
  'network-subsets',
  'network-subset-tree',
  'network-invite',
  'network-referrer'
]

const ALL_REPORTS_SLUGS: ReportsEndpointSlug[] = [
  'reports-income',
  'reports-subsets',
  'reports-wallet',
  'reports-capital-deposit'
]

const ALL_LEADERBOARD_SLUGS: LeaderboardEndpointSlug[] = [
  'leaderboard-pool-balance',
  'leaderboard-current-month',
  'leaderboard-my-subsets',
  'leaderboard-last-month',
  'leaderboard-honors',
  'leaderboard-missions'
]

const ALL_MANAGER_TWIN_SLUGS: ManagerTwinEndpointSlug[] = ['manager-twin-stats', 'manager-twin-price-chart']

const ALL_LAYOUT_SLUGS: LayoutEndpointSlug[] = ['layout-user', 'layout-announcements']

const ALL_API_SLUGS: ApiEndpointSlug[] = [
  ...ALL_DASHBOARD_SLUGS,
  ...ALL_NETWORK_SLUGS,
  ...ALL_REPORTS_SLUGS,
  ...ALL_LEADERBOARD_SLUGS,
  ...ALL_MANAGER_TWIN_SLUGS,
  ...ALL_LAYOUT_SLUGS
]

function parseDataSource(): DataSourceMode {
  const raw = (process.env.NEXT_PUBLIC_DATA_SOURCE || 'mock').toLowerCase()

  return raw === 'api' ? 'api' : 'mock'
}

function parseEnabledEndpoints(): Set<ApiEndpointSlug> {
  const raw = process.env.NEXT_PUBLIC_API_ENABLED?.trim()

  if (!raw) {
    return parseDataSource() === 'api' ? new Set(ALL_API_SLUGS) : new Set()
  }

  if (raw === '*' || raw.toLowerCase() === 'all') {
    return new Set(ALL_API_SLUGS)
  }

  const slugs = raw
    .split(',')
    .map(s => s.trim())
    .filter((s): s is ApiEndpointSlug => ALL_API_SLUGS.includes(s as ApiEndpointSlug))

  return new Set(slugs)
}

const dataSourceMode = parseDataSource()
const enabledEndpoints = parseEnabledEndpoints()

export function getDataSourceMode(): DataSourceMode {
  return dataSourceMode
}

export function isApiMode(): boolean {
  return dataSourceMode === 'api'
}

export function isEndpointEnabled(slug: ApiEndpointSlug): boolean {
  return isApiMode() && enabledEndpoints.has(slug)
}

export function shouldUseApiForEndpoint(slug: ApiEndpointSlug): boolean {
  if (slug === 'network-subset-tree') {
    return isEndpointEnabled('network-subsets')
  }

  if (slug === 'leaderboard-current-month' || slug === 'leaderboard-last-month') {
    return isEndpointEnabled('dashboard-leaderboard') || isEndpointEnabled(slug)
  }

  return isEndpointEnabled(slug)
}
