"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, X } from "lucide-react";
import { redirectToPanelLoginWithInvite } from "@/config/auth-redirect";
import { ROUTES } from "@/config/routes";
import { useSubmitReferrer } from "@/features/network/queries";
import { useSession } from "@/hooks/use-session";
import {
  findInviteFund,
  normalizeFundId,
  normalizeInviteCode,
  peekPendingInvite,
} from "@/lib/invite/pending-invite";
import { markReferrerRegistered } from "@/lib/storage/referrer-registration";
import { useAuthSlice } from "@/store/slices/auth.slice";

type Phase = "working" | "success" | "already" | "error";

function FundPreview({ fundId }: { fundId: string }) {
  const t = useTranslations("invite");
  const fund = findInviteFund(fundId);
  if (!fund) return null;

  return (
    <div className="border-border bg-background flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-right">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={fund.image} alt={fund.name} className="h-12 w-12 shrink-0 rounded-xl object-cover" />
      <div className="min-w-0 flex-1">
        <p className="text-muted text-[11px]">{t("fundLabel")}</p>
        <p className="text-foreground text-sm font-semibold">{fund.name}</p>
        <p className="text-muted mt-0.5 text-xs">{fund.description}</p>
      </div>
    </div>
  );
}

export function InviteWelcomeClient() {
  const t = useTranslations("invite");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, isAuthenticated } = useSession();
  const { mutateAsync: submitReferrer } = useSubmitReferrer();
  const started = useRef(false);

  const [hydrated, setHydrated] = useState(() => useAuthSlice.persist.hasHydrated());
  const [phase, setPhase] = useState<Phase>("working");
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [fundId, setFundId] = useState("");

  useEffect(() => {
    const unsub = useAuthSlice.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useAuthSlice.persist.hasHydrated());
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated || started.current) return;

    const pending = peekPendingInvite();
    const inviteCode = normalizeInviteCode(
      searchParams.get("code") ??
        searchParams.get("inviteCode") ??
        searchParams.get("ref") ??
        pending?.code,
    );
    const nextFundId = normalizeFundId(
      searchParams.get("fundId") ?? searchParams.get("fund") ?? pending?.fundId,
    );

    if (!inviteCode) {
      setPhase("error");
      setError(t("errorNotCompleted"));
      return;
    }

    setCode(inviteCode);
    if (nextFundId) setFundId(nextFundId);

    if (!token && !isAuthenticated) {
      redirectToPanelLoginWithInvite(inviteCode, nextFundId || undefined);
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
        setError(msg.trim() ? `${t("errorNotCompleted")} (${msg})` : t("errorNotCompleted"));
      }
    })();
  }, [hydrated, isAuthenticated, searchParams, submitReferrer, t, token]);

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
        {fundId ? <FundPreview fundId={fundId} /> : null}
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="gap-pad-mol flex flex-col items-center text-center">
        <div className="bg-danger/10 text-danger flex size-16 items-center justify-center rounded-full">
          <X className="h-8 w-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h1 className="text-foreground text-lg font-bold">{t("errorTitle")}</h1>
          <p className="text-danger text-sm leading-6 font-medium">
            {error || t("errorNotCompleted")}
          </p>
          <p className="text-muted text-xs leading-5">{t("errorRegister")}</p>
        </div>
        {fundId ? <FundPreview fundId={fundId} /> : null}
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
      {fundId ? <FundPreview fundId={fundId} /> : null}
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
