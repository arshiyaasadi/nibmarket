"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { LEGACY_LOCAL_LOGIN_ENABLED } from "@/config/auth-flow";
import { redirectToPanelLogin, sanitizeReturnUrl } from "@/config/auth-redirect";
import { LoginForm } from "./LoginForm";

/**
 * Default: bounce straight to NIB Market SSO.
 * Legacy OTP/password form stays available only when LEGACY_LOCAL_LOGIN_ENABLED
 * and `?legacy=1` (kept for rollback — not deleted).
 */
export function LoginEntryClient() {
  const searchParams = useSearchParams();
  const allowLegacy =
    LEGACY_LOCAL_LOGIN_ENABLED && searchParams.get("legacy") === "1";

  useEffect(() => {
    if (allowLegacy) return;
    const returnUrl = sanitizeReturnUrl(
      searchParams.get("returnUrl") ?? searchParams.get("redirect"),
    );
    redirectToPanelLogin(returnUrl);
  }, [allowLegacy, searchParams]);

  if (allowLegacy) {
    return <LoginForm />;
  }

  return (
    <div className="gap-pad-mol flex flex-col items-center text-center">
      <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
        <div className="border-primary size-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
      <p className="text-muted text-sm leading-6">در حال انتقال به سامانه نیب‌مارکت…</p>
    </div>
  );
}
