import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { isMockDevelopmentMode } from "@/config/api-service";
import { verifySignedToken } from "@/lib/api/server/session";
import {
  createNotificationGroup,
  createSystemMessage,
  deleteNotificationGroup,
  getNotificationGroup,
  listNotificationGroups,
  listSystemMessages,
  softDeleteSystemMessage,
  updateNotificationGroup,
} from "@/lib/mock/admin-system-messages";
import type { CreateNotificationGroupRequest, CreateSystemMessageRequest } from "@/types/admin";

function unauthorized(msg = "Unauthorized") {
  return NextResponse.json({ error: msg }, { status: 401 });
}
function badRequest(msg: string) {
  return NextResponse.json({ error: "bad_request", message: msg }, { status: 400 });
}
function notFound(msg = "Not found") {
  return NextResponse.json({ error: "not_found", message: msg }, { status: 404 });
}
function conflict(msg: string) {
  return NextResponse.json({ error: "conflict", message: msg }, { status: 409 });
}

async function requireAdmin(): Promise<{ role: string } | null> {
  if (isMockDevelopmentMode()) return { role: "admin" };

  const cookieStore = await cookies();
  const token = cookieStore.get("nib_token")?.value;
  if (!token) return null;
  const claims = verifySignedToken(token, "access");
  if (!claims) return null;
  if (claims.role !== "admin" && claims.role !== "manager") return null;
  return { role: claims.role };
}

export async function adminNotificationGroupsListHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "0", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "20", 10);
  const search = url.searchParams.get("search") ?? "";
  return NextResponse.json(await listNotificationGroups({ page, pageSize, search }));
}

export async function adminNotificationGroupCreateHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as CreateNotificationGroupRequest;
  const result = await createNotificationGroup(body);
  if (!result.ok) {
    if (result.status === 409) return conflict(result.error);
    return badRequest(result.error);
  }
  return NextResponse.json(result.group, { status: 201 });
}

export async function adminNotificationGroupGetHandler(
  _req: Request,
  id: string,
): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  const group = await getNotificationGroup(id);
  if (!group) return notFound("group not found");
  return NextResponse.json(group);
}

export async function adminNotificationGroupUpdateHandler(
  req: Request,
  id: string,
): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  const body = await req.json().catch(() => ({}));
  const result = await updateNotificationGroup(id, body);
  if (!result.ok) {
    if (result.status === 404) return notFound(result.error);
    if (result.status === 409) return conflict(result.error);
    return badRequest(result.error);
  }
  return NextResponse.json(result.group);
}

export async function adminNotificationGroupDeleteHandler(
  _req: Request,
  id: string,
): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  const result = await deleteNotificationGroup(id);
  if (!result.ok) return notFound(result.error);
  return NextResponse.json({ ok: true });
}

export async function adminSystemMessagesListHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "0", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "20", 10);
  const status = url.searchParams.get("status") ?? "";
  const search = url.searchParams.get("search") ?? "";
  return NextResponse.json(await listSystemMessages({ page, pageSize, status, search }));
}

export async function adminSystemMessageCreateHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as CreateSystemMessageRequest;
  const result = await createSystemMessage(body);
  if (!result.ok) return badRequest(result.error);
  return NextResponse.json(result.campaign, { status: 201 });
}

export async function adminSystemMessageDeleteHandler(
  _req: Request,
  id: string,
): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  const result = await softDeleteSystemMessage(id);
  if (!result.ok) return notFound(result.error);
  return NextResponse.json({
    id: result.campaign.id,
    status: result.campaign.status,
    deletedAt: result.campaign.deletedAt,
  });
}
