/** Nibmarket panel — SSO login and referral invite links. */
export const PANEL_BASE_URL =
  process.env.NEXT_PUBLIC_PANEL_BASE_URL?.trim() || 'https://panel.nibmarket.com'

export const PANEL_CALLBACK_SERVICE = 'mlm'

export const INVITE_LIMITS = {
  perMonth: 20,
  perYear: 100
} as const

export function buildPanelLoginUrl(referralCode?: string): string {
  const url = new URL('/login/', PANEL_BASE_URL)
  url.searchParams.set('callback_service', PANEL_CALLBACK_SERVICE)
  if (referralCode?.trim()) {
    url.searchParams.set('referral_code', referralCode.trim())
  }

  return url.toString()
}

/** Public invite link shared with friends (panel registration with referral code). */
export function buildPanelReferralInviteUrl(referralCode: string): string {
  return buildPanelLoginUrl(referralCode)
}
