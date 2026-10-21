import { NextResponse } from "next/server";
import { isApiServiceMode } from "@/lib/api/server/services";
import { backendApiGet } from "@/lib/api/server/services/backend-api-service";
import { getCurrentUserId, unauthorized } from "@/lib/api/server/session";
import { filterMissionsBySection, type MissionSectionId } from "@/lib/missions/categories";
import { MARKETING_BADGES } from "@/resources/data/marketing-badges";
import { mergeMehrUserMissions } from "@/resources/data/mehr-missions";
import {
  completeMissionByCode,
  getMissionActivity,
  getMissionsList,
} from "@/lib/mock/repositories/mission.repository";
import type { MarketingBadgeItem, MissionActivityStatus, MissionDef } from "@/types/mlm";

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

/** Load live list when possible; fill gaps from Mehr seed. */
async function resolveMergedMissions(req: Request, userId: string): Promise<MissionDef[]> {
  if (isApiServiceMode()) {
    try {
      const list = await backendApiGet<MissionDef[]>("/missions/list", req);
      return mergeMehrUserMissions(Array.isArray(list) ? list : []);
    } catch {
      return mergeMehrUserMissions([]);
    }
  }
  return mergeMehrUserMissions(await getMissionsList(userId));
}

function createSectionHandler(section: MissionSectionId) {
  return async (req: Request): Promise<Response> => {
    const userId = getCurrentUserId(req);
    if (!userId) return unauthorized();
    const merged = await resolveMergedMissions(req, userId);
    const items = filterMissionsBySection(merged, section);
    return NextResponse.json({ items });
  };
}

export const missionsSectionPromotionHandler = createSectionHandler("promotion");
export const missionsSectionOnboardingHandler = createSectionHandler("onboarding");
export const missionsSectionMarketingHandler = createSectionHandler("marketing");

/** UI-dev / mock-mode badges — api mode proxies GET /missions/sections/badges to club BE. */
export async function missionsSectionBadgesHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();

  const merged = await resolveMergedMissions(req, userId);
  const byCode = new Map(merged.map((m) => [m.code, m]));

  const items: MarketingBadgeItem[] = MARKETING_BADGES.map((badge) => {
    const mission = byCode.get(badge.missionCode);
    const unlocked = Boolean(mission?.completed);
    return {
      code: badge.code,
      missionCode: badge.missionCode,
      title: badge.title,
      description: badge.description,
      reward: badge.reward,
      unlocked,
      achievedAt: unlocked ? (mission?.completedAt ?? null) : null,
      imageUrl: badge.imageSrc,
    };
  });

  return NextResponse.json({ items });
}

/** POST /missions/complete — body: `{ code: string }` */
export async function missionsCompleteHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();

  let body: { code?: string } = {};
  try {
    body = (await req.json()) as { code?: string };
  } catch {
    return NextResponse.json({ message: "invalid_body" }, { status: 400 });
  }

  const code = String(body.code ?? "").trim();
  if (!code) {
    return NextResponse.json({ message: "code_required" }, { status: 400 });
  }

  const result = await completeMissionByCode(null, userId, code);
  if (!result.completed && result.reward === 0) {
    return NextResponse.json({ message: "mission_not_found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    code,
    completed: true,
    reward: result.reward,
    alreadyCompleted: result.alreadyCompleted ?? false,
  });
}
