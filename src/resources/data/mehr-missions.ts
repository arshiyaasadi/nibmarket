import type { AdminMissionListItem } from "@/types/admin";
import type { MissionDef } from "@/types/mlm";

/**
 * TEMP (mlm-15): Marketing missions from PDF «تسک های mlm» (14 Mehr).
 * Backend has not seeded these yet — FE merges missing rows for user + admin display.
 * Remove this overlay when club-be ships the real seed (user will ask).
 */
export const MEHR_MISSIONS_PREVIEW_ENABLED = true;

export const MEHR_PREVIEW_ID_PREFIX = "mehr-preview-";

export type MehrMissionSeed = {
  code: string;
  title: string;
  description: string;
  reward: number;
  missionType: MissionDef["missionType"];
  /** once | recurring — display context only */
  frequency: "once" | "recurring";
};

export const MEHR_MISSIONS: MehrMissionSeed[] = [
  {
    code: "registration",
    title: "ثبت‌نام",
    description: "ثبت‌نام در سامانه (یک‌بار)",
    reward: 10,
    missionType: "registration",
    frequency: "once",
  },
  {
    code: "identity_verification",
    title: "احراز هویت",
    description: "تکمیل احراز هویت (یک‌بار)",
    reward: 40,
    missionType: "custom",
    frequency: "once",
  },
  {
    code: "first_referral",
    title: "اولین معرفی فرد جدید",
    description: "فقط برای اولین زیرمجموعه (یک‌بار)",
    reward: 300,
    missionType: "referral_count",
    frequency: "once",
  },
  {
    code: "monthly_referrals_3",
    title: "معرفی ۳ زیرمجموعه در ماه",
    description: "",
    reward: 500,
    missionType: "referral_count",
    frequency: "recurring",
  },
  {
    code: "new_referral",
    title: "معرفی فرد جدید",
    description: "",
    reward: 50,
    missionType: "referral_count",
    frequency: "recurring",
  },
  {
    code: "first_fund_purchase",
    title: "اولین خرید صندوق",
    description: "حداقل ۱۰ میلیون دارایی",
    reward: 100,
    missionType: "purchase",
    frequency: "once",
  },
  {
    code: "daily_login",
    title: "لاگین روزانه",
    description: "فقط برای کسانی که در زیرمجموعه‌شان دارایی است",
    reward: 2,
    missionType: "custom",
    frequency: "recurring",
  },
  {
    code: "training_level_1",
    title: "گذراندن دوره آموزشی سطح یک",
    description: "یک‌بار",
    reward: 200,
    missionType: "custom",
    frequency: "once",
  },
  {
    code: "direct_subsets_10",
    title: "رسیدن به ۱۰ زیرمجموعه",
    description: "یک‌بار + نشان پیشگام",
    reward: 3000,
    missionType: "referral_count",
    frequency: "once",
  },
  {
    code: "subsets_high_aum_1_5b",
    title: "۳ زیرمجموعه با دارایی بیش از ۱٫۵ میلیارد تومان",
    description: "در یک ماه + نشان معتبر",
    reward: 6000,
    missionType: "custom",
    frequency: "once",
  },
  {
    code: "network_all_funds",
    title: "دارایی شبکه در همه صندوق‌ها",
    description: "یک‌بار + نشان کلکسیونر",
    reward: 3000,
    missionType: "fund_issue",
    frequency: "once",
  },
  {
    code: "leader_5x3",
    title: "۵ زیرمجموعه که هرکدام ۳ زیرمجموعه داشته باشند",
    description: "یک‌بار + نشان راهبر",
    reward: 10000,
    missionType: "referral_count",
    frequency: "once",
  },
  {
    code: "badge_safir_novin",
    title: "دریافت نشان سفیر نوین",
    description: "پاداش دریافت نشان سفیر نوین",
    reward: 30000,
    missionType: "custom",
    frequency: "once",
  },
  {
    code: "subset_aum_200m",
    title: "مجموع دارایی زیرمجموعه به ۲۰۰ میلیون تومان",
    description: "یک‌بار",
    reward: 50,
    missionType: "custom",
    frequency: "once",
  },
  {
    code: "subset_aum_500m",
    title: "مجموع دارایی زیرمجموعه به ۵۰۰ میلیون تومان",
    description: "یک‌بار",
    reward: 100,
    missionType: "custom",
    frequency: "once",
  },
  {
    code: "subset_aum_1_2b",
    title: "مجموع دارایی زیرمجموعه به ۱٫۲ میلیارد تومان",
    description: "یک‌بار",
    reward: 200,
    missionType: "custom",
    frequency: "once",
  },
];

/** Legacy / alternate codes the live API may already return for the same mission. */
const CODE_ALIASES: Record<string, string[]> = {
  new_referral: ["invite_new", "new_referral"],
  monthly_referrals_3: ["referral_3", "monthly_referrals_3", "direct_subsets_3"],
  daily_login: ["daily_login"],
  registration: ["registration"],
};

function apiHasMission(apiCodes: Set<string>, seedCode: string): boolean {
  const aliases = CODE_ALIASES[seedCode] ?? [seedCode];
  return aliases.some((c) => apiCodes.has(c));
}

export function isMehrPreviewMissionId(id: string): boolean {
  return id.startsWith(MEHR_PREVIEW_ID_PREFIX);
}

export function toUserMissionDef(seed: MehrMissionSeed): MissionDef {
  return {
    id: `${MEHR_PREVIEW_ID_PREFIX}${seed.code}`,
    code: seed.code,
    title: seed.title,
    description: seed.description,
    reward: seed.reward,
    missionType: seed.missionType,
    status: "active",
    completed: false,
  };
}

export function toAdminMissionItem(seed: MehrMissionSeed): AdminMissionListItem {
  return {
    id: `${MEHR_PREVIEW_ID_PREFIX}${seed.code}`,
    code: seed.code,
    title: seed.title,
    description: seed.description,
    missionType: seed.missionType,
    rewardAmount: seed.reward,
    verificationMode: "manual",
    status: "active",
    job: {
      jobId: `job-mission-${seed.code}`,
      jobName: "PendingBackendSeed",
      schedule: "—",
    },
    createdAt: "2026-10-05T00:00:00.000Z",
  };
}

/** Append Mehr missions whose codes are not already present in the API list. */
export function mergeMehrUserMissions(apiMissions: MissionDef[]): MissionDef[] {
  if (!MEHR_MISSIONS_PREVIEW_ENABLED) return apiMissions;
  const apiCodes = new Set(apiMissions.map((m) => m.code));
  const missing = MEHR_MISSIONS.filter((s) => !apiHasMission(apiCodes, s.code)).map(
    toUserMissionDef,
  );
  return [...apiMissions, ...missing];
}

/** Append missing Mehr missions (for admin list page 0 / unfiltered view). */
export function mergeMehrAdminMissions(apiMissions: AdminMissionListItem[]): {
  data: AdminMissionListItem[];
  appended: number;
} {
  if (!MEHR_MISSIONS_PREVIEW_ENABLED) return { data: apiMissions, appended: 0 };
  const apiCodes = new Set(apiMissions.map((m) => m.code));
  const missing = MEHR_MISSIONS.filter((s) => !apiHasMission(apiCodes, s.code)).map(
    toAdminMissionItem,
  );
  return { data: [...apiMissions, ...missing], appended: missing.length };
}

/** Only merge when backend catalog is still smaller than the Mehr list. */
export function shouldMergeMehrAdminPreview(apiTotal: number): boolean {
  return MEHR_MISSIONS_PREVIEW_ENABLED && apiTotal < MEHR_MISSIONS.length;
}
