/**
 * FE-side low-treasury alert threshold.
 * Alert when unallocatedTokens / totalTokens falls below this percent.
 * Prefer a BE overview field later if product defines an absolute or configurable threshold.
 */
export const TWIN_TREASURY_LOW_SHARE_PERCENT = 15;

export type TwinTreasuryTotals = {
  totalTokens: number;
  unallocatedTokens: number;
};

/** Unallocated share of total supply, 0–100. */
export function getTwinTreasurySharePercent(overview: TwinTreasuryTotals): number {
  if (overview.totalTokens <= 0) return 0;
  return (overview.unallocatedTokens / overview.totalTokens) * 100;
}

export function isTwinTreasuryLow(overview: TwinTreasuryTotals): boolean {
  return getTwinTreasurySharePercent(overview) < TWIN_TREASURY_LOW_SHARE_PERCENT;
}
