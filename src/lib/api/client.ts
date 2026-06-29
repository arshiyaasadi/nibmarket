import { ApiException } from "@/types/api";
import type { LoginActivity, UserRole } from "@/types/mlm";
import { BFF_API_BASE } from "@/lib/api/endpoints";

// همه درخواست‌ها به Next.js BFF می‌رود — نه مستقیم به backend
const BFF_BASE = BFF_API_BASE;

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return requestInternal<T>(path, options, true);
}

async function requestInternal<T>(
  path: string,
  options: RequestOptions = {},
  allowRefresh: boolean,
): Promise<T> {
  const { body, ...rest } = options;

  const res = await fetch(`${BFF_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...rest.headers,
    },
    ...rest,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (res.status === 401 && allowRefresh && path !== "/auth/refresh") {
    const refreshed = await refreshSession();
    if (refreshed) {
      return requestInternal<T>(path, options, false);
    }
    await handleUnauthorized(path);
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new ApiException(
      res.status,
      errorData?.message ?? `${res.status} ${res.statusText}`,
    );
  }

  return res.json() as Promise<T>;
}

async function handleUnauthorized(path: string): Promise<void> {
  if (path.startsWith("/auth/") || typeof window === "undefined") return;
  const [{ clearSessionLocally }, { redirectToPanelLogin }] = await Promise.all([
    import("@/lib/auth/session"),
    import("@/config/auth-redirect"),
  ]);
  clearSessionLocally();
  redirectToPanelLogin(`${window.location.pathname}${window.location.search}`);
}

async function refreshSession(): Promise<boolean> {
  const res = await fetch(`${BFF_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) return false;

  const data = await res.json().catch(() => null) as {
    token?: string;
    refreshToken?: string;
    role?: string;
    userId?: string;
    fullName?: string;
    mobile?: string;
    email?: string;
    inviteCode?: string;
    referralCode?: string;
    balance?: number;
    recentSessions?: unknown[];
  } | null;

  if (data?.token && data.role && data.userId && data.fullName) {
    const { useAuthSlice } = await import("@/store/slices/auth.slice");
    const current = useAuthSlice.getState();
    useAuthSlice.getState().setAuth({
      token: data.token,
      refreshToken: data.refreshToken ?? current.refreshToken ?? "",
      role: data.role as UserRole,
      userId: data.userId,
      fullName: data.fullName,
      mobile: data.mobile ?? undefined,
      email: data.email ?? undefined,
      inviteCode: data.inviteCode ?? data.referralCode ?? undefined,
      balance: data.balance ?? undefined,
      recentSessions: (data.recentSessions as LoginActivity[]) ?? undefined,
    });
  }

  return true;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
