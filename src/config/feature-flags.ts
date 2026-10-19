/**
 * Client-safe feature flags (NEXT_PUBLIC_* only).
 * Test flags stay off by default; enable per deploy via env.
 */

/** When on: API 401 does not clear session or redirect to session-expired. */
export function keepSessionOn401(): boolean {
  return process.env.NEXT_PUBLIC_KEEP_SESSION_ON_401 === "1";
}
