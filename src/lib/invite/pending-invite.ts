import { getPublicClubOrigin } from "@/config/public-origin";
import { inviteFunds } from "@/resources/data/funds";

const PENDING_INVITE_KEY = "pending_invite_payload";

export type PendingInvite = {
  code: string;
  fundId?: string;
};

export function normalizeInviteCode(value: string | null | undefined): string {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");
}

export function normalizeFundId(value: string | null | undefined): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "");
}

export function findInviteFund(fundId: string | null | undefined) {
  const id = normalizeFundId(fundId);
  if (!id) return null;
  return inviteFunds.find((fund) => fund.id === id) ?? null;
}

export function storePendingInvite(payload: PendingInvite): void {
  const code = normalizeInviteCode(payload.code);
  if (!code) return;
  const fundId = normalizeFundId(payload.fundId) || undefined;
  try {
    sessionStorage.setItem(PENDING_INVITE_KEY, JSON.stringify({ code, fundId }));
  } catch {
    // ignore storage errors
  }
}

/** @deprecated prefer storePendingInvite */
export function storePendingInviteCode(code: string, fundId?: string): void {
  storePendingInvite({ code, fundId });
}

function readPendingInviteRaw(): PendingInvite | null {
  try {
    const raw = sessionStorage.getItem(PENDING_INVITE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { code?: unknown; fundId?: unknown };
    const code = normalizeInviteCode(String(parsed.code ?? ""));
    if (!code) return null;
    const fundId = normalizeFundId(String(parsed.fundId ?? "")) || undefined;
    return { code, fundId };
  } catch {
    return null;
  }
}

/** Read + clear pending invite from sessionStorage. */
export function consumePendingInvite(): PendingInvite | null {
  const value = readPendingInviteRaw();
  try {
    sessionStorage.removeItem(PENDING_INVITE_KEY);
  } catch {
    // ignore
  }
  return value;
}

/** @deprecated prefer consumePendingInvite */
export function consumePendingInviteCode(): string | null {
  return consumePendingInvite()?.code ?? null;
}

export function peekPendingInvite(): PendingInvite | null {
  return readPendingInviteRaw();
}

export function peekPendingInviteCode(): string | null {
  return peekPendingInvite()?.code ?? null;
}

export function buildInviteWelcomePath(code: string, fundId?: string | null): string {
  const normalized = normalizeInviteCode(code);
  const params = new URLSearchParams();
  if (normalized) params.set("code", normalized);
  const fund = normalizeFundId(fundId);
  if (fund) params.set("fundId", fund);
  const qs = params.toString();
  return qs ? `/invite/welcome?${qs}` : "/invite/welcome";
}

export function buildInviteEntryPath(code: string, fundId?: string | null): string {
  const normalized = normalizeInviteCode(code);
  if (!normalized) return "/invite/welcome";
  const fund = normalizeFundId(fundId);
  const base = `/invite/${encodeURIComponent(normalized)}`;
  return fund ? `${base}/${encodeURIComponent(fund)}` : base;
}

/** Absolute invite URL for SMS / clipboard (public club origin). */
export function buildPublicInviteUrl(code: string, fundId?: string | null): string {
  const path = buildInviteEntryPath(code, fundId);
  const origin = getPublicClubOrigin();
  if (!origin) return path;
  return `${origin}${path}`;
}
