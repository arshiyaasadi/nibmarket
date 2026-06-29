import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { cookies } from "next/headers";
import { verifySignedToken } from "@/lib/api/server/session";

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

// GET /admin/stats
export async function adminStatsHandler(_req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const [totalUsers, activeUsers, activeMissions] = await Promise.all([
    prisma.users.count({ where: { deleted_at: null } }),
    prisma.users.count({ where: { deleted_at: null, status: "active" } }),
    prisma.missions.count({ where: { status: "active" } }),
  ]);

  return NextResponse.json({ totalUsers, activeUsers, activeMissions });
}

// GET /admin/users?page=0&pageSize=20&search=&status=
export async function adminUsersHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "0");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "20");
  const search = url.searchParams.get("search") ?? "";
  const status = url.searchParams.get("status") ?? "";

  // Build where clause
  const statusEnum = status as "active" | "suspended" | "pending_verification" | "closed" | undefined;
  const where = {
    deleted_at: null as null,
    ...(statusEnum ? { status: statusEnum } : {}),
    ...(search ? {
      OR: [
        { mobile: { contains: search } },
        { email: { contains: search, mode: "insensitive" as const } },
      ],
    } : {}),
  };

  const [users, total] = await Promise.all([
    prisma.users.findMany({
      where,
      skip: page * pageSize,
      take: pageSize,
      orderBy: { created_at: "desc" },
    }),
    prisma.users.count({ where }),
  ]);

  // Fetch profiles and roles separately
  const userIds = users.map(u => u.id);

  const [profiles, userRoles] = await Promise.all([
    userIds.length > 0
      ? prisma.user_profiles.findMany({ where: { user_id: { in: userIds } } })
      : Promise.resolve([]),
    userIds.length > 0
      ? prisma.user_roles.findMany({ where: { user_id: { in: userIds } }, orderBy: { granted_at: "desc" } })
      : Promise.resolve([]),
  ]);

  // Fetch role codes
  const roleIds = [...new Set(userRoles.map(ur => ur.role_id))];
  const roles = roleIds.length > 0
    ? await prisma.roles.findMany({ where: { id: { in: roleIds } }, select: { id: true, code: true } })
    : [];

  const profileMap = new Map(profiles.map(p => [p.user_id, p]));
  const roleCodeMap = new Map(roles.map(r => [r.id, r.code]));
  // Get first role per user
  const userRoleMap = new Map<string, string>();
  for (const ur of userRoles) {
    if (!userRoleMap.has(ur.user_id)) {
      userRoleMap.set(ur.user_id, roleCodeMap.get(ur.role_id) ?? "client");
    }
  }

  const data = users.map(u => ({
    id: u.id,
    mobile: u.mobile,
    email: u.email,
    firstName: profileMap.get(u.id)?.first_name ?? "",
    lastName: profileMap.get(u.id)?.last_name ?? "",
    role: userRoleMap.get(u.id) ?? "client",
    status: u.status,
    kycStatus: u.kyc_status,
    referralCode: u.referral_code,
    createdAt: u.created_at,
  }));

  return NextResponse.json({ data, total, page, pageSize, pageCount: Math.ceil(total / pageSize) });
}

// PATCH /admin/users/:id/status
export async function adminUserStatusHandler(req: Request, userId: string): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  const body = await req.json().catch(() => ({})) as { status?: string };
  const { status } = body;
  if (!["active", "suspended", "pending_verification", "closed"].includes(status ?? "")) return badRequest("Invalid status");
  await prisma.users.update({ where: { id: userId }, data: { status: status as "active" | "suspended" | "pending_verification" | "closed" } });
  return NextResponse.json({ ok: true });
}

// PATCH /admin/users/:id/role
export async function adminUserRoleHandler(req: Request, userId: string): Promise<Response> {
  const isSuperAdmin = await requireSuperAdmin();
  if (!isSuperAdmin) return unauthorized();
  const body = await req.json().catch(() => ({})) as { roleCode?: string };
  const { roleCode } = body;
  if (!roleCode) return badRequest("roleCode required");

  const role = await prisma.roles.findFirst({ where: { code: roleCode } });
  if (!role) return notFound("Role not found");

  // Upsert: delete existing then create (since no upsert with composite key without relations)
  await prisma.user_roles.deleteMany({ where: { user_id: userId, role_id: role.id } });
  await prisma.user_roles.create({ data: { user_id: userId, role_id: role.id } });
  return NextResponse.json({ ok: true });
}

// GET /admin/network/closure?userId=&depth=&page=&pageSize=
export async function adminNetworkClosureHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const url = new URL(req.url);
  const userId = url.searchParams.get("userId") ?? "";
  const depthStr = url.searchParams.get("depth");
  const depth = depthStr ? parseInt(depthStr) : undefined;
  const page = parseInt(url.searchParams.get("page") ?? "0");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "50");

  type ClosureWhere = {
    ancestor_id?: string;
    depth?: number;
  };
  const where: ClosureWhere = {};
  if (userId) where.ancestor_id = userId;
  if (depth !== undefined) where.depth = depth;

  const [rows, total] = await Promise.all([
    prisma.network_closure.findMany({
      where,
      skip: page * pageSize,
      take: pageSize,
      orderBy: [{ depth: "asc" }],
    }),
    prisma.network_closure.count({ where }),
  ]);

  // Fetch user details separately
  const allUserIds = [...new Set([...rows.map(r => r.ancestor_id), ...rows.map(r => r.descendant_id)])];
  const [usersData, profilesData] = await Promise.all([
    allUserIds.length > 0
      ? prisma.users.findMany({ where: { id: { in: allUserIds } }, select: { id: true, mobile: true, referral_code: true } })
      : Promise.resolve([]),
    allUserIds.length > 0
      ? prisma.user_profiles.findMany({ where: { user_id: { in: allUserIds } }, select: { user_id: true, first_name: true, last_name: true } })
      : Promise.resolve([]),
  ]);

  const userMap = new Map(usersData.map(u => [u.id, u]));
  const profileMap = new Map(profilesData.map(p => [p.user_id, p]));

  function getUserLabel(id: string) {
    const u = userMap.get(id);
    const p = profileMap.get(id);
    const name = `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim();
    return { name: name || u?.mobile || id, code: u?.referral_code ?? "" };
  }

  const data = rows.map(r => ({
    ancestorId: r.ancestor_id,
    ancestorName: getUserLabel(r.ancestor_id).name,
    ancestorCode: getUserLabel(r.ancestor_id).code,
    descendantId: r.descendant_id,
    descendantName: getUserLabel(r.descendant_id).name,
    descendantCode: getUserLabel(r.descendant_id).code,
    depth: r.depth,
  }));

  return NextResponse.json({ data, total, page, pageSize, pageCount: Math.ceil(total / pageSize) });
}

// GET /admin/missions/list
export async function adminMissionsListHandler(_req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const missions = await prisma.missions.findMany({
    where: { deleted_at: null },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(missions.map(m => ({
    id: m.id,
    code: m.code,
    title: m.title,
    description: m.description,
    missionType: m.mission_type,
    rewardAmount: m.reward_amount ? Number(m.reward_amount) : 0,
    criteria: m.criteria,
    verificationMode: m.verification_mode,
    status: m.status,
    startDate: m.start_at,
    endDate: m.end_at,
    createdAt: m.created_at,
  })));
}

// POST /admin/missions/create
export async function adminMissionsCreateHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const body = await req.json().catch(() => ({})) as {
    code?: string; title?: string; description?: string;
    missionType?: string; rewardAmount?: number; criteria?: unknown;
    verificationMode?: string; startDate?: string; endDate?: string; status?: string;
  };
  const { code, title, description, missionType, rewardAmount, criteria, verificationMode, startDate, endDate, status } = body;
  if (!code || !title || !missionType) return badRequest("code, title, missionType are required");

  const mission = await prisma.missions.create({
    data: {
      code,
      title,
      description: description ?? null,
      mission_type: missionType as "referral_count" | "purchase" | "registration" | "fund_issue" | "custom",
      reward_amount: rewardAmount ?? 0,
      criteria: (criteria ?? {}) as object,
      verification_mode: (verificationMode ?? "auto") as "auto" | "manual",
      start_at: startDate ? new Date(startDate) : null,
      end_at: endDate ? new Date(endDate) : null,
      status: (status ?? "draft") as "draft" | "active" | "paused" | "archived",
    },
  });

  return NextResponse.json({ id: mission.id });
}

// PATCH /admin/missions/:id
export async function adminMissionsUpdateHandler(req: Request, missionId: string): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const body = await req.json().catch(() => ({})) as {
    status?: string; title?: string; description?: string;
    rewardAmount?: number; criteria?: unknown;
    startDate?: string | null; endDate?: string | null; verificationMode?: string;
  };
  const { status, title, description, rewardAmount, criteria, startDate, endDate, verificationMode } = body;

  const data: Record<string, unknown> = {};
  if (status !== undefined) data.status = status;
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (rewardAmount !== undefined) data.reward_amount = rewardAmount;
  if (criteria !== undefined) data.criteria = criteria;
  if (startDate !== undefined) data.start_at = startDate ? new Date(startDate) : null;
  if (endDate !== undefined) data.end_at = endDate ? new Date(endDate) : null;
  if (verificationMode !== undefined) data.verification_mode = verificationMode;

  await prisma.missions.update({ where: { id: missionId }, data });
  return NextResponse.json({ ok: true });
}

// GET /admin/admins/list
export async function adminAdminsListHandler(_req: Request): Promise<Response> {
  const isSuperAdmin = await requireSuperAdmin();
  if (!isSuperAdmin) return unauthorized();

  const adminRoles = await prisma.roles.findMany({ where: { code: { in: ["admin", "manager"] } } });
  const roleIds = adminRoles.map(r => r.id);

  const assignments = await prisma.user_roles.findMany({
    where: { role_id: { in: roleIds } },
    orderBy: { granted_at: "desc" },
  });

  const userIds = [...new Set(assignments.map(a => a.user_id))];
  const [usersData, profilesData] = await Promise.all([
    userIds.length > 0
      ? prisma.users.findMany({ where: { id: { in: userIds } }, select: { id: true, mobile: true, email: true, status: true } })
      : Promise.resolve([]),
    userIds.length > 0
      ? prisma.user_profiles.findMany({ where: { user_id: { in: userIds } }, select: { user_id: true, first_name: true, last_name: true } })
      : Promise.resolve([]),
  ]);

  const userMap = new Map(usersData.map(u => [u.id, u]));
  const profileMap = new Map(profilesData.map(p => [p.user_id, p]));
  const roleMap = new Map(adminRoles.map(r => [r.id, r]));

  return NextResponse.json(assignments.map(a => {
    const u = userMap.get(a.user_id);
    const p = profileMap.get(a.user_id);
    const r = roleMap.get(a.role_id);
    const fullName = `${p?.first_name ?? ""} ${p?.last_name ?? ""}`.trim() || u?.mobile || "";
    return {
      userId: a.user_id,
      mobile: u?.mobile ?? "",
      email: u?.email ?? null,
      fullName,
      role: r?.code ?? "",
      roleName: r?.name ?? "",
      permissions: r?.permissions,
      grantedAt: a.granted_at,
    };
  }));
}

// POST /admin/admins/assign
export async function adminAdminsAssignHandler(req: Request): Promise<Response> {
  const isSuperAdmin = await requireSuperAdmin();
  if (!isSuperAdmin) return unauthorized();

  const body = await req.json().catch(() => ({})) as { userId?: string; roleCode?: string };
  const { userId, roleCode } = body;
  if (!userId || !roleCode) return badRequest("userId and roleCode required");
  if (!["admin", "manager"].includes(roleCode)) return badRequest("Invalid role");

  const user = await prisma.users.findFirst({ where: { id: userId, deleted_at: null } });
  if (!user) return notFound("User not found");

  const role = await prisma.roles.findFirst({ where: { code: roleCode } });
  if (!role) return notFound("Role not found");

  await prisma.user_roles.deleteMany({ where: { user_id: userId, role_id: role.id } });
  await prisma.user_roles.create({ data: { user_id: userId, role_id: role.id } });

  return NextResponse.json({ ok: true });
}

// DELETE /admin/admins/revoke/:id
export async function adminAdminsRevokeHandler(req: Request, userId: string): Promise<Response> {
  const isSuperAdmin = await requireSuperAdmin();
  if (!isSuperAdmin) return unauthorized();

  const adminRoles = await prisma.roles.findMany({ where: { code: { in: ["admin", "manager"] } } });
  const roleIds = adminRoles.map(r => r.id);

  await prisma.user_roles.deleteMany({ where: { user_id: userId, role_id: { in: roleIds } } });
  return NextResponse.json({ ok: true });
}
