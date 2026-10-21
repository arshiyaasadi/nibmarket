"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { redirectToPanelLogin, resolveReturnUrl } from "@/config/auth-redirect";
import { completeSsoSession } from "@/lib/auth-exchange";
import { applyAuthSession } from "@/lib/auth/apply-session";
import {
  buildInviteWelcomePath,
  consumePendingInvite,
  normalizeFundId,
  normalizeInviteCode,
  peekPendingInvite,
} from "@/lib/invite/pending-invite";
import { useAuthActions } from "@/store/hooks/use-auth";
import { useAuthSlice } from "@/store/slices/auth.slice";

export function SsoCallbackClient() {
  const t = useTranslations("auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth, setWallet } = useAuthActions();
  const started = useRef(false);

  const inviteFromQuery = useMemo(
    () =>
      normalizeInviteCode(
        searchParams.get("inviteCode") ?? searchParams.get("ref") ?? searchParams.get("code"),
      ),
    [searchParams],
  );

  const fundFromQuery = useMemo(
    () => normalizeFundId(searchParams.get("fundId") ?? searchParams.get("fund")),
    [searchParams],
  );

  const returnUrl = useMemo(() => {
    const pending = peekPendingInvite();
    const inviteCode = inviteFromQuery || pending?.code || "";
    const fundId = fundFromQuery || pending?.fundId;
    if (inviteCode) return buildInviteWelcomePath(inviteCode, fundId);
    return resolveReturnUrl(searchParams.get("returnUrl") ?? searchParams.get("redirect"));
  }, [fundFromQuery, inviteFromQuery, searchParams]);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let cancelled = false;

    async function handleCallback() {
      if (!inviteFromQuery) consumePendingInvite();

      const existingToken = useAuthSlice.getState().token;
      if (existingToken) {
        router.replace(returnUrl);
        return;
      }

      try {
        const data = await completeSsoSession();
        if (cancelled) return;
        await applyAuthSession(data, { setAuth, setWallet });
        router.replace(returnUrl);
        router.refresh();
      } catch {
        if (cancelled) return;
        // No NIB cookies yet (direct hit) or incomplete callback → start panel SSO (legacy).
        redirectToPanelLogin(returnUrl);
      }
    }

    void handleCallback();

    return () => {
      cancelled = true;
    };
  }, [inviteFromQuery, returnUrl, router, setAuth, setWallet]);

  return (
    <div className="gap-pad-mol flex flex-col items-center text-center">
      <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
        <div className="border-primary size-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-lg font-bold">{t("ssoCallbackTitle")}</h1>
        <p className="text-muted text-sm leading-6">{t("ssoCallbackLoading")}</p>
      </div>
    </div>
  );
}
