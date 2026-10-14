/**
 * @level organism
 * Admin top bar: client-panel switch, notifications popover, profile button.
 */
"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeftRight, Bell, BellOff, ChevronLeft, UserCircle } from "lucide-react";
import { EmptyState } from "@/components/atoms/EmptyState";
import { ROUTES } from "@/config/routes";
import { PANEL_FROM_ADMIN_QUERY } from "@/config/onboarding";
import { cn } from "@/lib/utils";

export function AdminHeader() {
  const t = useTranslations("admin.header");
  const tNav = useTranslations("admin.nav");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!notificationsOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!notificationsRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setNotificationsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [notificationsOpen]);

  const iconButtonCls =
    "text-muted hover:text-foreground flex size-9 items-center justify-center rounded-xl transition-colors hover:bg-white/15";

  return (
    <header className="sticky top-0 z-[1200] w-full" dir="rtl">
      {/* Glass bar */}
      <div className="relative mx-3 mt-3 flex h-14 items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 shadow-lg shadow-black/5 backdrop-blur-2xl backdrop-saturate-150 dark:border-white/10 dark:bg-white/5">
        {/* Sheen top highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/20"
        />
        {/* Subtle inner glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/20 via-transparent to-transparent dark:from-white/10"
        />

        <span className="text-primary relative text-sm font-bold">باشگاه مشتریان نوین</span>

        <div className="flex-1" />

        <Link
          href={`${ROUTES.DASHBOARD}?${PANEL_FROM_ADMIN_QUERY}=1`}
          data-tour="admin-client-panel"
          className="text-muted hover:text-foreground relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-white/15"
        >
          <ArrowLeftRight size={17} />
          {tNav("clientPanel")}
        </Link>

        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen((open) => !open)}
            aria-label={t("notifications")}
            aria-expanded={notificationsOpen}
            data-tour="admin-notifications"
            className={cn(iconButtonCls, notificationsOpen && "text-foreground bg-white/20")}
          >
            <Bell size={19} />
          </button>

          {notificationsOpen && (
            <div className="border-border bg-surface absolute end-0 top-[calc(100%+0.75rem)] w-72 rounded-2xl border shadow-xl shadow-black/10">
              <div className="border-border border-b px-4 py-3">
                <p className="text-foreground text-sm font-semibold">{t("notifications")}</p>
              </div>
              <EmptyState
                icon={<BellOff size={20} />}
                title={t("notificationsEmpty")}
                description={t("notificationsEmptyDescription")}
              />
              <Link
                href={ROUTES.ADMIN.NOTIFICATIONS}
                onClick={() => setNotificationsOpen(false)}
                className="border-border text-primary hover:bg-background flex h-11 items-center justify-center gap-1.5 border-t text-xs font-medium transition-colors"
              >
                {t("notificationsViewAll")}
                <ChevronLeft size={14} />
              </Link>
            </div>
          )}
        </div>

        <button type="button" aria-label={t("profile")} className={cn(iconButtonCls, "relative")}>
          <UserCircle size={21} />
        </button>
      </div>
    </header>
  );
}
