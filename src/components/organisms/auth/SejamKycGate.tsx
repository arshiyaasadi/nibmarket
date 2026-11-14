"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Spinner } from "@/components/atoms/Spinner";
import { JalaliDatePicker } from "@/components/molecules/JalaliDatePicker";
import { useAuthProfile, useVerifyKyc } from "@/features/auth/queries";
import { ApiException } from "@/types/api";
import { toEnglishDigits } from "@/lib/normalization/digits";
import { isValidIranianNationalCode, normalizeNationalCode } from "@/lib/validation/national-code";

function needsSejamKyc(hasSejamIdentity: boolean | undefined): boolean {
  return hasSejamIdentity !== true;
}

export function SejamKycGate() {
  const t = useTranslations("auth");
  const profileQuery = useAuthProfile();
  const verifyMutation = useVerifyKyc();

  const [nationalCode, setNationalCode] = useState("");
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const profile = profileQuery.data;
  const gated = profileQuery.isSuccess && needsSejamKyc(profile?.hasSejamIdentity);

  if (profileQuery.isLoading) {
    return (
      <div
        className="bg-background/80 fixed inset-0 z-[80] flex items-center justify-center backdrop-blur-sm"
        role="status"
        aria-live="polite"
      >
        <Spinner size="lg" />
      </div>
    );
  }

  if (profileQuery.isError) {
    return (
      <div className="bg-background/95 fixed inset-0 z-[80] flex items-center justify-center p-6 backdrop-blur-sm">
        <div className="border-border bg-surface w-full max-w-md rounded-xl border p-6 shadow-sm">
          <Alert variant="danger" title={t("kycGateTitle")}>
            {t("kycProfileLoadFailed")}
          </Alert>
          <Button
            className="mt-4"
            fullWidth
            variant="primary"
            onClick={() => void profileQuery.refetch()}
          >
            {t("kycRetryProfile")}
          </Button>
        </div>
      </div>
    );
  }

  if (!gated) return null;

  function validate(): boolean {
    const next: Record<string, string> = {};
    const code = normalizeNationalCode(nationalCode);
    if (!isValidIranianNationalCode(code)) {
      next.nationalCode = t("kycInvalidNationalCode");
    }
    if (!birthDate) {
      next.birthDate = t("kycBirthDateRequired");
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (!validate()) return;

    try {
      await verifyMutation.mutateAsync({
        nationalCode: normalizeNationalCode(nationalCode),
        birthDate: toEnglishDigits(birthDate!).replace(/-/g, "/"),
      });
    } catch (error) {
      const message =
        error instanceof ApiException && error.message ? error.message : t("kycVerifyFailed");
      setFormError(message);
    }
  }

  return (
    <div
      className="bg-background/95 fixed inset-0 z-[80] flex items-center justify-center p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sejam-kyc-title"
    >
      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="border-border bg-surface flex w-full max-w-md flex-col gap-4 rounded-xl border p-6 shadow-sm"
      >
        <div className="flex flex-col gap-2">
          <h1 id="sejam-kyc-title" className="text-foreground text-lg font-semibold">
            {t("kycGateTitle")}
          </h1>
          <p className="text-muted text-sm leading-7">{t("kycGateDescription")}</p>
        </div>

        {formError && (
          <Alert variant="danger" onClose={() => setFormError(null)}>
            {formError}
          </Alert>
        )}

        <Input
          label={t("kycNationalCode")}
          placeholder={t("kycNationalCodePlaceholder")}
          inputMode="numeric"
          autoComplete="off"
          maxLength={10}
          value={nationalCode}
          error={fieldErrors.nationalCode}
          hint={t("profileNationalIdHint")}
          onChange={(e) => {
            setNationalCode(normalizeNationalCode(e.target.value));
            setFieldErrors((prev) => {
              const next = { ...prev };
              delete next.nationalCode;
              return next;
            });
          }}
          required
        />

        <JalaliDatePicker
          label={t("kycBirthDate")}
          placeholder={t("kycBirthDatePlaceholder")}
          value={birthDate}
          error={fieldErrors.birthDate}
          onChange={(next) => {
            setBirthDate(next);
            setFieldErrors((prev) => {
              const cleared = { ...prev };
              delete cleared.birthDate;
              return cleared;
            });
          }}
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          size="lg"
          loading={verifyMutation.isPending}
        >
          {verifyMutation.isPending ? t("kycSubmitting") : t("kycSubmit")}
        </Button>
      </form>
    </div>
  );
}
