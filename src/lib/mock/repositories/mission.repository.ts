import { formatDateTime } from "@/lib/utils";
import { getMockMissionActivity, getMockMissions } from "@/lib/mock/store";
import type { Mission, MissionActivityPage, MissionActivityStatus, MissionDef } from "@/types/mlm";

export async function completeMissionByCode(
  _tx: unknown,
  _userId: string,
  _code: string,
): Promise<{ completed: boolean; reward: number }> {
  return { completed: false, reward: 0 };
}

export async function completeRegistrationMissionIfNeeded(_userId: string): Promise<void> {
  return;
}

export async function getMissionsList(_userId: string): Promise<MissionDef[]> {
  return getMockMissions();
}

export async function getDashboardMissions(_userId: string): Promise<Mission[]> {
  const list = await getMissionsList(_userId);
  return list.slice(0, 5).map((mission) => ({
    id: mission.id,
    code: mission.code,
    title: mission.title,
    completed: mission.completed ?? false,
    reward: `${mission.reward} توکن`,
  }));
}

export async function getMissionActivity(
  _userId: string,
  params: { page?: number; status?: MissionActivityStatus | "all" },
): Promise<MissionActivityPage> {
  const page = Math.max(params.page ?? 1, 1);
  const limit = 10;
  let items = getMockMissionActivity().map((item) => ({
    ...item,
    date: formatDateTime(item.date),
  }));

  if (params.status && params.status !== "all") {
    items = items.filter((item) => item.status === params.status);
  }

  const start = (page - 1) * limit;
  const slice = items.slice(start, start + limit);

  return {
    items: slice,
    hasMore: start + limit < items.length,
    total: items.length,
  };
}
