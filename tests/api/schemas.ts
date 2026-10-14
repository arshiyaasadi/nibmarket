import { z } from "zod";

const isoDate = z.string();

export const walletSummarySchema = z.object({
  totalTokens: z.number(),
  frozenTokens: z.number(),
  availableTokens: z.number(),
  pendingTokens: z.number(),
});

export const walletTransactionPageSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      date: isoDate,
      type: z.string(),
      description: z.string(),
      amount: z.number(),
      status: z.string(),
    }),
  ),
  hasMore: z.boolean(),
  total: z.number(),
});

export const tokenPriceSchema = z.array(
  z.object({
    date: isoDate,
    price: z.number(),
  }),
);

export const userReferralSchema = z.object({
  inviteCode: z.string(),
  referralCode: z.string(),
});

export const subsetDepositsSchema = z.object({
  today: z.number(),
  thisMonth: z.number(),
  total: z.number(),
  activeSubsets: z.number(),
  pendingAmount: z.number(),
});

export const missionListSchema = z.array(
  z.object({
    id: z.string(),
    code: z.string(),
    title: z.string(),
    reward: z.number(),
    missionType: z.string(),
    status: z.string(),
  }),
);

export const missionActivityPageSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      missionId: z.string(),
      title: z.string(),
      date: isoDate,
      status: z.string(),
      reward: z.number(),
    }),
  ),
  hasMore: z.boolean(),
  total: z.number(),
});

export const networkSubsetsSchema = z.array(
  z.object({
    id: z.string(),
    fullName: z.string(),
    level: z.number(),
  }),
);

export const networkTreeSchema = z.object({
  id: z.string(),
  fullName: z.string(),
  level: z.number(),
  isSelf: z.boolean(),
});

export const inviteQuotaSchema = z.object({
  remaining: z.number(),
  limit: z.number(),
  used: z.number(),
  canInvite: z.boolean(),
});

export const poolBalanceSchema = z.object({
  totalPool: z.number(),
  userShare: z.number(),
  sharePercent: z.number(),
});

export const leaderboardSchema = z.array(
  z.object({
    rank: z.number(),
    userId: z.string(),
    fullName: z.string(),
    tokens: z.number(),
  }),
);

export const arraySchema = z.array(z.unknown());
export const objectSchema = z.record(z.string(), z.unknown());

/** Maps endpoint path prefix to expected Zod schema. */
export const ENDPOINT_SCHEMAS: Record<string, z.ZodType> = {
  "/wallet/summary": walletSummarySchema,
  "/dashboard/wallet": walletSummarySchema,
  "/wallet/transactions": walletTransactionPageSchema,
  "/dashboard/referral": userReferralSchema,
  "/dashboard/subset-deposits": subsetDepositsSchema,
  "/missions/list": missionListSchema,
  "/missions/activity": missionActivityPageSchema,
  "/network/subsets": networkSubsetsSchema,
  "/network/tree": networkTreeSchema,
  "/network/invite-quota": inviteQuotaSchema,
  "/leaderboard/pool-balance": poolBalanceSchema,
  "/dashboard/leaderboard": leaderboardSchema,
  "/leaderboard/current-month": leaderboardSchema,
  "/leaderboard/last-month": leaderboardSchema,
  "/network/funds": arraySchema,
  "/capital/funds": arraySchema,
  "/leaderboard/honors": arraySchema,
  "/leaderboard/history": arraySchema,
  "/dashboard/charts": objectSchema,
};

export function getSchemaForPath(path: string): z.ZodType | undefined {
  const basePath = path.split("?")[0];
  return ENDPOINT_SCHEMAS[basePath];
}
