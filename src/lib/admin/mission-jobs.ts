import type { AdminMissionJobMeta, AdminMissionListItem } from "@/types/admin";

const MISSION_JOB_CONFIG: Record<
  string,
  AdminMissionJobMeta & { verificationMode: "auto" | "manual" }
> = {
  daily_login: {
    jobId: "job-mission-daily-login",
    jobName: "DailyLoginMissionJob",
    schedule: "0 0 * * *",
    verificationMode: "auto",
  },
  referral_3: {
    jobId: "job-mission-referral-count",
    jobName: "ReferralCountMissionJob",
    schedule: "*/15 * * * *",
    verificationMode: "auto",
  },
  invite_new: {
    jobId: "job-mission-invite-new",
    jobName: "InviteNewMissionJob",
    schedule: "*/5 * * * *",
    verificationMode: "auto",
  },
};

const DEFAULT_JOB: AdminMissionJobMeta & { verificationMode: "auto" | "manual" } = {
  jobId: "job-mission-generic",
  jobName: "GenericMissionJob",
  schedule: "0 * * * *",
  verificationMode: "auto",
};

export function resolveMissionJobConfig(code: string) {
  return MISSION_JOB_CONFIG[code] ?? { ...DEFAULT_JOB, jobId: `job-mission-${code}` };
}

/** Ensures legacy API rows (without nested `job`) render safely. */
export function normalizeAdminMissionListItem(
  item: Partial<AdminMissionListItem> & Pick<AdminMissionListItem, "id" | "code" | "title">,
): AdminMissionListItem {
  const jobConfig = resolveMissionJobConfig(item.code);
  return {
    id: item.id,
    code: item.code,
    title: item.title,
    description: item.description ?? null,
    missionType: item.missionType ?? "custom",
    rewardAmount: item.rewardAmount ?? 0,
    verificationMode: item.verificationMode ?? jobConfig.verificationMode,
    status: item.status ?? "active",
    job: item.job ?? {
      jobId: jobConfig.jobId,
      jobName: jobConfig.jobName,
      schedule: jobConfig.schedule,
    },
    createdAt: item.createdAt ?? new Date().toISOString(),
  };
}

export function normalizeAdminMissionList(
  items: Array<Partial<AdminMissionListItem> & Pick<AdminMissionListItem, "id" | "code" | "title">>,
): AdminMissionListItem[] {
  return items.map(normalizeAdminMissionListItem);
}
