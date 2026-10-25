import type { MarketingBadgeCode } from "@/types/mlm";

export const GUIDELINE_CATEGORY_IDS = ["deposit", "calculation", "coins", "network"] as const;

export type GuidelineCategoryId = (typeof GUIDELINE_CATEGORY_IDS)[number];

/** Stable ids for reuse as in-page hints / callouts. */
export const GUIDELINE_IDS = {
  DEPOSIT_WHAT_IS: "deposit.what_is",
  DEPOSIT_HIGHLIGHTS: "deposit.highlights",
  DEPOSIT_MEASURE: "deposit.measure",
  DEPOSIT_NEW_CAPITAL_ONLY: "deposit.new_capital_only",
  DEPOSIT_REDEPOSIT: "deposit.redeposit",
  DEPOSIT_WITHDRAW: "deposit.withdraw",
  CALC_FORMULA: "calculation.formula",
  CALC_FLOW: "calculation.flow",
  COINS_SILVER: "coins.silver",
  COINS_LOCK: "coins.lock",
  COINS_RETENTION: "coins.retention",
  NETWORK_LEVELS: "network.levels",
  NETWORK_ACTIVE_INTRO: "network.active_intro",
  NETWORK_INACTIVITY: "network.inactivity",
  NETWORK_INVITES: "network.invites",
} as const;

export type GuidelineId = (typeof GUIDELINE_IDS)[keyof typeof GUIDELINE_IDS];

export type GuidelineCategory = {
  id: GuidelineCategoryId;
  label: string;
  description: string;
};

export type GuidelineStatCard = {
  value: string;
  desc: string;
};

export type GuidelineRateCard = {
  rate: string;
  desc: string;
};

export type GuidelineFlowStep = {
  amount: string;
  /** Tailwind height utility, e.g. h-[7.5rem] */
  barClass: string;
  title: string;
  desc: string;
  empty?: boolean;
};

/** Rich answer layouts from the Deposit Rules design mockup. */
export type GuidelinePresentation =
  | { type: "text" }
  | { type: "stat"; value: string }
  | { type: "highlights"; items: GuidelineStatCard[] }
  | {
      type: "formula";
      lead: string;
      result: string;
      factors: string[];
      rates: GuidelineRateCard[];
      exampleLabel: string;
      example: string;
    }
  | {
      type: "flow";
      lead: string;
      chartAria: string;
      steps: GuidelineFlowStep[];
    }
  | { type: "rates"; rates: GuidelineRateCard[] }
  /** Marketing badges with logo + copy. Empty/omitted codes → all badges. */
  | { type: "badges"; badgeCodes?: MarketingBadgeCode[] };

export type GuidelineItem = {
  id: GuidelineId;
  categoryId: GuidelineCategoryId;
  question: string;
  /** Plain-text answer for hints / search / reuse outside the rules page. */
  answer: string;
  presentation: GuidelinePresentation;
};
