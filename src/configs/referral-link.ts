import { buildPanelSsoLoginUrl, PANEL_BASE_URL } from 'src/configs/sso'

/** Nib panel — SSO login and referral invite links. */
export { PANEL_BASE_URL }

export const INVITE_LIMITS = {
  perMonth: 20,
  perYear: 100
} as const

export function buildPanelLoginUrl(referralCode?: string): string {
  return buildPanelSsoLoginUrl(referralCode)
}

/** Public invite link shared with friends (panel registration with referral code). */
export function buildPanelReferralInviteUrl(referralCode: string): string {
  return buildPanelSsoLoginUrl(referralCode)
}
