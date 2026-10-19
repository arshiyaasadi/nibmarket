/**
 * Public marketing chrome (same layer as home landing).
 */
"use client";

import { startAuthEntry } from "@/config/auth-redirect";
import { ROUTES } from "@/config/routes";
import { LandingFooter } from "@/components/organisms/landing/LandingFooter";
import { LandingNav } from "@/components/organisms/landing/LandingNav";

export type CoursesShellProps = {
  children: React.ReactNode;
  /** Callback URL after login — defaults to courses index. */
  authReturnUrl?: string;
};

export function CoursesShell({ children, authReturnUrl = ROUTES.COURSES }: CoursesShellProps) {
  function onAuthEntry() {
    startAuthEntry(authReturnUrl);
  }

  return (
    <div className="bg-background text-foreground min-h-dvh font-sans" dir="rtl" lang="fa">
      <LandingNav onAuthEntry={onAuthEntry} linkMode="site" />
      <main className="gap-stack-org pb-stack-org pt-pad-org flex flex-col">{children}</main>
      <LandingFooter />
    </div>
  );
}
