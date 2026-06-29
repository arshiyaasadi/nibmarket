import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { WalletSummary, WalletTransactionPage, WalletTxType, TokenPricePoint } from "@/types/mlm";

export const WalletService = {
  getSummary: (): Promise<WalletSummary> =>
    apiClient.get(ENDPOINTS.WALLET.SUMMARY),

  getTransactions: (params: {
    page: number;
    type?: WalletTxType | "all";
    rrn?: string;
  }): Promise<WalletTransactionPage> => {
    const sp = new URLSearchParams({ page: String(params.page) });
    if (params.type && params.type !== "all") sp.set("type", params.type);
    if (params.rrn) sp.set("rrn", params.rrn);
    return apiClient.get(`${ENDPOINTS.WALLET.TRANSACTIONS}?${sp}`);
  },

  getTokenPrice: (): Promise<TokenPricePoint[]> =>
    apiClient.get(ENDPOINTS.WALLET.TOKEN_PRICE),
};
