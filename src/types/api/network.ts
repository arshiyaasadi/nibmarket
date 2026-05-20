export type NetworkSubsetRow = {
  id: number
  fullName: string
  level: number
  joinDate: string
  subMembersCount: number
  leaderboardRank: number
  avatar: string
}

export type NetworkSubsetsResponse = {
  rows: NetworkSubsetRow[]
}

export type NetworkTreeNode = {
  id: string
  name: string
  family: string
  balance: number | string
  networks: NetworkTreeNode[]
}

export type NetworkSubsetTreeResponse = {
  root: NetworkTreeNode
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
