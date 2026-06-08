export type NetworkSubsetRow = {
  id: number
  firstName: string
  lastName: string
  fullName: string
  level: number
  joinDate: string
  /** ISO date from API `creationDate` — used for relative-time labels */
  joinedAt: string
  subMembersCount: number
  leaderboardRank: number
  directParentUserId: number
}

export type NetworkSubsetsResponse = {
  rows: NetworkSubsetRow[]
}

export type NetworkTreeNode = {
  id: string
  firstName: string
  lastName: string
  fullName: string
  level: number
  children: NetworkTreeNode[]
  /** Current logged-in user — highlighted at tree root */
  isSelf?: boolean
}

export type NetworkTreeCurrentUser = {
  id: number
  firstName: string
  lastName: string
}

export type NetworkSubsetTreeResponse = {
  roots: NetworkTreeNode[]
  truncated: boolean
}

export type NetworkFund = {
  id: string
  name: string
  symbol: string
  category: string
  investors: number
  capital: number
  percentage: number
}

export type NetworkRecentInvite = {
  id: number
  name: string
  date: string
  avatar: string
}

export type NetworkInvitePageResponse = {
  referralCode: string
  maxInvitesPerMonth: number
  remainingInvites: number
  funds: NetworkFund[]
  recentInvites: NetworkRecentInvite[]
}

export type SendNetworkInviteRequest = {
  inviteeName: string
  inviteeMobile: string
  messageTemplate?: string
  fundId?: string
}

export type SendNetworkInviteResponse = {
  success: boolean
  remainingInvites: number
  referralLink?: string
}

export type NetworkReferrerInfo = {
  firstName: string
  lastName: string
  usedDate: string
}

export type NetworkReferrerResponse = {
  hasSubsets: boolean
  referrer: NetworkReferrerInfo | null
}

export type SubmitReferrerRequest = {
  referralCode: string
}

export type SubmitReferrerResponse = {
  success: boolean
  referrer: NetworkReferrerInfo
}
