const PENDING_INVITE_KEY = "pending_invite_code";

export function normalizeInviteCode(value: string | null | undefined): string {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");
}

export function storePendingInviteCode(code: string): void {
  const normalized = normalizeInviteCode(code);
  if (!normalized) return;
  try {
    sessionStorage.setItem(PENDING_INVITE_KEY, normalized);
  } catch {
    // ignore storage errors
  }
}

/** Read + clear pending invite code from sessionStorage. */
export function consumePendingInviteCode(): string | null {
  try {
    const value = normalizeInviteCode(sessionStorage.getItem(PENDING_INVITE_KEY));
    sessionStorage.removeItem(PENDING_INVITE_KEY);
    return value || null;
  } catch {
    return null;
  }
}

export function peekPendingInviteCode(): string | null {
  try {
    return normalizeInviteCode(sessionStorage.getItem(PENDING_INVITE_KEY)) || null;
  } catch {
    return null;
  }
}

export function buildInviteWelcomePath(code: string): string {
  const normalized = normalizeInviteCode(code);
  const params = new URLSearchParams();
  if (normalized) params.set("code", normalized);
  const qs = params.toString();
  return qs ? `/invite/welcome?${qs}` : "/invite/welcome";
}

export function buildInviteEntryPath(code: string): string {
  const normalized = normalizeInviteCode(code);
  return normalized ? `/invite/${encodeURIComponent(normalized)}` : "/invite/welcome";
}
