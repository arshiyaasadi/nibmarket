"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { redirectToPanelLogin, resolveReturnUrl } from "@/config/auth-redirect";
import { ROUTES } from "@/config/routes";
import { exchangeSsoToken } from "@/lib/auth-exchange";
import { useAuthActions } from "@/store/hooks/use-auth";

export function SsoCallbackClient() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthActions();
  const [error, setError] = useState<string | null>(null);

  const returnUrl = useMemo(
    () => resolveReturnUrl(searchParams.get("returnUrl") ?? searchParams.get("redirect")),
    [searchParams],
  );

  useEffect(() => {
    let cancelled = false;
    const queryToken = searchParams.get("token") ?? searchParams.get("sso_token");

    exchangeSsoToken(queryToken ?? undefined)
      .then((data) => {
        if (cancelled) return;
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
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : t("ssoError"));
      });

    return () => {
      cancelled = true;
    };
  }, [returnUrl, router, searchParams, setAuth, t]);

  return (
    <div className="gap-pad-mol flex flex-col items-center text-center">
      <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
        {error ? (
          <span className="text-danger text-xl font-bold">!</span>
        ) : (
          <div className="border-primary size-6 animate-spin rounded-full border-2 border-t-transparent" />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-lg font-bold">{t("ssoCallbackTitle")}</h1>
        <p className="text-muted text-sm leading-6">
          {error ? t("ssoMissingToken") : t("ssoCallbackLoading")}
        </p>
        {error && (
          <p className="text-danger text-xs" dir="ltr">
            {error}
          </p>
        )}
      </div>

      {error && (
        <div className="flex w-full flex-col gap-2">
          <button
            type="button"
            onClick={() => redirectToPanelLogin(returnUrl)}
            className="bg-primary py-atom-md hover:bg-primary-600 w-full rounded-lg text-sm font-semibold text-white"
          >
            {t("ssoLoginAgain")}
          </button>
          <Link
            href={`${ROUTES.LOGIN}/token?returnUrl=${encodeURIComponent(returnUrl)}`}
            className="border-border py-atom-md text-primary hover:bg-primary/5 w-full rounded-lg border text-sm font-semibold"
          >
            {t("ssoManualFallback")}
          </Link>
        </div>
      )}
    </div>
  );
}
