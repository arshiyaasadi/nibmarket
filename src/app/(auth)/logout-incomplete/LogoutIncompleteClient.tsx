"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { performLogout } from "@/lib/auth/session";

export function LogoutIncompleteClient() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();
  const [retrying, setRetrying] = useState(false);

  const reason =
    searchParams.get("reason")?.trim() || t("logoutIncompleteReasonFallback");

  async function handleRetry() {
    if (retrying) return;
    setRetrying(true);
    try {
      await performLogout();
    } finally {
      setRetrying(false);
    }
  }

  return (
    <div className="gap-pad-mol flex flex-col items-center text-center">
      <div className="bg-warning/15 text-warning flex size-14 items-center justify-center rounded-full text-2xl">
        !
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-lg font-bold">{t("logoutIncompleteTitle")}</h1>
        <p className="text-muted text-sm leading-6">{t("logoutIncompleteDescription")}</p>
      </div>

      <div className="bg-surface-2 w-full rounded-xl p-4 text-right">
        <p className="text-muted mb-1 text-xs">{t("logoutIncompleteReasonLabel")}</p>
        <p className="text-foreground text-sm leading-6 break-words">{reason}</p>
      </div>

      <button
        type="button"
        disabled={retrying}
        onClick={() => void handleRetry()}
        className="h-control-h bg-primary hover:bg-primary-600 w-full rounded-lg text-sm font-semibold text-white disabled:opacity-60"
      >
        {retrying ? t("logoutIncompleteRetrying") : t("logoutIncompleteRetry")}
      </button>

      <a href={ROUTES.HOME} className="text-muted hover:text-foreground text-xs hover:underline">
        {t("logoutIncompleteBackHome")}
      </a>
    </div>
  );
}
