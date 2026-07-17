"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { X, Check } from "lucide-react";
import { useSendInvite, useInviteQuota } from "@/features/network/queries";
import { useSession } from "@/hooks/use-session";
import { normalizeMobile } from "@/lib/normalization/digits";
import { fillInviteTemplate, MOCK_INVITE_TEMPLATES } from "@/lib/network/invite-templates";
import { fundsData } from "@/resources/data/funds";
import { cn } from "@/lib/utils";

type InviteStep = "form" | "fund" | "message" | "success";

function FundLogo({ title, image }: { title: string; image: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold">
        {title.charAt(0)}
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image}
      alt={title}
      className="h-10 w-10 shrink-0 rounded-xl object-cover"
      onError={() => setFailed(true)}
    />
  );
}

export function InviteModal({ onClose }: { onClose: () => void }) {
  const t = useTranslations("network");
  const { fullName } = useSession();
  const { data: quota } = useInviteQuota();

  const [step, setStep] = useState<InviteStep>("form");
  const [visible, setVisible] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFund, setSelectedFund] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(MOCK_INVITE_TEMPLATES[0].id);
  const [sendError, setSendError] = useState("");

  const { mutateAsync: sendInvite, isPending } = useSendInvite();

  const inviterName = fullName?.trim() || t("inviteTemplateDefaultInviter");

  const templates = useMemo(
    () =>
      MOCK_INVITE_TEMPLATES.map((tpl) => ({
        id: tpl.id,
        title: t(tpl.titleKey),
        body: fillInviteTemplate(t(tpl.bodyKey), {
          firstName: firstName.trim() || "…",
          lastName: lastName.trim() || "…",
          inviterName,
        }),
      })),
    [t, firstName, lastName, inviterName],
  );

  const selectedTemplate = templates.find((tpl) => tpl.id === selectedTemplateId) ?? templates[0];

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

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!firstName || firstName.length < 2) e.firstName = t("modalFirstNameError");
    if (!lastName) e.lastName = t("modalLastNameError");
    if (!/^09[0-9]{9}$/.test(mobile)) e.mobile = t("modalMobileError");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submitForm = () => {
    if (validateForm()) setStep("fund");
  };

  const goToMessageStep = () => {
    if (!selectedFund) return;
    setSendError("");
    setStep("message");
  };

  const submitInvite = async () => {
    if (!selectedFund || !selectedTemplateId) return;
    setSendError("");
    try {
      // Message template is UI-only for now; send payload unchanged.
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
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="border-border bg-background w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl transition-all duration-200"
        style={{ opacity: visible ? 1 : 0, transform: visible ? "scale(1)" : "scale(0.95)" }}
        dir="rtl"
      >
        <div className="border-border flex items-center justify-between border-b px-6 py-4">
          <div>
            <span className="text-foreground font-bold">{t("vipInviteModalTitle")}</span>
            {quota && (
              <p className="text-muted mt-0.5 text-xs">
                {t("vipInviteQuota", {
                  remaining: remaining.toLocaleString("fa-IR"),
                  limit: quota.limit.toLocaleString("fa-IR"),
                })}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="text-muted hover:bg-surface hover:text-foreground rounded-lg p-1.5 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          {step === "form" && (
            <div className="flex flex-col gap-5">
              {atLimit ? (
                <div className="border-warning/30 bg-warning/5 text-foreground rounded-xl border px-4 py-3 text-sm">
                  {t("modalLimitError")}
                </div>
              ) : (
                <>
                  <p className="text-muted text-sm">{t("vipInviteModalDesc")}</p>
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder={t("modalFirstName")}
                          className="border-border bg-surface text-foreground placeholder:text-muted focus:border-primary w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none"
                        />
                        {errors.firstName && (
                          <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <input
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder={t("modalLastName")}
                          className="border-border bg-surface text-foreground placeholder:text-muted focus:border-primary w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none"
                        />
                        {errors.lastName && (
                          <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <input
                        value={mobile}
                        onChange={(e) => setMobile(normalizeMobile(e.target.value))}
                        placeholder={t("modalMobilePlaceholder")}
                        dir="ltr"
                        className="border-border bg-surface text-foreground placeholder:text-muted focus:border-primary w-full rounded-xl border px-3 py-2.5 text-sm focus:outline-none"
                      />
                      {errors.mobile && (
                        <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={submitForm}
                    className="bg-primary w-full rounded-xl py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    {t("modalContinue")}
                  </button>
                </>
              )}
            </div>
          )}

          {step === "fund" && (
            <div className="flex flex-col gap-4">
              <p className="text-foreground text-sm font-medium">{t("modalStep2Title")}</p>
              <div className="flex max-h-64 flex-col gap-3 overflow-y-auto pe-1">
                {fundsData.map((category) => (
                  <div key={category.id} className="flex flex-col gap-2">
                    <p className="text-muted text-xs font-semibold">{category.categoryTitle}</p>
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
                            selected
                              ? "border-primary bg-primary/5"
                              : "border-border bg-surface hover:border-primary/50",
                          )}
                        >
                          <FundLogo title={item.title} image={item.image} />
                          <div className="min-w-0 flex-1">
                            <p
                              className={cn(
                                "text-sm font-medium",
                                selected ? "text-primary" : "text-foreground",
                              )}
                            >
                              {item.title}
                            </p>
                            <p className="text-muted mt-0.5 text-xs">{item.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("form")}
                  className="border-border text-muted hover:text-foreground flex-1 rounded-xl border py-2.5 text-sm"
                >
                  {t("modalBack")}
                </button>
                <button
                  type="button"
                  onClick={goToMessageStep}
                  disabled={!selectedFund}
                  className="bg-primary flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                >
                  {t("modalContinue")}
                </button>
              </div>
            </div>
          )}

          {step === "message" && (
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-foreground text-sm font-medium">{t("modalStepMessageTitle")}</p>
                <p className="text-muted mt-1 text-xs">{t("modalStepMessageDesc")}</p>
              </div>

              <div className="flex flex-col gap-2">
                {templates.map((tpl) => {
                  const selected = selectedTemplateId === tpl.id;
                  return (
                    <button
                      key={tpl.id}
                      type="button"
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className={cn(
                        "rounded-xl border px-3 py-3 text-right transition",
                        selected
                          ? "border-primary bg-primary/5"
                          : "border-border bg-surface hover:border-primary/40",
                      )}
                    >
                      <p
                        className={cn(
                          "text-sm font-semibold",
                          selected ? "text-primary" : "text-foreground",
                        )}
                      >
                        {tpl.title}
                      </p>
                      <p className="text-muted mt-1.5 line-clamp-2 text-xs leading-5 whitespace-pre-line">
                        {tpl.body}
                      </p>
                    </button>
                  );
                })}
              </div>

              {selectedTemplate && (
                <div className="border-border bg-surface-2/50 rounded-xl border px-3 py-3">
                  <p className="text-foreground text-xs leading-6 whitespace-pre-line">
                    {selectedTemplate.body}
                  </p>
                </div>
              )}

              {sendError && <p className="text-xs text-red-500">{sendError}</p>}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("fund")}
                  className="border-border text-muted hover:text-foreground flex-1 rounded-xl border py-2.5 text-sm"
                >
                  {t("modalBack")}
                </button>
                <button
                  type="button"
                  onClick={submitInvite}
                  disabled={!selectedFund || isPending}
                  className="bg-primary flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-50"
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
              <p className="text-foreground font-semibold">{t("modalStep3Title")}</p>
              <p className="text-muted text-sm">{t("modalStep3Desc")}</p>
              <button
                type="button"
                onClick={handleClose}
                className="bg-primary w-full rounded-xl py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {t("modalClose")}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
