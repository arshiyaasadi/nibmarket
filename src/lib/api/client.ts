import { ApiException } from "@/types/api";
import { BFF_API_BASE } from "@/lib/api/endpoints";
import { normalizeAuthSessionPayload, toAuthStorePayload } from "@/lib/auth/session-payload";
import { useAuthSlice } from "@/store/slices/auth.slice";

// همه درخواست‌ها به Next.js BFF می‌رود — نه مستقیم به backend
const BFF_BASE = BFF_API_BASE;

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown };

function buildAuthHeaders(headers?: HeadersInit): HeadersInit {
  const token = useAuthSlice.getState().token;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return requestInternal<T>(path, options, true);
}

async function requestInternal<T>(
  path: string,
  options: RequestOptions = {},
  allowRefresh: boolean,
): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(`${BFF_BASE}${path}`, {
    credentials: "include",
    headers: buildAuthHeaders(headers),
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
    throw new ApiException(res.status, errorData?.message ?? `${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}

async function handleUnauthorized(path: string): Promise<void> {
  if (path.startsWith("/auth/") || typeof window === "undefined") return;

  const currentPath = window.location.pathname;
  if (currentPath.startsWith("/login")) return;

  const [{ clearSessionLocally }, { redirectToLocalLogin }] = await Promise.all([
    import("@/lib/auth/session"),
    import("@/config/auth-redirect"),
  ]);
  clearSessionLocally();
  redirectToLocalLogin(`${window.location.pathname}${window.location.search}`);
}

async function refreshSession(): Promise<boolean> {
  const res = await fetch(`${BFF_BASE}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) return false;

  const data = await res.json().catch(() => null);
  const session = data ? normalizeAuthSessionPayload(data) : null;

  if (session?.token && session.userId) {
    useAuthSlice.getState().setAuth(toAuthStorePayload(session));
  }

  return Boolean(session?.token);
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: "POST", body }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body: unknown) => request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
