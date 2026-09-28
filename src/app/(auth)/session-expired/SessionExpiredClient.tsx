"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { redirectToPanelLogin, sanitizeReturnUrl } from "@/config/auth-redirect";
import { ROUTES } from "@/config/routes";

export function SessionExpiredClient() {
  const t = useTranslations("auth");
  const searchParams = useSearchParams();

  const returnUrl = useMemo(
    () =>
      sanitizeReturnUrl(
        searchParams.get("returnUrl") ?? searchParams.get("redirect") ?? ROUTES.DASHBOARD,
      ),
    [searchParams],
  );

  return (
    <div className="gap-pad-mol flex flex-col items-center text-center">
      <div className="bg-danger/10 text-danger flex size-14 items-center justify-center rounded-full text-2xl">
        !
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-lg font-bold">{t("sessionExpiredTitle")}</h1>
        <p className="text-muted text-sm leading-6">{t("sessionExpiredDescription")}</p>
      </div>

      <button
        type="button"
        onClick={() => redirectToPanelLogin(returnUrl)}
        className="h-control-h bg-primary hover:bg-primary-600 w-full rounded-lg text-sm font-semibold text-white"
      >
        {t("sessionExpiredRelogin")}
      </button>

      <a href={ROUTES.HOME} className="text-muted hover:text-foreground text-xs hover:underline">
        {t("sessionExpiredBackHome")}
      </a>
    </div>
  );
}
