"use client";

import { useTranslations } from "next-intl";

interface Props {
  onRetry?: () => void;
}

export function ErrorFallback({ onRetry }: Props) {
  const t = useTranslations("errors");

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-lg font-medium text-red-600">{t("serverError")}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md bg-primary px-4 py-2 text-sm text-white hover:opacity-90"
        >
          {t("tryAgain")}
        </button>
      )}
    </div>
  );
}
