import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { CapitalDepositStats, Fund } from "@/types/mlm";

export const CapitalService = {
  getStats: (): Promise<CapitalDepositStats> =>
    apiClient.get(ENDPOINTS.REPORTS.CAPITAL),

  getFunds: (): Promise<Fund[]> =>
    apiClient.get(ENDPOINTS.CAPITAL.FUNDS),
};
