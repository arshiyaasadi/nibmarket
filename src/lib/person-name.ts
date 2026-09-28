/** Iranian / international mobile-looking values (digits only length 10–13). */
export function looksLikePhoneNumber(value: string | null | undefined): boolean {
  const raw = String(value ?? "").trim();
  if (!raw) return false;
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) return false;
  // If almost all characters are digits / phone punctuation, treat as phone.
  const nonPhoneChars = raw.replace(/[\d\s+\-()]/g, "");
  return nonPhoneChars.length === 0;
}

/**
 * Display name for network tree / UI: first + last, or fullName when it is not a phone.
 * Returns "-" when no real name is available.
 */
export function displayPersonName(parts: {
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  fallback?: string;
}): string {
  const fallback = parts.fallback ?? "-";
  const first = String(parts.firstName ?? "").trim();
  const last = String(parts.lastName ?? "").trim();
  const combined = `${first} ${last}`.trim();
  if (combined && !looksLikePhoneNumber(combined)) return combined;

  const full = String(parts.fullName ?? "").trim();
  if (full && !looksLikePhoneNumber(full)) return full;

  return fallback;
}
