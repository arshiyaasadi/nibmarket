const STORAGE_PREFIX = "nib_referrer_registered";

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}:${userId}`;
}

/** Persists that the user submitted an upline referrer code (temporary until backend API exists). */
export function markReferrerRegistered(userId: string): void {
  try {
    localStorage.setItem(storageKey(userId), "1");
  } catch {
    // ignore storage errors (private mode, etc.)
  }
}

/**
 * TODO(backend-referrer-status): Replace with GET /network/referrer-status (or profile field)
 * once backend exposes whether the user has registered an upline referrer code.
 */
export function hasReferrerRegisteredLocally(userId: string | null | undefined): boolean {
  if (!userId) return false;
  try {
    return localStorage.getItem(storageKey(userId)) === "1";
  } catch {
    return false;
  }
}
