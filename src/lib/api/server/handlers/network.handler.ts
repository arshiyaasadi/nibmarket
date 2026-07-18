import { NextResponse } from "next/server";
import { getCurrentUserId, unauthorized } from "@/lib/api/server/session";
import {
  getNetworkInvited,
  getNetworkSubsets,
  getNetworkTree,
  getInviteQuota,
  sendInviteLetter,
  submitReferrer,
} from "@/lib/mock/repositories/network.repository";

export async function networkSubsetsHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();
  return NextResponse.json(await getNetworkSubsets(userId));
}

export async function networkTreeHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();
  return NextResponse.json(await getNetworkTree(userId));
}

export async function networkInvitedHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();

  const url = new URL(req.url);
  return NextResponse.json(
    await getNetworkInvited(userId, {
      status: url.searchParams.get("status") ?? "all",
      q: url.searchParams.get("q") ?? "",
    }),
  );
}

export async function networkFundsHandler(): Promise<Response> {
  return NextResponse.json([]);
}

export async function sendInviteHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const result = await sendInviteLetter(userId, {
    firstName: String(body.firstName ?? ""),
    lastName: String(body.lastName ?? ""),
    mobile: String(body.mobile ?? ""),
    fundId: String(body.fundId ?? ""),
    message: body.message ? String(body.message) : undefined,
    templateId: body.templateId ? String(body.templateId) : undefined,
  });

  if (!result.success) {
    const status = result.message === "LIMIT" ? 429 : 400;
    return NextResponse.json(
      { message: result.message ?? "SEND_FAILED", remaining: result.remaining },
      { status },
    );
  }
  return NextResponse.json(result);
}

export async function getInviteQuotaHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();
  return NextResponse.json(await getInviteQuota(userId));
}

export async function submitReferrerHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();
  const body = await req.json().catch(() => ({}));
  const result = await submitReferrer(userId, String(body.referralCode ?? body.inviteCode ?? ""));
  if (!result.success) {
    return NextResponse.json(
      { message: result.message ?? "INVALID_REFERRAL_CODE" },
      { status: 400 },
    );
  }
  return NextResponse.json(result);
}
