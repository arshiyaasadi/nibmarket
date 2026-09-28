"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import { redirectToPanelLoginWithInvite } from "@/config/auth-redirect";
import { ROUTES } from "@/config/routes";
import { useSubmitReferrer } from "@/features/network/queries";
import { useSession } from "@/hooks/use-session";
import {
  normalizeInviteCode,
  peekPendingInviteCode,
} from "@/lib/invite/pending-invite";
import { markReferrerRegistered } from "@/lib/storage/referrer-registration";
import { useAuthSlice } from "@/store/slices/auth.slice";

type Phase = "working" | "success" | "already" | "error";

export function InviteWelcomeClient() {
  const t = useTranslations("invite");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userId, token, isAuthenticated } = useSession();
  const { mutateAsync: submitReferrer } = useSubmitReferrer();
  const started = useRef(false);

  const [hydrated, setHydrated] = useState(() => useAuthSlice.persist.hasHydrated());
  const [phase, setPhase] = useState<Phase>("working");
  const [error, setError] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    const unsub = useAuthSlice.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useAuthSlice.persist.hasHydrated());
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated || started.current) return;

    const inviteCode = normalizeInviteCode(
      searchParams.get("code") ??
        searchParams.get("inviteCode") ??
        searchParams.get("ref") ??
        peekPendingInviteCode(),
    );

    if (!inviteCode) {
      setPhase("error");
      setError(t("invalidCode"));
      return;
    }

    setCode(inviteCode);

    if (!token && !isAuthenticated) {
      redirectToPanelLoginWithInvite(inviteCode);
      return;
    }

    started.current = true;

    void (async () => {
      try {
        await submitReferrer(inviteCode);
        const uid = useAuthSlice.getState().userId;
        if (uid) markReferrerRegistered(uid);
        setPhase("success");
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err ?? "");
        if (msg.includes("ALREADY_HAS_REFERRER")) {
          const uid = useAuthSlice.getState().userId;
          if (uid) markReferrerRegistered(uid);
          setPhase("already");
          return;
        }
        if (msg.includes("HAS_SUBSETS")) {
          setPhase("error");
          setError(t("errorHasSubsets"));
          return;
        }
        setPhase("error");
        setError(t("errorRegister"));
      }
    })();
  }, [hydrated, isAuthenticated, searchParams, submitReferrer, t, token, userId]);

  if (phase === "working") {
    return (
      <div className="gap-pad-mol flex flex-col items-center text-center">
        <div className="bg-primary/10 flex size-12 items-center justify-center rounded-full">
          <div className="border-primary size-6 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground text-lg font-bold">{t("workingTitle")}</h1>
          <p className="text-muted text-sm leading-6">{t("workingDescription")}</p>
        </div>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="gap-pad-mol flex flex-col items-center text-center">
        <h1 className="text-foreground text-lg font-bold">{t("errorTitle")}</h1>
        <p className="text-muted text-sm leading-6">{error || t("errorRegister")}</p>
        {code ? (
          <p className="text-muted font-mono text-xs tracking-widest" dir="ltr">
            {code}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => router.replace(ROUTES.DASHBOARD)}
          className="bg-primary mt-2 h-control-h w-full rounded-lg text-sm font-semibold text-white"
        >
          {t("goToPanel")}
        </button>
      </div>
    );
  }

  return (
    <div className="gap-pad-mol flex flex-col items-center text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
        <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-foreground text-lg font-bold">
          {phase === "already" ? t("alreadyTitle") : t("successTitle")}
        </h1>
        <p className="text-muted text-sm leading-6">
          {phase === "already" ? t("alreadyDescription") : t("successDescription")}
        </p>
        {code ? (
          <p className="text-muted font-mono text-xs tracking-widest" dir="ltr">
            {code}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => router.replace(ROUTES.DASHBOARD)}
        className="bg-primary mt-2 h-control-h w-full rounded-lg text-sm font-semibold text-white"
      >
        {t("goToPanel")}
      </button>
    </div>
  );
}
