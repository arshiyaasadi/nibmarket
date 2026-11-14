/**
 * @level organism
 * Client header bell — latest notifications in a mobile-friendly bottom sheet.
 */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Bell, ChevronLeft } from "lucide-react";
import { BottomSheetPanel } from "@/components/atoms/BottomSheetPanel";
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
  const { data } = useNotifications({ page: 1, limit: 8 });
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

  return (
    <>
      <button
        type="button"
        aria-label={t("bellTitle")}
        aria-expanded={open}
        onClick={() => setOpen(true)}
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

      <BottomSheetPanel open={open} onClose={() => setOpen(false)} title={t("bellTitle")}>
        {items.length === 0 ? (
          <p className="text-muted py-8 text-center text-xs">{t("bellEmpty")}</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={cn(
                    "hover:bg-background flex w-full flex-col gap-0.5 rounded-xl px-3 py-3 text-start",
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
          className="border-border text-primary hover:bg-background mt-3 flex h-11 items-center justify-center gap-1.5 rounded-xl border text-xs font-medium"
        >
          {t("viewAll")}
          <ChevronLeft size={14} />
        </Link>
      </BottomSheetPanel>
    </>
  );
}
