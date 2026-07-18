"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { BFF_API_BASE, ENDPOINTS } from "@/lib/api/endpoints";
import { clearSessionLocally } from "@/lib/auth/session";
import { useAuthActions } from "@/store/hooks/use-auth";
import { applyAuthSession } from "@/lib/auth/apply-session";
import { DEV_ADMIN_LOGIN } from "@/config/mock-hints";
import type { AdminLoginRequest, AdminLoginResponse } from "@/types/admin";

const INVALID_CREDENTIALS = "نام کاربری یا رمز عبور اشتباه است";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth, setWallet } = useAuthActions();
  const [username, setUsername] = useState<string>(DEV_ADMIN_LOGIN.username);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    clearSessionLocally();
    void fetch(`${BFF_API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
  }, []);

  function clearError() {
    if (error) setError("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      setError("نام کاربری و رمز عبور را وارد کنید");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await apiClient.post<AdminLoginResponse>(ENDPOINTS.ADMIN.AUTH.LOGIN, {
        username: trimmedUsername,
        password,
      } satisfies AdminLoginRequest);
      await applyAuthSession(data, { setAuth, setWallet });
      router.push("/admin");
      router.refresh();
    } catch {
      setError(INVALID_CREDENTIALS);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border-border bg-surface w-full max-w-sm rounded-2xl border p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-foreground text-xl font-bold">ورود به پنل مدیریت</h1>
        <p className="text-muted mt-1 text-xs">NIB Club — Admin</p>
      </div>

      <div className="border-primary/20 bg-primary/5 mb-5 rounded-xl border px-4 py-3 text-xs leading-6">
        <p className="text-foreground font-medium">ورود موقت (توسعه)</p>
        <p className="text-muted mt-1">
          نام کاربری: <span dir="ltr">{DEV_ADMIN_LOGIN.username}</span>
        </p>
        <p className="text-muted">
          رمز عبور: <span dir="ltr">{DEV_ADMIN_LOGIN.password}</span>
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-600"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="admin-username"
            className="text-foreground mb-1.5 block text-xs font-medium"
          >
            نام کاربری
          </label>
          <input
            id="admin-username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              clearError();
            }}
            required
            autoComplete="username"
            dir="ltr"
            aria-invalid={Boolean(error)}
            className="border-border bg-background text-foreground focus:border-primary w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
            placeholder="admin"
          />
        </div>

        <div>
          <label
            htmlFor="admin-password"
            className="text-foreground mb-1.5 block text-xs font-medium"
          >
            رمز عبور
          </label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError();
            }}
            required
            autoComplete="current-password"
            dir="ltr"
            aria-invalid={Boolean(error)}
            className="border-border bg-background text-foreground focus:border-primary w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-primary rounded-xl px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "در حال ورود..." : "ورود"}
        </button>
      </form>
    </div>
  );
}
