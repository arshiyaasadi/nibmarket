/** GET /api/auth/getinfo — current authenticated user */
export type AuthGetInfoResponse = {
  id: number
  lastLogin: string | null
  identifier: number
  email: string | null
  mobile: string | null
  creationDate: string
  isMobileConfirmed: boolean
  firstName: string | null
  lastName: string | null
  nationalCode: string | null
  birthDate: string | null
  gender: string | null
  legalType: number
  referrer: string | null
}

/** @deprecated Use AuthGetInfoResponse */
export type CurrentUserResponse = AuthGetInfoResponse

export type LayoutAnnouncementItem = {
  id: string
  title: string
  subtitle: string
  meta: string
  publishedAt?: string
}

export type LayoutAnnouncementsResponse = {
  items: LayoutAnnouncementItem[]
}
