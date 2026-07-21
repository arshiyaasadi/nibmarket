/**
 * When enabled, /admin pages and /admin/* BFF routes skip local auth checks.
 * API requests still forward session cookies unless stripAuth is used for open-access dev.
 * Set ADMIN_OPEN_ACCESS=1 only for local UI development without backend admin auth.
 */
export function isAdminOpenAccess(): boolean {
  return process.env.ADMIN_OPEN_ACCESS === "1";
}
