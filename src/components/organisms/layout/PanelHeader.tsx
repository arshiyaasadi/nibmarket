/**
 * @level organism
 * Full-width liquid glass header bar
 */
"use client";

import { PROJECT } from "@/config/project";
import { WalletBalanceChip } from "./WalletBalanceChip";
import { ProfileDropdown } from "./ProfileDropdown";

interface PanelHeaderProps {
  onOpenMobile: () => void;
}

export function PanelHeader({ onOpenMobile: _onOpenMobile }: PanelHeaderProps) {
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
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent dark:from-white/8"
        />

        {/* Logo + name (mobile only) */}
        <div className="gap-atom-md relative flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={PROJECT.logoSrc} alt="" aria-hidden="true" className="size-7 shrink-0" />
          <span className="text-foreground text-sm font-bold">
            باشگاه مشتریان تامین سرمایه نوین
          </span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Wallet + Profile */}
        <div className="gap-atom-md relative flex items-center">
          <WalletBalanceChip />
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
}
