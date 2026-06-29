import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { WalletTransaction, IncomeTransaction, Paginated } from "@/types/mlm";

interface WalletFilter {
  startDate?: string;
  endDate?: string;
  type?: string;
  missionId?: string;
}

interface IncomeFilter {
  year?: number;
  month?: number;
}

function buildQuery(params?: Record<string, string | number | undefined | null>): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined) sp.set(k, String(v));
  }
  const q = sp.toString();
  return q ? `?${q}` : "";
}

export const ReportsService = {
  getWallet: (filter?: WalletFilter): Promise<Paginated<WalletTransaction>> =>
    apiClient.get(`${ENDPOINTS.WALLET.TRANSACTIONS}${buildQuery(filter as Record<string, string | undefined>)}`),

  getSubsets: (filter?: WalletFilter): Promise<Paginated<WalletTransaction>> =>
    apiClient.get(`${ENDPOINTS.REPORTS.SUBSETS}${buildQuery(filter as Record<string, string | undefined>)}`),

  getIncome: (filter?: IncomeFilter): Promise<Paginated<IncomeTransaction>> =>
    apiClient.get(`${ENDPOINTS.REPORTS.INCOME}${buildQuery(filter as Record<string, string | number | undefined>)}`),
};
