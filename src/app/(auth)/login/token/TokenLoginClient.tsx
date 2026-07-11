"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { redirectToPanelLogin, resolveReturnUrl } from "@/config/auth-redirect";
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
    () => resolveReturnUrl(searchParams.get("returnUrl") ?? searchParams.get("redirect")),
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
    <form onSubmit={submit} className="gap-pad-mol flex flex-col">
      <p className="text-muted text-center text-sm leading-6">{t("ssoManualDescription")}</p>

      <div className="gap-atom-md flex flex-col">
        <label className="text-foreground text-sm font-medium">{t("ssoTokenLabel")}</label>
        <textarea
          value={tokenInput}
          onChange={(e) => setTokenInput(e.target.value)}
          dir="ltr"
          rows={5}
          className="border-border bg-surface px-pad-atom-md py-pad-atom-md text-foreground placeholder:text-muted focus:border-primary w-full rounded-lg border-2 text-sm placeholder:text-xs focus:outline-none"
          placeholder={t("ssoTokenPlaceholder")}
        />
        {error && (
          <p className="text-danger text-xs" dir="ltr">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !tokenInput.trim()}
        className="h-control-h bg-primary hover:bg-primary-600 w-full rounded-lg text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "..." : t("ssoManualSubmit")}
      </button>

      <button
        type="button"
        onClick={() => redirectToPanelLogin(returnUrl)}
        className="h-control-h border-primary bg-primary/5 text-primary hover:bg-primary/10 w-full rounded-lg border-2 text-sm font-semibold"
      >
        {t("loginWithNibMarket")}
      </button>
    </form>
  );
}
