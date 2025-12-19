/**
 * Utility functions for invite/referral system
 */

export interface ReferrerInfo {
  code: string
  referrerName: string
  referrerAvatar?: string
  isValid: boolean
}

/**
 * Gets referrer information from invite code
 * Currently uses mock data - replace with API call in production
 * 
 * @param code - Invite/referral code
 * @returns Promise resolving to referrer info or null if invalid
 */
export const getReferrerInfo = async (code: string): Promise<ReferrerInfo | null> => {
  if (!code || code.trim().length === 0) {
    return null
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300))

  // Mock data - in production, replace with actual API call:
  // const response = await axios.get(`/api/invite/${code}`)
  // return response.data

  // Mock mapping of codes to referrer info
  const mockReferrers: Record<string, ReferrerInfo> = {
    'INVITE2024': {
      code: 'INVITE2024',
      referrerName: 'علی احمدی',
      referrerAvatar: '/images/avatars/1.png',
      isValid: true
    },
    'REF2024': {
      code: 'REF2024',
      referrerName: 'سارا محمدی',
      referrerAvatar: '/images/avatars/2.png',
      isValid: true
    }
  }

  const referrerInfo = mockReferrers[code.toUpperCase()]

  if (referrerInfo) {
    return referrerInfo
  }

  // Return null for invalid codes
  return null
}

/**
 * Stores referral code in localStorage for later use during registration/login
 * 
 * @param code - Referral code to store
 */
export const storeReferralCode = (code: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('referralCode', code)
  }
}

/**
 * Gets stored referral code from localStorage
 * 
 * @returns Stored referral code or null
 */
export const getStoredReferralCode = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('referralCode')
  }
  return null
}

/**
 * Clears stored referral code from localStorage
 */
export const clearStoredReferralCode = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('referralCode')
  }
}

