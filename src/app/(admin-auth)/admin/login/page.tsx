"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { useAuthActions } from "@/store/hooks/use-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiClient.post<{ token: string; refreshToken: string; role: string; id: string; fullName: string }>("/auth/login", { email, password });
      setAuth({ token: data.token, refreshToken: data.refreshToken, role: data.role as "admin", userId: data.id, fullName: data.fullName });
      router.push("/admin");
    } catch {
      setError("ایمیل یا رمز عبور اشتباه است");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold text-foreground">ورود به پنل مدیریت</h1>
        <p className="mt-1 text-xs text-muted">NIB Club — Admin</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground">ایمیل</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            dir="ltr"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
            placeholder="superadmin@nibclub.ir"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-foreground">رمز عبور</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            dir="ltr"
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? "در حال ورود..." : "ورود"}
        </button>
      </form>
    </div>
  );
}
