/**
 * @level organism
 * Compact glassy KYC notice — Home page content only (first item).
 */
"use client";

import { useTranslations } from "next-intl";
import { ShieldAlert } from "lucide-react";
import { useAuthProfile } from "@/features/auth/queries";
import { needsSejamKyc, SEJAM_KYC_MODAL_ID } from "@/features/auth/sejam-kyc";
import { useUiSlice } from "@/store/slices/ui.slice";
import { cn } from "@/lib/utils";

export function SejamKycNoticeBanner() {
  const t = useTranslations("auth");
  const profileQuery = useAuthProfile();
  const activeModal = useUiSlice((s) => s.activeModal);
  const openModal = useUiSlice((s) => s.openModal);

  const unverified = profileQuery.isSuccess && needsSejamKyc(profileQuery.data?.hasSejamIdentity);
  const modalOpen = activeModal === SEJAM_KYC_MODAL_ID;

  if (!unverified || modalOpen) return null;

  return (
    <button
      type="button"
      onClick={() => openModal(SEJAM_KYC_MODAL_ID)}
      className={cn(
        "group relative flex h-11 w-full items-center gap-2.5 overflow-hidden rounded-2xl px-3 text-start transition-colors sm:h-12 sm:gap-3",
        "bg-primary/15 border border-white/20 shadow-lg shadow-black/10",
        "backdrop-blur-2xl backdrop-saturate-150",
        "hover:border-primary/50 hover:bg-primary/25",
        "dark:bg-primary/20 dark:hover:bg-primary/30 dark:border-white/15",
      )}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/15 via-transparent to-transparent"
      />

      <span className="bg-primary/25 text-primary relative flex size-7 shrink-0 items-center justify-center rounded-lg sm:size-8">
        <ShieldAlert className="size-3.5 sm:size-4" aria-hidden />
      </span>

      <span className="text-foreground relative min-w-0 flex-1 truncate text-xs font-medium sm:text-sm">
        {t("kycNotifyTitle")}
        <span className="text-muted hidden font-normal sm:inline"> — {t("kycNotifyBody")}</span>
      </span>

      <span className="text-primary relative shrink-0 text-[11px] font-semibold whitespace-nowrap group-hover:underline sm:text-xs">
        {t("kycNotifyAction")}
      </span>
    </button>
  );
}
