import { NextResponse } from "next/server";
import type { LoginActivity } from "@/types/mlm";
import {
  listClientNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/mock/admin-system-messages";

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
  const url = new URL(req.url);
  const type = url.searchParams.get("type");
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "20", 10) || 20, 100);
  const page = Math.max(parseInt(url.searchParams.get("page") ?? "1", 10) || 1, 1);

  const result = await listClientNotifications({ page, limit, type });
  return NextResponse.json(result);
}

export async function notificationsActivityHandler(): Promise<Response> {
  return NextResponse.json(LOGIN_ACTIVITY);
}

export async function notificationsMarkReadHandler(_req: Request, id: string): Promise<Response> {
  const result = await markNotificationRead(id);
  if (!result.ok) {
    return NextResponse.json(
      { error: "not_found", message: result.error },
      { status: result.status },
    );
  }
  return NextResponse.json({ id: result.id, isRead: true });
}

export async function notificationsMarkAllReadHandler(): Promise<Response> {
  const result = await markAllNotificationsRead();
  return NextResponse.json(result);
}
