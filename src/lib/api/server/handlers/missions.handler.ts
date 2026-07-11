import { NextResponse } from "next/server";
import { getCurrentUserId, unauthorized } from "@/lib/api/server/session";
import { getMissionActivity, getMissionsList } from "@/lib/mock/repositories/mission.repository";
import type { MissionActivityStatus } from "@/types/mlm";

export async function missionsListHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();
  return NextResponse.json(await getMissionsList(userId));
}

export async function missionsActivityHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") ?? "1");
  const status = (url.searchParams.get("status") ?? "all") as MissionActivityStatus | "all";
  return NextResponse.json(await getMissionActivity(userId, { page, status }));
}
