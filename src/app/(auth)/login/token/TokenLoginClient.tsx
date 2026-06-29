"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { redirectToPanelLogin, sanitizeReturnUrl } from "@/config/auth-redirect";
import { exchangeSsoToken } from "@/lib/auth-exchange";
import { useAuthActions } from "@/store/hooks/use-auth";

export function TokenLoginClient() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthActions();
  const [tokenInput, setTokenInput] = useState(searchParams.get("token") ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const returnUrl = useMemo(
    () => sanitizeReturnUrl(searchParams.get("returnUrl") ?? searchParams.get("redirect")),
    [searchParams],
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await exchangeSsoToken(tokenInput);
      setAuth({
        token: data.token,
        refreshToken: data.refreshToken,
        role: data.role,
        userId: data.userId,
        fullName: data.fullName,
        mobile: data.mobile,
        email: data.email,
        inviteCode: data.inviteCode ?? data.referralCode,
        balance: data.balance,
        recentSessions: data.recentSessions ?? [],
      });
      router.replace(returnUrl);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("ssoInvalidToken"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-pad-mol">
      <p className="text-center text-sm leading-6 text-muted">{t("ssoManualDescription")}</p>

      <div className="flex flex-col gap-atom-md">
        <label className="text-sm font-medium text-foreground">{t("ssoTokenLabel")}</label>
        <textarea
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          dir="ltr"
          rows={5}
          className="w-full rounded-lg border-2 border-border bg-surface px-pad-atom-md py-pad-atom-md text-sm text-foreground placeholder:text-xs placeholder:text-muted focus:border-primary focus:outline-none"
          placeholder={t("ssoTokenPlaceholder")}
        />
        {error && <p className="text-xs text-danger" dir="ltr">{error}</p>}
      </div>

      <button
        type="submit"
        disabled={loading || !tokenInput.trim()}
        className="w-full h-control-h rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary-600 disabled:opacity-50"
      >
        {loading ? "..." : t("ssoManualSubmit")}
      </button>

      <button
        type="button"
        onClick={() => redirectToPanelLogin(returnUrl)}
        className="w-full h-control-h rounded-lg border-2 border-primary bg-primary/5 text-sm font-semibold text-primary hover:bg-primary/10"
      >
        {t("loginWithNibMarket")}
      </button>
    </form>
  );
}
