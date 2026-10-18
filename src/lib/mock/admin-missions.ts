import { ensureMockStore, getMockMissions, getMockUsers, setMockMissions } from "./store";
import { MOCK_USER_ID } from "./fixtures";
import { normalizeAdminMissionListItem, resolveMissionJobConfig } from "@/lib/admin/mission-jobs";
import type {
  AdminMissionCompletionRow,
  AdminMissionCompletionsResponse,
  AdminMissionJobHealthStatus,
  AdminMissionJobsHealthResponse,
  AdminMissionListItem,
  AdminMissionsOverviewResponse,
  AdminMissionStatus,
} from "@/types/admin";
import type { MissionDef } from "@/types/mlm";

const MISSION_CREATED_AT: Record<string, string> = {
  m1: "2024-01-10T08:00:00.000Z",
  m2: "2024-02-15T10:30:00.000Z",
  m3: "2024-03-01T12:00:00.000Z",
};

function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

const ADMIN_MISSION_COMPLETIONS: Array<{
  id: string;
  userId: string;
  missionId: string;
  completedAt: string;
  rewardAmount: number;
}> = [
  {
    id: "mc-001",
    userId: MOCK_USER_ID,
    missionId: "m2",
    completedAt: isoHoursAgo(2),
    rewardAmount: 500,
  },
  {
    id: "mc-002",
    userId: "00000000-0000-4000-8000-000000000002",
    missionId: "m3",
    completedAt: isoHoursAgo(5),
    rewardAmount: 50,
  },
  {
    id: "mc-003",
    userId: "00000000-0000-4000-8000-000000000004",
    missionId: "m1",
    completedAt: isoHoursAgo(8),
    rewardAmount: 2,
  },
  {
    id: "mc-004",
    userId: "00000000-0000-4000-8000-000000000005",
    missionId: "m2",
    completedAt: isoHoursAgo(14),
    rewardAmount: 500,
  },
  {
    id: "mc-005",
    userId: MOCK_USER_ID,
    missionId: "m3",
    completedAt: isoHoursAgo(26),
    rewardAmount: 50,
  },
  {
    id: "mc-006",
    userId: "00000000-0000-4000-8000-000000000002",
    missionId: "m1",
    completedAt: isoHoursAgo(30),
    rewardAmount: 2,
  },
  {
    id: "mc-007",
    userId: "00000000-0000-4000-8000-000000000004",
    missionId: "m3",
    completedAt: isoHoursAgo(48),
    rewardAmount: 50,
  },
  {
    id: "mc-008",
    userId: "00000000-0000-4000-8000-000000000005",
    missionId: "m1",
    completedAt: isoHoursAgo(72),
    rewardAmount: 2,
  },
];

function toAdminMissionItem(m: MissionDef): AdminMissionListItem {
  const job = resolveMissionJobConfig(m.code);
  return normalizeAdminMissionListItem({
    id: m.id,
    code: m.code,
    title: m.title,
    description: m.description ?? null,
    missionType: m.missionType,
    rewardAmount: m.reward,
    verificationMode: job.verificationMode,
    status: m.status,
    job: {
      jobId: job.jobId,
      jobName: job.jobName,
      schedule: job.schedule,
    },
    createdAt: MISSION_CREATED_AT[m.id] ?? new Date().toISOString(),
  });
}

function deriveJobHealth(
  mission: MissionDef,
  job: ReturnType<typeof resolveMissionJobConfig>,
): AdminMissionJobsHealthResponse["jobs"][number] {
  const now = Date.now();
  const lastRunAt = new Date(now - 12 * 60 * 1000).toISOString();
  const lastSuccessAt = new Date(now - 11 * 60 * 1000).toISOString();
  const nextRunAt = new Date(now + 3 * 60 * 1000).toISOString();

  if (mission.status === "paused") {
    return {
      missionId: mission.id,
      missionCode: mission.code,
      missionTitle: mission.title,
      jobId: job.jobId,
      jobName: job.jobName,
      status: "degraded",
      lastRunAt,
      lastSuccessAt,
      nextRunAt: null,
      latencyMs: null,
      message: "mission_paused",
    };
  }

  if (mission.code === "invite_new") {
    return {
      missionId: mission.id,
      missionCode: mission.code,
      missionTitle: mission.title,
      jobId: job.jobId,
      jobName: job.jobName,
      status: "degraded",
      lastRunAt,
      lastSuccessAt: new Date(now - 45 * 60 * 1000).toISOString(),
      nextRunAt,
      latencyMs: 2840,
      message: "high_latency",
    };
  }

  return {
    missionId: mission.id,
    missionCode: mission.code,
    missionTitle: mission.title,
    jobId: job.jobId,
    jobName: job.jobName,
    status: "healthy",
    lastRunAt,
    lastSuccessAt,
    nextRunAt,
    latencyMs: mission.code === "daily_login" ? 120 : 340,
    message: null,
  };
}

function overallHealth(jobs: AdminMissionJobsHealthResponse["jobs"]): AdminMissionJobHealthStatus {
  if (jobs.some((j) => j.status === "down")) return "down";
  if (jobs.some((j) => j.status === "degraded")) return "degraded";
  if (jobs.every((j) => j.status === "healthy")) return "healthy";
  return "unknown";
}

export async function listAdminMissions(params: {
  page: number;
  pageSize: number;
  search: string;
}): Promise<import("@/types/admin").AdminMissionsListResponse> {
  let rows = getMockMissions().map(toAdminMissionItem);

  if (params.search) {
    const q = params.search.trim().toLowerCase();
    rows = rows.filter(
      (row) =>
        row.code.toLowerCase().includes(q) ||
        row.title.includes(params.search.trim()) ||
        row.job?.jobName.toLowerCase().includes(q) ||
        row.job?.jobId.toLowerCase().includes(q),
    );
  }

  const total = rows.length;
  const slice = rows.slice(params.page * params.pageSize, (params.page + 1) * params.pageSize);

  return {
    data: slice,
    total,
    page: params.page,
    pageSize: params.pageSize,
    pageCount: Math.ceil(total / params.pageSize) || 1,
  };
}

export async function updateAdminMissionStatus(
  missionId: string,
  status: AdminMissionStatus,
): Promise<boolean> {
  const missions = getMockMissions();
  const idx = missions.findIndex((m) => m.id === missionId);
  if (idx < 0) return false;
  missions[idx] = { ...missions[idx], status };
  setMockMissions([...missions]);
  return true;
}

export async function getAdminMissionJobsHealth(): Promise<AdminMissionJobsHealthResponse> {
  const missions = getMockMissions();
  const jobs = missions.map((m) => deriveJobHealth(m, resolveMissionJobConfig(m.code)));
  return {
    checkedAt: new Date().toISOString(),
    overallStatus: overallHealth(jobs),
    jobs,
  };
}

export async function getAdminMissionsOverview(): Promise<AdminMissionsOverviewResponse> {
  const missions = getMockMissions();
  return {
    missionCount: missions.length,
    activeMissionCount: missions.filter((m) => m.status === "active").length,
    jobCount: missions.length,
  };
}

function toCompletionRow(
  entry: (typeof ADMIN_MISSION_COMPLETIONS)[number],
): AdminMissionCompletionRow | null {
  const mission = getMockMissions().find((m) => m.id === entry.missionId);
  if (!mission) return null;

  const user = getMockUsers().get(entry.userId);
  return {
    id: entry.id,
    completedAt: entry.completedAt,
    userId: entry.userId,
    userFullName: user ? `${user.firstName} ${user.lastName}`.trim() : "—",
    userMobile: user?.mobile ?? "—",
    missionId: mission.id,
    missionCode: mission.code,
    missionTitle: mission.title,
    rewardAmount: entry.rewardAmount,
  };
}

export async function listAdminMissionCompletions(params: {
  page: number;
  pageSize: number;
}): Promise<AdminMissionCompletionsResponse> {
  await ensureMockStore();
  const rows = ADMIN_MISSION_COMPLETIONS.map(toCompletionRow)
    .filter((row): row is AdminMissionCompletionRow => row !== null)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  const total = rows.length;
  const slice = rows.slice(params.page * params.pageSize, (params.page + 1) * params.pageSize);

  return {
    data: slice,
    total,
    page: params.page,
    pageSize: params.pageSize,
    pageCount: Math.ceil(total / params.pageSize) || 1,
  };
}
