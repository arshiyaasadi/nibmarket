import { NextResponse } from "next/server";
import { normalizeAdminMissionList } from "@/lib/admin/mission-jobs";
import { cookies } from "next/headers";
import { verifySignedToken } from "@/lib/api/server/session";
import {
  getAdminStats,
  getAdminTwinOverview,
  getAdminUserProfile,
  getAdminUsersDemographics,
  getAdminUsersKycSummary,
  getAdminMissionJobsHealth,
  getAdminMissionsOverview,
  listAdminMissionCompletions,
  listAdminTwinSources,
  listAdminTwinTransactions,
  listAdminTwinSupplyAdjustments,
  createAdminTwinSupplyAdjustment,
  listAdminTwinTokenPrices,
  createAdminTwinTokenPrice,
  listAdminMissions,
  listAdminUsers,
  listNetworkClosure,
  syncAdminUsersFromNibmarket,
  updateAdminMissionStatus,
  updateAdminUserRole,
  updateAdminUserStatus,
} from "@/lib/mock/admin";
import {
  getAdminPoolOverview,
  listAdminPoolParticipants,
  listAdminPoolPeriods,
  listAdminPoolTransactions,
} from "@/lib/mock/admin-pool";
import type { AdminPoolTransactionTypeFilter } from "@/types/admin";
import {
  getAdminInviteOverview,
  listAdminInviteLogs,
  listAdminInviteTemplates,
  createAdminInviteTemplate,
  deleteAdminInviteTemplate,
  updateAdminInviteTemplate,
} from "@/lib/mock/admin-network";
import {
  getAdminSedimentJob,
  getAdminSedimentOverview,
  listAdminNibMarketAssets,
  listAdminSedimentDeposits,
} from "@/lib/mock/admin-sediment";
import { handleAdminLogin } from "@/lib/api/server/dev-admin-auth";
import {
  getAdminUserGeoPoints,
  getAdminUsersPostalCodes,
  lookupAdminUserGeoByMobile,
} from "@/lib/mock/user-geo";
import { isMockDevelopmentMode } from "@/config/api-service";

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
  if (isMockDevelopmentMode()) return { role: "admin" };

  const cookieStore = await cookies();
  const token = cookieStore.get("nib_token")?.value;
  if (!token) return null;
  const claims = verifySignedToken(token, "access");
  if (!claims) return null;
  if (claims.role !== "admin" && claims.role !== "manager") return null;
  return { role: claims.role };
}

async function requireSuperAdmin(): Promise<boolean> {
  if (isMockDevelopmentMode()) return true;

  const cookieStore = await cookies();
  const token = cookieStore.get("nib_token")?.value;
  if (!token) return false;
  const claims = verifySignedToken(token, "access");
  return claims?.role === "admin";
}

export async function adminLoginHandler(req: Request): Promise<Response> {
  return handleAdminLogin(req);
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
  const hasSejamRaw = url.searchParams.get("hasSejamIdentity") ?? "";
  const hasSejamIdentity =
    hasSejamRaw === "true" || hasSejamRaw === "false" ? hasSejamRaw : ("" as const);

  return NextResponse.json(
    await listAdminUsers({ page, pageSize, search, status, hasSejamIdentity }),
  );
}

/** POST /admin/users/sync — refresh users from Nibmarket (empty body). */
export async function adminUsersSyncHandler(_req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  return NextResponse.json(await syncAdminUsersFromNibmarket());
}

export async function adminUsersDemographicsHandler(_req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  return NextResponse.json(await getAdminUsersDemographics());
}

/** GET /admin/users/kyc-summary — verified / unverified identity counts. */
export async function adminUsersKycSummaryHandler(_req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  return NextResponse.json(await getAdminUsersKycSummary());
}

/**
 * The density map is fixture-only in every mode, so it accepts any authenticated
 * session: in API mode `nib_token` holds a backend token that is not locally verifiable.
 */
export async function adminUsersGeoHandler(_req: Request): Promise<Response> {
  if (!isMockDevelopmentMode()) {
    const cookieStore = await cookies();
    if (!cookieStore.get("nib_token")?.value) return unauthorized();
  }
  return NextResponse.json(getAdminUserGeoPoints());
}

/** GET /admin/users/postal-codes — postal code strings only for density totals / later geo decode. */
export async function adminUsersPostalCodesHandler(_req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  return NextResponse.json(getAdminUsersPostalCodes());
}

/** GET /admin/users/geo/lookup?mobile= — pin/search one user by mobile. */
export async function adminUsersGeoLookupHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  const mobile = new URL(req.url).searchParams.get("mobile") ?? "";
  return NextResponse.json(lookupAdminUserGeoByMobile(mobile));
}

export async function adminUserDetailHandler(_req: Request, userId: string): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  const profile = await getAdminUserProfile(userId);
  if (!profile) return notFound("User not found");
  return NextResponse.json(profile);
}

export async function adminTwinOverviewHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  const url = new URL(req.url);
  return NextResponse.json(
    await getAdminTwinOverview({
      year: url.searchParams.get("year"),
      month: url.searchParams.get("month"),
    }),
  );
}

export async function adminTwinSourcesHandler(_req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  return NextResponse.json(await listAdminTwinSources());
}

export async function adminTwinTransactionsHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "0");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "20");
  const search = url.searchParams.get("search") ?? "";
  const source = url.searchParams.get("source") ?? "";
  const year = url.searchParams.get("year");
  const month = url.searchParams.get("month");

  return NextResponse.json(
    await listAdminTwinTransactions({ page, pageSize, search, source, year, month }),
  );
}

export async function adminTwinSupplyAdjustmentsListHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "0");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "20");

  return NextResponse.json(await listAdminTwinSupplyAdjustments({ page, pageSize }));
}

export async function adminTwinSupplyAdjustmentsCreateHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  let body: { amount?: number; effectiveDate?: string; note?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return badRequest("Invalid JSON");
  }

  const amount = Number(body.amount);
  const effectiveDate = String(body.effectiveDate ?? "").trim();
  if (!Number.isFinite(amount) || amount <= 0)
    return badRequest("amount must be a positive number");
  if (!effectiveDate) return badRequest("effectiveDate is required");

  try {
    const result = await createAdminTwinSupplyAdjustment(
      { amount, effectiveDate, note: body.note },
      { name: "مدیر سیستم" },
    );
    return NextResponse.json(result);
  } catch (error) {
    const code = error instanceof Error ? error.message : "FAILED";
    return badRequest(code);
  }
}

export async function adminTwinTokenPricesListHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "0");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "20");

  return NextResponse.json(await listAdminTwinTokenPrices({ page, pageSize }));
}

export async function adminTwinTokenPricesCreateHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  let body: { priceToman?: number; note?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return badRequest("Invalid JSON");
  }

  const priceToman = Number(body.priceToman);
  if (!Number.isFinite(priceToman) || priceToman <= 0)
    return badRequest("priceToman must be a positive number");

  try {
    const result = await createAdminTwinTokenPrice(
      { priceToman, note: body.note },
      { name: "مدیر سیستم" },
    );
    return NextResponse.json(result);
  } catch (error) {
    const code = error instanceof Error ? error.message : "FAILED";
    return badRequest(code);
  }
}

export async function adminPoolOverviewHandler(_req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  return NextResponse.json(await getAdminPoolOverview());
}

export async function adminPoolParticipantsHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "0");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "20");
  const search = url.searchParams.get("search") ?? "";

  return NextResponse.json(await listAdminPoolParticipants({ page, pageSize, search }));
}

export async function adminPoolPeriodsHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "0");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "10");
  const search = url.searchParams.get("search") ?? "";

  return NextResponse.json(await listAdminPoolPeriods({ page, pageSize, search }));
}

export async function adminPoolTransactionsHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "0", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "20", 10);
  const search = url.searchParams.get("search") ?? "";
  const type = (url.searchParams.get("type") ?? "") as AdminPoolTransactionTypeFilter;
  const yearRaw = url.searchParams.get("year");
  const monthRaw = url.searchParams.get("month");
  const year = yearRaw ? parseInt(yearRaw, 10) : undefined;
  const month = monthRaw ? parseInt(monthRaw, 10) : undefined;

  return NextResponse.json(
    await listAdminPoolTransactions({
      page,
      pageSize,
      search,
      type,
      year: Number.isFinite(year) ? year : undefined,
      month: Number.isFinite(month) ? month : undefined,
    }),
  );
}

export async function adminInviteOverviewHandler(_req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  return NextResponse.json(await getAdminInviteOverview());
}

export async function adminInviteLogHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "0");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "20");
  const search = url.searchParams.get("search") ?? "";

  return NextResponse.json(await listAdminInviteLogs({ page, pageSize, search }));
}

export async function adminInviteTemplatesHandler(_req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  return NextResponse.json(await listAdminInviteTemplates());
}

export async function adminInviteTemplateCreateHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const body = (await req.json().catch(() => ({}))) as { body?: string };
  if (!body.body?.trim()) return badRequest("body is required");

  const id = await createAdminInviteTemplate(body.body.trim());
  if (!id) return badRequest("body is required");
  return NextResponse.json({ id });
}

export async function adminInviteTemplateUpdateHandler(
  req: Request,
  templateId: string,
): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const body = (await req.json().catch(() => ({}))) as { body?: string };
  if (!body.body?.trim()) return badRequest("body is required");

  const ok = await updateAdminInviteTemplate(templateId, body.body.trim());
  if (!ok) return notFound("Template not found");
  return NextResponse.json({ ok: true });
}

export async function adminInviteTemplateDeleteHandler(
  _req: Request,
  templateId: string,
): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const ok = await deleteAdminInviteTemplate(templateId);
  if (!ok) return notFound("Template not found");
  return NextResponse.json({ ok: true });
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

export async function adminMissionsListHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "0");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "10");
  const search = url.searchParams.get("search") ?? "";

  const result = await listAdminMissions({ page, pageSize, search });
  return NextResponse.json({
    ...result,
    data: normalizeAdminMissionList(result.data),
  });
}

export async function adminMissionsJobsHealthHandler(_req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  return NextResponse.json(await getAdminMissionJobsHealth());
}

export async function adminMissionsOverviewHandler(_req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  return NextResponse.json(await getAdminMissionsOverview());
}

export async function adminMissionCompletionsHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "0");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "10");

  return NextResponse.json(await listAdminMissionCompletions({ page, pageSize }));
}

export async function adminMissionStatusHandler(
  req: Request,
  missionId: string,
): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const body = (await req.json().catch(() => ({}))) as { status?: string };
  const { status } = body;
  if (status !== "active" && status !== "paused") {
    return badRequest("status must be active or paused");
  }

  const ok = await updateAdminMissionStatus(missionId, status);
  if (!ok) return notFound("Mission not found");
  return NextResponse.json({ ok: true });
}

export async function adminSedimentOverviewHandler(_req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  return NextResponse.json(await getAdminSedimentOverview());
}

export async function adminSedimentJobHandler(_req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();
  return NextResponse.json(await getAdminSedimentJob());
}

export async function adminSedimentAssetsHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "0");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "20");
  const search = url.searchParams.get("search") ?? "";

  return NextResponse.json(await listAdminNibMarketAssets({ page, pageSize, search }));
}

export async function adminSedimentDepositsHandler(req: Request): Promise<Response> {
  const auth = await requireAdmin();
  if (!auth) return unauthorized();

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") ?? "0");
  const pageSize = parseInt(url.searchParams.get("pageSize") ?? "20");
  const search = url.searchParams.get("search") ?? "";
  const status = url.searchParams.get("status") ?? "";

  return NextResponse.json(await listAdminSedimentDeposits({ page, pageSize, search, status }));
}
