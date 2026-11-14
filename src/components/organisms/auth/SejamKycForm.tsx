"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Alert } from "@/components/atoms/Alert";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { JalaliDatePicker } from "@/components/molecules/JalaliDatePicker";
import { useAuthProfile, useVerifyKyc } from "@/features/auth/queries";
import { ApiException } from "@/types/api";
import { toEnglishDigits } from "@/lib/normalization/digits";
import { isValidIranianNationalCode, normalizeNationalCode } from "@/lib/validation/national-code";

type SejamKycFormProps = {
  onSuccess?: () => void;
};

export function SejamKycForm({ onSuccess }: SejamKycFormProps) {
  const t = useTranslations("auth");
  const profileQuery = useAuthProfile();
  const verifyMutation = useVerifyKyc();

  const [nationalCode, setNationalCode] = useState("");
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const userMobile = profileQuery.data?.mobile?.trim() || "";

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
      onSuccess?.();
    } catch (error) {
      const message =
        error instanceof ApiException && error.message ? error.message : t("kycVerifyFailed");
      setFormError(message);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="gap-pad-mol flex flex-col">
      <p className="text-muted text-sm leading-7">{t("kycGateDescription")}</p>

      {userMobile ? (
        <p className="border-primary/20 bg-primary/10 text-foreground px-pad-atom-md py-atom-md rounded-xl border text-xs leading-6">
          {t("kycNationalCodeHintWithMobile", { userMobile })}
        </p>
      ) : null}

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
        hint={userMobile ? undefined : t("kycNationalCodeHintWithMobile", { userMobile: "—" })}
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
  );
}
