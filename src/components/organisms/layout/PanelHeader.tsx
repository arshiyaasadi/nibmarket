/**
 * @level organism
 * Full-width liquid glass header bar
 */
"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { PROJECT } from "@/config/project";
import { ROUTES } from "@/config/routes";
import { resolvePanelNavTitle } from "@/lib/panel/page-title";
import { WalletBalanceChip } from "./WalletBalanceChip";
import { ProfileDropdown } from "./ProfileDropdown";
import { AdminPanelLink } from "./AdminPanelLink";
import { PanelNotificationsBell } from "./PanelNotificationsBell";

interface PanelHeaderProps {
  onOpenMobile: () => void;
}

export function PanelHeader({ onOpenMobile: _onOpenMobile }: PanelHeaderProps) {
  const pathname = usePathname() ?? ROUTES.DASHBOARD;
  const t = useTranslations("nav");
  const navTitle = resolvePanelNavTitle(pathname);
  const title =
    navTitle.kind === "brand"
      ? t("brandFull")
      : t(`pageTitles.${navTitle.key}` as "pageTitles.wallet");

  return (
    <header className="sticky top-0 z-40 w-full">
      {/* Glass bar */}
      <div className="gap-atom-md px-pad-atom-md sm:px-pad-mol relative mx-2 mt-2 flex h-12 items-center rounded-2xl border border-white/20 bg-white/10 shadow-lg shadow-black/5 backdrop-blur-2xl backdrop-saturate-150 sm:mx-3 sm:mt-3 sm:h-14 dark:border-white/10 dark:bg-white/5">
        {/* Sheen top highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/20"
        />
        {/* Subtle inner glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent dark:from-white/10"
        />

        {/* Logo + dynamic title (brand on dashboard only) */}
        <div className="gap-atom-md relative flex min-w-0 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PROJECT.logoSrc} alt="" aria-hidden="true" className="size-7 shrink-0" />
          <span className="text-foreground truncate text-sm font-bold">{title}</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Admin switch + Wallet + Notifications (beside profile) + Profile */}
        <div className="gap-atom-md relative flex items-center">
          <AdminPanelLink />
          <WalletBalanceChip />
          <PanelNotificationsBell />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
