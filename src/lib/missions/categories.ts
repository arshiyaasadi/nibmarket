import type { MissionDef } from "@/types/mlm";

export type MissionCategoryId = "onboarding" | "marketing" | "promotion" | "badges" | "other";

/** How the category should render in the missions UI */
export type MissionCategoryLayout = "staged" | "promotion" | "badges";

export type MissionRecurrence = "once" | "daily" | "monthly" | "per_event";

export type MissionSectionId = "promotion" | "onboarding" | "marketing" | "badges";

export type MissionCategoryMeta = {
  id: MissionCategoryId;
  labelKey: string;
  hintKey?: string;
  order: number;
  layout: MissionCategoryLayout;
};

export const MISSION_CATEGORIES: MissionCategoryMeta[] = [
  {
    id: "promotion",
    labelKey: "categories.promotion",
    hintKey: "categoryHints.promotion",
    order: 0,
    layout: "promotion",
  },
  {
    id: "onboarding",
    labelKey: "categories.onboarding",
    hintKey: "categoryHints.onboarding",
    order: 1,
    layout: "staged",
  },
  {
    id: "marketing",
    labelKey: "categories.marketing",
    hintKey: "categoryHints.marketing",
    order: 2,
    layout: "staged",
  },
  {
    id: "badges",
    labelKey: "categories.badges",
    hintKey: "categoryHints.badges",
    order: 3,
    layout: "badges",
  },
  {
    id: "other",
    labelKey: "categories.other",
    order: 99,
    layout: "promotion",
  },
];

/** Canonical codes per section — must match docs/03-data/missions-catalog.json */
export const MISSION_SECTION_CODES: Record<MissionSectionId, readonly string[]> = {
  promotion: ["daily_login", "new_referral", "monthly_referrals_3"],
  onboarding: ["registration", "identity_verification", "first_fund_purchase"],
  marketing: [
    "training_level_1",
    "first_referral",
    "subset_aum_200m",
    "subset_aum_500m",
    "subset_aum_1_2b",
  ],
  badges: [
    "direct_subsets_10",
    "subsets_high_aum_1_5b",
    "network_all_funds",
    "leader_5x3",
    "badge_safir_novin",
  ],
};

type CodeMeta = {
  categoryId: MissionCategoryId;
  stepOrder: number;
  recurrence: MissionRecurrence;
  defaultTarget?: number;
};

const CODE_META: Record<string, CodeMeta> = {
  registration: { categoryId: "onboarding", stepOrder: 1, recurrence: "once" },
  identity_verification: { categoryId: "onboarding", stepOrder: 2, recurrence: "once" },
  first_fund_purchase: { categoryId: "onboarding", stepOrder: 3, recurrence: "once" },

  training_level_1: { categoryId: "marketing", stepOrder: 1, recurrence: "once" },
  first_referral: { categoryId: "marketing", stepOrder: 2, recurrence: "once" },
  subset_aum_200m: { categoryId: "marketing", stepOrder: 3, recurrence: "once" },
  subset_aum_500m: { categoryId: "marketing", stepOrder: 4, recurrence: "once" },
  subset_aum_1_2b: { categoryId: "marketing", stepOrder: 5, recurrence: "once" },

  daily_login: {
    categoryId: "promotion",
    stepOrder: 1,
    recurrence: "daily",
    defaultTarget: 1,
  },
  new_referral: { categoryId: "promotion", stepOrder: 2, recurrence: "per_event" },
  invite_new: { categoryId: "promotion", stepOrder: 2, recurrence: "per_event" },
  monthly_referrals_3: {
    categoryId: "promotion",
    stepOrder: 3,
    recurrence: "monthly",
    defaultTarget: 3,
  },
  referral_3: {
    categoryId: "promotion",
    stepOrder: 3,
    recurrence: "monthly",
    defaultTarget: 3,
  },
  direct_subsets_3: {
    categoryId: "promotion",
    stepOrder: 3,
    recurrence: "monthly",
    defaultTarget: 3,
  },

  direct_subsets_10: { categoryId: "badges", stepOrder: 1, recurrence: "once" },
  subsets_high_aum_1_5b: { categoryId: "badges", stepOrder: 2, recurrence: "once" },
  network_all_funds: { categoryId: "badges", stepOrder: 3, recurrence: "once" },
  leader_5x3: { categoryId: "badges", stepOrder: 4, recurrence: "once" },
  badge_safir_novin: { categoryId: "badges", stepOrder: 5, recurrence: "once" },
};

/** Aliases → canonical code for section membership */
const CODE_TO_CANONICAL: Record<string, string> = {
  invite_new: "new_referral",
  referral_3: "monthly_referrals_3",
  direct_subsets_3: "monthly_referrals_3",
};

export function canonicalMissionCode(code: string): string {
  return CODE_TO_CANONICAL[code] ?? code;
}

export function getMissionCodeMeta(code: string): CodeMeta {
  return (
    CODE_META[code] ??
    CODE_META[canonicalMissionCode(code)] ?? {
      categoryId: "other" as const,
      stepOrder: 999,
      recurrence: "once" as const,
    }
  );
}

export function getMissionCategoryMeta(code: string): {
  categoryId: MissionCategoryId;
  stepOrder: number;
} {
  const m = getMissionCodeMeta(code);
  return { categoryId: m.categoryId, stepOrder: m.stepOrder };
}

export function filterMissionsBySection(
  missions: MissionDef[],
  section: MissionSectionId,
): MissionDef[] {
  const wanted = new Set(MISSION_SECTION_CODES[section]);
  const matched = missions.filter((m) => wanted.has(canonicalMissionCode(m.code)));
  return [...matched].sort((a, b) => {
    const ao = getMissionCategoryMeta(a.code).stepOrder;
    const bo = getMissionCategoryMeta(b.code).stepOrder;
    if (ao !== bo) return ao - bo;
    return a.title.localeCompare(b.title, "fa");
  });
}

export type MissionCategoryGroup = {
  meta: MissionCategoryMeta;
  missions: MissionDef[];
  done: number;
  total: number;
  /** Tokens earned from completed missions in this group */
  earnedTokens: number;
  /** Max tokens available in this group */
  totalTokens: number;
  currentId: string | null;
  isComplete: boolean;
};

function missionDisplayReward(m: MissionDef): number {
  if (typeof m.boostedReward === "number" && m.boostedReward > 0 && !m.completed) {
    return m.boostedReward;
  }
  return m.reward;
}

export function groupMissionsByCategory(missions: MissionDef[]): MissionCategoryGroup[] {
  const buckets = new Map<MissionCategoryId, MissionDef[]>();

  for (const m of missions) {
    const { categoryId } = getMissionCategoryMeta(m.code);
    const list = buckets.get(categoryId) ?? [];
    list.push(m);
    buckets.set(categoryId, list);
  }

  return MISSION_CATEGORIES.map((meta) => {
    const list = buckets.get(meta.id) ?? [];
    const sorted = [...list].sort((a, b) => {
      const ao = getMissionCategoryMeta(a.code).stepOrder;
      const bo = getMissionCategoryMeta(b.code).stepOrder;
      if (ao !== bo) return ao - bo;
      return a.title.localeCompare(b.title, "fa");
    });
    const done = sorted.filter((m) => m.completed).length;
    const current = sorted.find((m) => !m.completed) ?? null;
    const earnedTokens = sorted.filter((m) => m.completed).reduce((sum, m) => sum + m.reward, 0);
    const totalTokens = sorted.reduce((sum, m) => sum + missionDisplayReward(m), 0);
    return {
      meta,
      missions: sorted,
      done,
      total: sorted.length,
      earnedTokens,
      totalTokens,
      currentId: current?.id ?? null,
      isComplete: sorted.length > 0 && done === sorted.length,
    };
  }).filter((g) => g.total > 0);
}

export function sortMissionsForDashboard(missions: MissionDef[]): MissionDef[] {
  const groups = groupMissionsByCategory(missions);
  const active = groups.find((g) => !g.isComplete && g.meta.layout !== "badges") ?? groups[0];
  const priorityIds = new Set(active?.missions.map((m) => m.id) ?? []);

  return [...missions].sort((a, b) => {
    const aPri = priorityIds.has(a.id) ? 0 : 1;
    const bPri = priorityIds.has(b.id) ? 0 : 1;
    if (aPri !== bPri) return aPri - bPri;

    if (a.completed !== b.completed) return a.completed ? 1 : -1;

    const aBoost = hasActiveMissionBoost(a) ? 0 : 1;
    const bBoost = hasActiveMissionBoost(b) ? 0 : 1;
    if (aBoost !== bBoost) return aBoost - bBoost;

    const aMeta = getMissionCategoryMeta(a.code);
    const bMeta = getMissionCategoryMeta(b.code);
    const aCat = MISSION_CATEGORIES.find((c) => c.id === aMeta.categoryId)?.order ?? 99;
    const bCat = MISSION_CATEGORIES.find((c) => c.id === bMeta.categoryId)?.order ?? 99;
    if (aCat !== bCat) return aCat - bCat;
    return aMeta.stepOrder - bMeta.stepOrder;
  });
}

export type MissionBoostInfo = {
  percent: number;
  baseReward: number;
  effectiveReward: number;
};

export function getMissionBoost(m: MissionDef): MissionBoostInfo | null {
  if (m.completed) return null;

  const base = m.reward;
  if (typeof m.rewardBoostPercent === "number" && m.rewardBoostPercent > 0) {
    const percent = m.rewardBoostPercent;
    const effective =
      typeof m.boostedReward === "number" && m.boostedReward > 0
        ? m.boostedReward
        : Math.round(base * (1 + percent / 100));
    return { percent, baseReward: base, effectiveReward: effective };
  }

  if (m.doubleBonus) {
    return { percent: 100, baseReward: base, effectiveReward: base * 2 };
  }

  return null;
}

export function hasActiveMissionBoost(m: MissionDef): boolean {
  return getMissionBoost(m) !== null;
}

export function missionsHaveAnyBoost(missions: MissionDef[]): boolean {
  return missions.some(hasActiveMissionBoost);
}

export type MissionPeriodProgress = {
  recurrence: MissionRecurrence;
  current: number;
  target: number;
  remaining: number;
  percent: number;
  periodEndsAt: string | null;
  msRemaining: number | null;
  doneThisPeriod: boolean;
};

function endOfTodayLocal(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function endOfMonthLocal(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
}

export function getMissionPeriodProgress(m: MissionDef): MissionPeriodProgress | null {
  const meta = getMissionCodeMeta(m.code);
  if (meta.recurrence === "once") return null;

  const target =
    typeof m.progressTarget === "number" && m.progressTarget > 0
      ? m.progressTarget
      : (meta.defaultTarget ?? 1);

  let current =
    typeof m.progressCurrent === "number" && m.progressCurrent >= 0 ? m.progressCurrent : 0;

  if (m.completed && typeof m.progressCurrent !== "number") {
    current = target;
  }

  current = Math.min(current, target);
  const remaining = Math.max(0, target - current);
  const percent = target > 0 ? Math.round((current / target) * 100) : 0;

  let periodEndsAt: string | null = m.periodEndsAt ?? null;
  if (!periodEndsAt) {
    if (meta.recurrence === "daily") periodEndsAt = endOfTodayLocal().toISOString();
    if (meta.recurrence === "monthly") periodEndsAt = endOfMonthLocal().toISOString();
  }

  const msRemaining = periodEndsAt
    ? Math.max(0, new Date(periodEndsAt).getTime() - Date.now())
    : null;

  return {
    recurrence: meta.recurrence,
    current,
    target,
    remaining,
    percent,
    periodEndsAt,
    msRemaining,
    doneThisPeriod: current >= target,
  };
}

export function formatDurationRemaining(ms: number | null): { days: number; hours: number } | null {
  if (ms == null || ms <= 0) return null;
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
  return { days, hours };
}

/** Persian week labels — Saturday → Friday */
export const PERSIAN_WEEKDAY_SHORT = ["ش", "ی", "د", "س", "چ", "پ", "ج"] as const;

function toLocalIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Start of current week (Saturday, local). */
export function getWeekStartSaturday(from = new Date()): Date {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  // JS: 0=Sun … 6=Sat. Days since Saturday:
  const sinceSat = (d.getDay() + 1) % 7;
  d.setDate(d.getDate() - sinceSat);
  return d;
}

export type WeekLoginDay = {
  iso: string;
  label: string;
  /** past | today | future */
  kind: "past" | "today" | "future";
  claimed: boolean;
};

/**
 * Builds Sat–Fri week for daily-login UI.
 * claimedDates from API when present; otherwise if mission completed today, mark today.
 */
export function buildWeekLoginDays(m: MissionDef, now = new Date()): WeekLoginDay[] {
  const start = getWeekStartSaturday(now);
  const todayIso = toLocalIsoDate(now);
  const claimedSet = new Set(m.loginClaimedDates ?? []);
  if (claimedSet.size === 0 && m.completed) {
    claimedSet.add(todayIso);
  }

  return Array.from({ length: 7 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    const iso = toLocalIsoDate(day);
    const kind: WeekLoginDay["kind"] =
      iso === todayIso ? "today" : iso < todayIso ? "past" : "future";
    return {
      iso,
      label: PERSIAN_WEEKDAY_SHORT[i]!,
      kind,
      claimed: claimedSet.has(iso),
    };
  });
}

/** Codes in «شروع بازاریابی» that belong to the starter pair vs professional ladder */
export const MARKETER_START_CODES = new Set(["training_level_1", "first_referral"]);
export const MARKETER_PRO_CODES = new Set([
  "subset_aum_200m",
  "subset_aum_500m",
  "subset_aum_1_2b",
]);

export function splitMarketerMissions(missions: MissionDef[]): {
  start: MissionDef[];
  pro: MissionDef[];
} {
  const start: MissionDef[] = [];
  const pro: MissionDef[] = [];
  for (const m of missions) {
    if (MARKETER_PRO_CODES.has(m.code)) pro.push(m);
    else if (MARKETER_START_CODES.has(m.code)) start.push(m);
    else {
      const order = getMissionCategoryMeta(m.code).stepOrder;
      if (order <= 2) start.push(m);
      else pro.push(m);
    }
  }
  return { start, pro };
}
