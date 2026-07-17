import { NextResponse } from "next/server";
import { getCurrentUserId, unauthorized } from "@/lib/api/server/session";
import {
  getCompetitionPool,
  getEmptyCompetitionHistory,
  getEmptyHonors,
  getLeaderboard,
  getMySubsetsLeaderboard,
  getPoolBalance,
} from "@/lib/mock/repositories/leaderboard.repository";
import { getDashboardMissions } from "@/lib/mock/repositories/mission.repository";

export async function leaderboardPoolBalanceHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();
  return NextResponse.json(await getPoolBalance(userId));
}

export async function leaderboardCurrentMonthHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();
  return NextResponse.json(await getLeaderboard(userId, 7));
}

export async function leaderboardMySubsetsHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();
  return NextResponse.json(await getMySubsetsLeaderboard(userId, 7));
}

export async function leaderboardMissionsHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();
  return NextResponse.json(await getDashboardMissions(userId));
}

export async function leaderboardCompetitionPoolHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();
  return NextResponse.json(await getCompetitionPool(userId));
}

export async function leaderboardHonorsHandler(): Promise<Response> {
  return NextResponse.json(await getEmptyHonors());
}

export async function leaderboardHistoryHandler(): Promise<Response> {
  return NextResponse.json(await getEmptyCompetitionHistory());
}
