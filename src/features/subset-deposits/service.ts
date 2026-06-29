import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  CommissionLevelRule,
  SubsetDeposits,
  SubsetDepositStatusFilter,
  SubsetDepositTransactionPage,
} from "@/types/mlm";

export const SubsetDepositsService = {
  getSummary: (): Promise<SubsetDeposits> =>
    apiClient.get(ENDPOINTS.SUBSET_DEPOSITS.SUMMARY),

  getTransactions: (params: {
    page: number;
    status?: SubsetDepositStatusFilter;
  }): Promise<SubsetDepositTransactionPage> => {
    const sp = new URLSearchParams({ page: String(params.page) });
    if (params.status && params.status !== "all") sp.set("status", params.status);
    return apiClient.get(`${ENDPOINTS.SUBSET_DEPOSITS.TRANSACTIONS}?${sp}`);
  },

  getRules: (): Promise<CommissionLevelRule[]> =>
    apiClient.get(ENDPOINTS.SUBSET_DEPOSITS.RULES),
};
