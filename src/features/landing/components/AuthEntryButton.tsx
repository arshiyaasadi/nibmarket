"use client";

import { startAuthEntry } from "@/config/auth-redirect";
import { ROUTES } from "@/config/routes";

type AuthEntryButtonProps = {
  className?: string;
  children: React.ReactNode;
  returnUrl?: string;
};

/** Landing CTA that starts NIB Market SSO (no local OTP /login). */
export function AuthEntryButton({
  className,
  children,
  returnUrl = ROUTES.DASHBOARD,
}: AuthEntryButtonProps) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => startAuthEntry(returnUrl)}
    >
      {children}
    </button>
  );
}
