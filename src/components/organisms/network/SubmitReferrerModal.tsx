"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { X, Check, UserPlus } from "lucide-react";
import { useSubmitReferrer } from "@/features/network/queries";
import { useSession } from "@/hooks/use-session";
import { markReferrerRegistered } from "@/lib/storage/referrer-registration";
import { normalizeSearchInput } from "@/lib/normalization/digits";
import { cn } from "@/lib/utils";

type Props = {
  onClose: () => void;
  onSuccess?: () => void;
};

export function SubmitReferrerModal({ onClose, onSuccess }: Props) {
  const t = useTranslations("network");
  const { userId } = useSession();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [visible, setVisible] = useState(false);
  const { mutateAsync: submitReferrer, isPending } = useSubmitReferrer();

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose]);

  const conditions = [
    t("registerReferrerCondition1"),
    t("registerReferrerCondition2"),
    t("registerReferrerCondition3"),
  ];

  const mapError = (message: string) => {
    if (message.includes("ALREADY_HAS_REFERRER")) return t("registerReferrerModalErrorAlready");
    if (message.includes("HAS_SUBSETS")) return t("registerReferrerModalErrorHasSubsets");
    if (message.includes("REFERRAL_CODE_REQUIRED")) return t("registerReferrerModalErrorRequired");
    return t("registerReferrerModalErrorInvalid");
  };

  const handleSubmit = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError(t("registerReferrerModalErrorRequired"));
      return;
    }
    setError("");
    try {
      await submitReferrer(trimmed);
      if (userId) markReferrerRegistered(userId);
      setSuccess(true);
      onSuccess?.();
      setTimeout(handleClose, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      setError(mapError(msg));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="border-border bg-background w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl transition-all duration-200"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "scale(1)" : "scale(0.95)" }}
        dir="rtl"
      >
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <span className="text-foreground font-bold">{t("registerReferrerModalTitle")}</span>
          <button
            type="button"
            onClick={handleClose}
            className="text-muted hover:bg-surface hover:text-foreground rounded-lg p-1.5 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6">
          {success ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Check className="h-7 w-7 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-foreground text-sm font-medium">
                {t("registerReferrerModalSuccess")}
              </p>
            </div>
          ) : (
            <>
              <p className="text-muted text-sm">{t("registerReferrerModalDesc")}</p>

              <div className="border-border bg-surface-2/60 rounded-xl border px-3 py-2.5">
                <p className="text-foreground mb-2 text-xs font-semibold">
                  {t("registerReferrerConditionsTitle")}
                </p>
                <ul className="space-y-1.5">
                  {conditions.map((item) => (
                    <li
                      key={item}
                      className="text-muted flex items-start gap-2 text-[12px] leading-snug"
                    >
                      <span className="bg-primary/60 mt-1.5 size-1 shrink-0 rounded-full" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <input
                value={code}
                onChange={(e) => {
                  setCode(normalizeSearchInput(e.target.value).toUpperCase());
                  setError("");
                }}
                placeholder={t("registerReferrerModalPlaceholder")}
                dir="ltr"
                className={cn(
                  "bg-surface text-foreground placeholder:text-muted focus:border-primary w-full rounded-xl border px-3 py-2.5 font-mono text-sm tracking-widest focus:outline-none",
                  error ? "border-red-500" : "border-border",
                )}
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending}
                className="bg-primary flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
              >
                <UserPlus size={16} />
                {isPending
                  ? t("registerReferrerModalSubmitting")
                  : t("registerReferrerModalSubmit")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
