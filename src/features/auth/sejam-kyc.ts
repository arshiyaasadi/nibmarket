/** UI modal id for Sejam KYC (use with `useUiSlice.openModal`). */
export const SEJAM_KYC_MODAL_ID = "sejam-kyc";

/** Synthetic inbox item id — client-only overlay when hasSejamIdentity is false. */
export const SEJAM_KYC_NOTIFICATION_ID = "local-sejam-kyc-required";

export function needsSejamKyc(hasSejamIdentity: boolean | undefined): boolean {
  return hasSejamIdentity !== true;
}
