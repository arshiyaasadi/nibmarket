"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api/client";
import { useAuthActions } from "@/store/hooks/use-auth";
import { applyAuthSession } from "@/lib/auth/apply-session";

export default function AdminLoginPage() {
  const router = useRouter();
  const { setAuth, setWallet } = useAuthActions();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await apiClient.post("/auth/login", { email, password });
      await applyAuthSession(data, { setAuth, setWallet });
      router.push("/admin");
      router.refresh();
    } catch {
      setError("ایمیل یا رمز عبور اشتباه است");
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
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-foreground mb-1.5 block text-xs font-medium">ایمیل</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            dir="ltr"
            className="border-border bg-background text-foreground focus:border-primary w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
            placeholder="superadmin@nibclub.ir"
          />
        </div>
        <div>
          <label className="text-foreground mb-1.5 block text-xs font-medium">رمز عبور</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            dir="ltr"
            className="border-border bg-background text-foreground focus:border-primary w-full rounded-xl border px-4 py-2.5 text-sm outline-none"
          />
        </div>
        {error && <p className="text-xs text-red-500">{error}</p>}
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
