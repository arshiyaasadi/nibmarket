import type { LoginActivity, UserRole, WalletSummary } from "@/types/mlm";

export interface AuthSessionPayload {
  token: string;
  refreshToken: string;
  role: UserRole;
  userId: string;
  fullName: string;
  mobile?: string;
  email?: string;
  inviteCode?: string;
  referralCode?: string;
  balance?: number;
  recentSessions?: LoginActivity[];
  wallet?: WalletSummary | null;
}

function parseRole(value: unknown): UserRole {
  if (value === "manager" || value === "admin" || value === "client") return value;
  return "client";
}

function walletFromBalance(balance: number | undefined): WalletSummary | null {
  if (balance == null || Number.isNaN(balance)) return null;
  return {
    totalTokens: balance,
    availableTokens: balance,
    frozenTokens: 0,
    pendingTokens: 0,
  };
}

export function normalizeAuthSessionPayload(raw: unknown): AuthSessionPayload {
  const data = (raw ?? {}) as Record<string, unknown>;
  const balance = typeof data.balance === "number" ? data.balance : undefined;
  const inviteCode = String(data.inviteCode ?? data.referralCode ?? "");
  const wallet =
    data.wallet && typeof data.wallet === "object"
      ? (data.wallet as WalletSummary)
      : walletFromBalance(balance);

  return {
    token: String(data.token ?? ""),
    refreshToken: String(data.refreshToken ?? ""),
    role: parseRole(data.role),
    userId: String(data.userId ?? data.id ?? ""),
    fullName: String(data.fullName ?? data.name ?? ""),
    mobile: data.mobile ? String(data.mobile) : undefined,
    email: data.email ? String(data.email) : undefined,
    inviteCode: inviteCode || undefined,
    referralCode: inviteCode || undefined,
    balance,
    recentSessions: Array.isArray(data.recentSessions)
      ? (data.recentSessions as LoginActivity[])
      : [],
    wallet,
  };
}

export function toAuthStorePayload(session: AuthSessionPayload) {
  return {
    token: session.token,
    refreshToken: session.refreshToken,
    role: session.role,
    userId: session.userId,
    fullName: session.fullName || session.mobile || "",
    mobile: session.mobile,
    email: session.email,
    inviteCode: session.inviteCode ?? session.referralCode,
    balance: session.balance ?? session.wallet?.totalTokens ?? null,
    wallet: session.wallet ?? walletFromBalance(session.balance),
    recentSessions: session.recentSessions ?? [],
  };
}
