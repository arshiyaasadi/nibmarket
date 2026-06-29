import { NextResponse } from "next/server";
import { getCurrentUserId, unauthorized } from "@/lib/api/server/session";
import { getLeaderboard } from "@/lib/db/repositories/leaderboard.repository";
import { getDashboardMissions } from "@/lib/db/repositories/mission.repository";
import { getSubsetDeposits } from "@/lib/db/repositories/subset-deposits.repository";
import { findUserById } from "@/lib/db/repositories/user.repository";
import { getRewardCards, getWalletSummary } from "@/lib/db/repositories/wallet.repository";

export async function dashboardRewardsHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();
  return NextResponse.json(await getRewardCards(userId));
}

export async function dashboardWalletHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();
  return NextResponse.json(await getWalletSummary(userId));
}

export async function dashboardLeaderboardHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();
  return NextResponse.json(await getLeaderboard(userId, 10));
}

export async function dashboardMissionsHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();
  return NextResponse.json(await getDashboardMissions(userId));
}

export async function dashboardSubsetDepositsHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();
  return NextResponse.json(await getSubsetDeposits(userId));
}

export async function dashboardReferralHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();
  const user = await findUserById(userId);
  if (!user) return unauthorized();
  return NextResponse.json({
    inviteCode: user.referral_code,
    referralCode: user.referral_code,
  });
}

export async function emptyDashboardHandler(): Promise<Response> {
  return NextResponse.json({});
}
