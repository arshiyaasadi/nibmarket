import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifySignedToken } from "@/lib/api/server/session";
import {
  assignAdminRole,
  createAdminMission,
  getAdminStats,
  listAdminAssignments,
  listAdminMissions,
  listAdminUsers,
  listNetworkClosure,
  revokeAdminRole,
  updateAdminMission,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "@/lib/mock/admin";

function unauthorized(msg = "Unauthorized") {
  return NextResponse.json({ error: msg }, { status: 401 });
}
function badRequest(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}
function notFound(msg = "Not found") {
  return NextResponse.json({ error: msg }, { status: 404 });
}

async function requireAdmin(): Promise<{ role: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("nib_token")?.value;
  if (!token) return null;
  const claims = verifySignedToken(token, "access");
  if (!claims) return null;
  if (claims.role !== "admin" && claims.role !== "manager") return null;
  return { role: claims.role };
}

async function requireSuperAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("nib_token")?.value;
  if (!token) return false;
  const claims = verifySignedToken(token, "access");
  return claims?.role === "admin";
}

export async function adminStatsHandler(_req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  return NextResponse.json(await getAdminStats());
}

export async function adminUsersHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "0");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "20");
  const search = url.searchParams.get("search") ?? "";
  const status = url.searchParams.get("status") ?? "";

  return NextResponse.json(await listAdminUsers({ page, pageSize, search, status }));
}

export async function adminUserStatusHandler(req: Request, userId: string): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { status?: string };
  const { status } = body;
  if (!["active", "suspended", "pending_verification", "closed"].includes(status ?? "")) {
    return badRequest("Invalid status");
  }
  const ok = await updateAdminUserStatus(userId, status!);
  if (!ok) return notFound("User not found");
  return NextResponse.json({ ok: true });
}

export async function adminUserRoleHandler(req: Request, userId: string): Promise<Response> {
  const isSuperAdmin = await requireSuperAdmin();
  if (!isSuperAdmin) return unauthorized();
  const body = (await req.json().catch(() => ({}))) as { roleCode?: string };
  const { roleCode } = body;
  if (!roleCode) return badRequest("roleCode required");
  const ok = await updateAdminUserRole(userId, roleCode);
  if (!ok) return notFound("User not found");
  return NextResponse.json({ ok: true });
}

export async function adminNetworkClosureHandler(_req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  return NextResponse.json(await listNetworkClosure());
}

export async function adminMissionsListHandler(_req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  return NextResponse.json(await listAdminMissions());
}

export async function adminMissionsCreateHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const body = (await req.json().catch(() => ({}))) as {
    code?: string;
    title?: string;
    description?: string;
    missionType?: string;
    rewardAmount?: number;
  };
  const { code, title, description, missionType, rewardAmount } = body;
  if (!code || !title || !missionType) return badRequest("code, title, missionType are required");

  const id = await createAdminMission({ code, title, description, missionType, rewardAmount });
  return NextResponse.json({ id });
}

export async function adminMissionsUpdateHandler(
  req: Request,
  missionId: string,
): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const body = (await req.json().catch(() => ({}))) as { status?: string; title?: string };
  const ok = await updateAdminMission(missionId, body);
  if (!ok) return notFound("Mission not found");
  return NextResponse.json({ ok: true });
}

export async function adminAdminsListHandler(_req: Request): Promise<Response> {
  const isSuperAdmin = await requireSuperAdmin();
  if (!isSuperAdmin) return unauthorized();
  return NextResponse.json(await listAdminAssignments());
}

export async function adminAdminsAssignHandler(req: Request): Promise<Response> {
  const isSuperAdmin = await requireSuperAdmin();
  if (!isSuperAdmin) return unauthorized();

  const body = (await req.json().catch(() => ({}))) as { userId?: string; roleCode?: string };
  const { userId, roleCode } = body;
  if (!userId || !roleCode) return badRequest("userId and roleCode required");
  if (!["admin", "manager"].includes(roleCode)) return badRequest("Invalid role");

  const ok = await assignAdminRole(userId, roleCode);
  if (!ok) return notFound("User not found");
  return NextResponse.json({ ok: true });
}

export async function adminAdminsRevokeHandler(_req: Request, userId: string): Promise<Response> {
  const isSuperAdmin = await requireSuperAdmin();
  if (!isSuperAdmin) return unauthorized();

  const ok = await revokeAdminRole(userId);
  if (!ok) return notFound("User not found");
  return NextResponse.json({ ok: true });
}
