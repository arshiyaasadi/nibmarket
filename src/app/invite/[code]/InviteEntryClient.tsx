"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { redirectToPanelLoginWithInvite } from "@/config/auth-redirect";
import { ROUTES } from "@/config/routes";
import {
  buildInviteWelcomePath,
  normalizeFundId,
  normalizeInviteCode,
  storePendingInvite,
} from "@/lib/invite/pending-invite";
import { useAuthSlice } from "@/store/slices/auth.slice";

export function InviteEntryClient() {
  const t = useTranslations("invite");
  const router = useRouter();
  const params = useParams<{ code?: string; fundId?: string }>();
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(() => useAuthSlice.persist.hasHydrated());

  useEffect(() => {
    const unsub = useAuthSlice.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useAuthSlice.persist.hasHydrated());
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const code = normalizeInviteCode(
      typeof params.code === "string" ? decodeURIComponent(params.code) : "",
    );
    const fundId = normalizeFundId(
      typeof params.fundId === "string" ? decodeURIComponent(params.fundId) : "",
    );

    if (!code) {
      setError(t("invalidCode"));
      return;
    }

    storePendingInvite({ code, fundId: fundId || undefined });

    const token = useAuthSlice.getState().token;
    if (token) {
      router.replace(buildInviteWelcomePath(code, fundId || undefined));
      return;
    }

    redirectToPanelLoginWithInvite(code, fundId || undefined);
  }, [hydrated, params.code, params.fundId, router, t]);

  if (error) {
    return (
      <div className="gap-pad-mol flex flex-col items-center text-center">
        <h1 className="text-foreground text-lg font-bold">{t("invalidTitle")}</h1>
        <p className="text-muted text-sm leading-6">{error}</p>
        <a
          href={ROUTES.HOME}
          className="bg-primary mt-2 inline-flex h-control-h items-center justify-center rounded-lg px-4 text-sm font-semibold text-white"
        >
          {t("backHome")}
        </a>
      </div>
    );
  }

  return (
    <div className="gap-pad-mol flex flex-col items-center text-center">
      <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
        <div className="border-primary size-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-lg font-bold">{t("redirectTitle")}</h1>
        <p className="text-muted text-sm leading-6">{t("redirectDescription")}</p>
      </div>
    </div>
  );
}
