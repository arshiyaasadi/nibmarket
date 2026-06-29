"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { X, Check } from "lucide-react";
import { useSendInvite, useInviteQuota } from "@/features/network/queries";
import { normalizeMobile } from "@/lib/normalization/digits";
import { fundsData } from "@/resources/data/funds";
import { cn } from "@/lib/utils";

type InviteStep = "form" | "fund" | "success";

function FundLogo({ title, image }: { title: string; image: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">
        {title.charAt(0)}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={image} alt={title} className="h-10 w-10 shrink-0 rounded-xl object-cover" onError={() => setFailed(true)} />
  );
}

export function InviteModal({ onClose }: { onClose: () => void }) {
  const t = useTranslations("network");
  const { data: quota } = useInviteQuota();

  const [step, setStep] = useState<InviteStep>("form");
  const [visible, setVisible] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFund, setSelectedFund] = useState<string | null>(null);
  const [sendError, setSendError] = useState("");

  const { mutateAsync: sendInvite, isPending } = useSendInvite();

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 200);
  }, [onClose]);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleClose]);

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!firstName || firstName.length < 2) e.firstName = t("modalFirstNameError");
    if (!lastName) e.lastName = t("modalLastNameError");
    if (!/^09[0-9]{9}$/.test(mobile)) e.mobile = t("modalMobileError");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitForm = () => { if (validateForm()) setStep("fund"); };

  const submitInvite = async () => {
    if (!selectedFund) return;
    setSendError("");
    try {
      await sendInvite({ firstName, lastName, mobile, fundId: selectedFund });
      setStep("success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("LIMIT")) {
        setSendError(t("modalLimitError"));
      } else if (msg.includes("DUPLICATE")) {
        setSendError(t("modalDuplicateError"));
      } else {
        setSendError(t("modalSendError"));
      }
    }
  };

  const fundIdFromImage = (image: string) =>
    image.replace(/^\/images\/fund\//, "").replace(/\.png$/, "");

  const remaining = quota?.remaining ?? 5;
  const atLimit = remaining <= 0;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl transition-all duration-200"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "scale(1)" : "scale(0.95)" }}
        dir="rtl"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <span className="font-bold text-foreground">{t("vipInviteModalTitle")}</span>
            {quota && (
              <p className="mt-0.5 text-xs text-muted">
                {t("vipInviteQuota", { remaining: remaining.toLocaleString("fa-IR"), limit: quota.limit.toLocaleString("fa-IR") })}
              </p>
            )}
          </div>
          <button onClick={handleClose} className="rounded-lg p-1.5 text-muted transition hover:bg-surface hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          {step === "form" && (
            <div className="flex flex-col gap-5">
              {atLimit ? (
                <div className="rounded-xl border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-foreground">
                  {t("modalLimitError")}
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted">{t("vipInviteModalDesc")}</p>
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder={t("modalFirstName")}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
                        />
                        {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
                      </div>
                      <div>
                        <input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder={t("modalLastName")}
                          className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
                        />
                        {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
                      </div>
                    </div>
                    <div>
                      <input
                        value={mobile}
                        onChange={(e) => setMobile(normalizeMobile(e.target.value))}
                        placeholder={t("modalMobilePlaceholder")}
                        dir="ltr"
                        className="w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
                      />
                      {errors.mobile && <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>}
                    </div>
                  </div>
                  <button
                    onClick={submitForm}
                    className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    {t("modalContinue")}
                  </button>
                </>
              )}
            </div>
          )}

          {step === "fund" && (
            <div className="flex flex-col gap-4">
              <p className="text-sm font-medium text-foreground">{t("modalStep2Title")}</p>
              <div className="flex max-h-64 flex-col gap-3 overflow-y-auto pe-1">
                {fundsData.map((category) => (
                  <div key={category.id} className="flex flex-col gap-2">
                    <p className="text-xs font-semibold text-muted">{category.categoryTitle}</p>
                    {category.items.map((item) => {
                      const fundId = fundIdFromImage(item.image);
                      const selected = selectedFund === fundId;
                      return (
                        <button
                          key={fundId}
                          type="button"
                          onClick={() => setSelectedFund(fundId)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-right transition",
                            selected ? "border-primary bg-primary/5" : "border-border bg-surface hover:border-primary/50"
                          )}
                        >
                          <FundLogo title={item.title} image={item.image} />
                          <div className="min-w-0 flex-1">
                            <p className={cn("text-sm font-medium", selected ? "text-primary" : "text-foreground")}>{item.title}</p>
                            <p className="mt-0.5 text-xs text-muted">{item.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              {sendError && <p className="text-xs text-red-500">{sendError}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep("form")} className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted hover:text-foreground">
                  {t("modalBack")}
                </button>
                <button
                  type="button"
                  onClick={submitInvite}
                  disabled={!selectedFund || isPending}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {isPending ? t("modalSending") : t("modalSendInvite")}
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="font-semibold text-foreground">{t("modalStep3Title")}</p>
              <p className="text-sm text-muted">{t("modalStep3Desc")}</p>
              <button type="button" onClick={handleClose} className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
                {t("modalClose")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
