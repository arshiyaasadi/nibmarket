/**
 * @level organism
 * Client header bell — latest 3 notifications + link to full inbox.
 */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Bell, ChevronLeft } from "lucide-react";
import { useAuthProfile } from "@/features/auth/queries";
import {
  needsSejamKyc,
  SEJAM_KYC_MODAL_ID,
  SEJAM_KYC_NOTIFICATION_ID,
} from "@/features/auth/sejam-kyc";
import { withSejamKycNotification } from "@/features/auth/with-sejam-kyc-notification";
import { useMarkNotificationRead, useNotifications } from "@/features/notifications/queries";
import { ROUTES } from "@/config/routes";
import { useUiSlice } from "@/store/slices/ui.slice";
import { cn, formatDateTime } from "@/lib/utils";

export function PanelNotificationsBell() {
  const t = useTranslations("pages.notifications");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data } = useNotifications({ page: 1, limit: 3 });
  const markRead = useMarkNotificationRead();
  const profileQuery = useAuthProfile();
  const openModal = useUiSlice((s) => s.openModal);

  const needsKyc = needsSejamKyc(profileQuery.data?.hasSejamIdentity);
  const merged = useMemo(
    () =>
      withSejamKycNotification(data, needsKyc, {
        title: t("kycRequiredTitle"),
        body: t("kycRequiredBody"),
      }),
    [data, needsKyc, t],
  );

  const items = merged?.items ?? [];
  const unreadCount = items.filter((n) => !n.isRead).length;

  useEffect(() => {
    if (!open) return;
    function onPointer(event: MouseEvent) {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-label={t("bellTitle")}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "text-muted relative flex size-9 items-center justify-center rounded-xl border border-transparent transition-colors",
          "hover:text-foreground hover:border-white/20 hover:bg-white/10",
          open && "text-foreground border-white/20 bg-white/15",
        )}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="bg-danger absolute end-1 top-1 size-1.5 rounded-full" />
        )}
      </button>

      {open && (
        <div className="border-border bg-surface absolute end-0 top-[calc(100%+0.75rem)] z-50 w-80 overflow-hidden rounded-2xl border shadow-xl shadow-black/10">
          <div className="border-border border-b px-4 py-3">
            <p className="text-foreground text-sm font-semibold">{t("bellTitle")}</p>
          </div>
          {items.length === 0 ? (
            <p className="text-muted px-4 py-8 text-center text-xs">{t("bellEmpty")}</p>
          ) : (
            <ul className="max-h-72 overflow-y-auto">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={cn(
                      "hover:bg-background flex w-full flex-col gap-0.5 border-b border-white/5 px-4 py-3 text-start",
                      !item.isRead && "bg-primary/5",
                    )}
                    onClick={() => {
                      if (item.id === SEJAM_KYC_NOTIFICATION_ID) {
                        setOpen(false);
                        openModal(SEJAM_KYC_MODAL_ID);
                        return;
                      }
                      if (!item.isRead) markRead.mutate(item.id);
                    }}
                  >
                    <span className="text-foreground text-sm font-medium">{item.title}</span>
                    <span className="text-muted line-clamp-2 text-xs">{item.body}</span>
                    <span className="text-muted mt-1 text-[10px]">
                      {formatDateTime(item.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Link
            href={ROUTES.NOTIFICATIONS}
            onClick={() => setOpen(false)}
            className="border-border text-primary hover:bg-background flex h-11 items-center justify-center gap-1.5 border-t text-xs font-medium"
          >
            {t("viewAll")}
            <ChevronLeft size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
