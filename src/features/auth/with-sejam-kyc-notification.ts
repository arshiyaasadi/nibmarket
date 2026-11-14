import type { Notification, Paginated } from "@/types/mlm";
import { SEJAM_KYC_NOTIFICATION_ID } from "@/features/auth/sejam-kyc";

type KycNotifyCopy = {
  title: string;
  body: string;
};

/** Prepend a client-only Sejam KYC inbox item when the user is unverified. */
export function withSejamKycNotification(
  page: Paginated<Notification> | undefined,
  needsKyc: boolean,
  copy: KycNotifyCopy,
): Paginated<Notification> | undefined {
  if (!page) return page;
  const withoutLocal = page.items.filter((item) => item.id !== SEJAM_KYC_NOTIFICATION_ID);
  const removedLocal = page.items.length - withoutLocal.length;
  if (!needsKyc) {
    return {
      ...page,
      items: withoutLocal,
      total: Math.max(0, page.total - removedLocal),
    };
  }

  const local: Notification = {
    id: SEJAM_KYC_NOTIFICATION_ID,
    type: "system",
    title: copy.title,
    body: copy.body,
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  const items = [local, ...withoutLocal];
  return {
    ...page,
    items,
    total: page.total - removedLocal + 1,
  };
}
