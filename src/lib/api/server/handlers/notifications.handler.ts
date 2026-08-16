import { NextResponse } from "next/server";
import type { LoginActivity, Notification, NotificationType } from "@/types/mlm";

const NOTIFICATIONS: Notification[] = [
  {
    id: "mock-notification-1",
    type: "system",
    title: "به نیب کلاب خوش آمدید",
    body: "حساب کاربری شما آماده استفاده است.",
    createdAt: "2026-08-16T08:30:00.000Z",
    isRead: false,
  },
  {
    id: "mock-notification-2",
    type: "network",
    title: "عضو جدید شبکه",
    body: "یک کاربر جدید با کد دعوت شما ثبت‌نام کرد.",
    createdAt: "2026-08-15T12:00:00.000Z",
    isRead: true,
  },
  {
    id: "mock-notification-3",
    type: "promotion",
    title: "ماموریت جدید",
    body: "ماموریت هفتگی جدید برای شما فعال شد.",
    createdAt: "2026-08-14T09:15:00.000Z",
    isRead: true,
  },
];

const LOGIN_ACTIVITY: LoginActivity[] = [
  {
    id: "mock-login-1",
    ip: "127.0.0.1",
    device: "Chrome روی macOS",
    location: "محیط توسعه",
    createdAt: "2026-08-16T08:00:00.000Z",
    status: "success",
  },
];

export async function notificationsListHandler(req: Request): Promise<Response> {
  const requestedType = new URL(req.url).searchParams.get("type") as NotificationType | null;
  const items = requestedType
    ? NOTIFICATIONS.filter((notification) => notification.type === requestedType)
    : NOTIFICATIONS;

  return NextResponse.json({ items, total: items.length, page: 1, limit: items.length });
}

export async function notificationsActivityHandler(): Promise<Response> {
  return NextResponse.json(LOGIN_ACTIVITY);
}
