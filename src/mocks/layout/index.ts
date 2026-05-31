import type { AuthGetInfoResponse, LayoutAnnouncementsResponse } from 'src/types/api/layout'

export const mockLayoutUser: AuthGetInfoResponse = {
  id: 0,
  lastLogin: null,
  identifier: 0,
  email: null,
  mobile: null,
  creationDate: '',
  isMobileConfirmed: false,
  firstName: null,
  lastName: null,
  nationalCode: null,
  birthDate: null,
  gender: null,
  legalType: 0,
  referrer: null
}

export const mockLayoutAnnouncements: LayoutAnnouncementsResponse = {
  items: []
}
