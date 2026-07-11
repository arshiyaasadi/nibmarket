import { formatDateTime } from "@/lib/utils";
import type {
  CommissionLevelRule,
  SubsetDeposits,
  SubsetDepositStatusFilter,
  SubsetDepositTransactionPage,
} from "@/types/mlm";

export async function getSubsetDeposits(_userId: string): Promise<SubsetDeposits> {
  return {
    today: 12,
    thisMonth: 85,
    total: 420,
    activeSubsets: 5,
    pendingAmount: 30,
  };
}

export async function getSubsetDepositTransactions(
  _userId: string,
  params: { page?: number; status?: SubsetDepositStatusFilter },
): Promise<SubsetDepositTransactionPage> {
  const page = Math.max(params.page ?? 1, 1);
  const limit = 10;
  const allItems = [
    {
      id: "sd-1",
      sourceUserName: "امیر زارع كاريزي",
      amount: 15,
      level: 1,
      status: "credited" as const,
      date: formatDateTime("2024-06-01T09:00:00.000Z"),
      externalTxId: "EXT-001",
      description: "کمیسیون سطح ۱",
      baseAmount: 300,
      ratePercent: 5,
    },
    {
      id: "sd-2",
      sourceUserName: "بهرام حاجي هاشمي",
      amount: 8,
      level: 2,
      status: "calculated" as const,
      date: formatDateTime("2024-06-02T11:00:00.000Z"),
      externalTxId: "EXT-002",
      description: "کمیسیون سطح ۲",
      baseAmount: 200,
      ratePercent: 3,
    },
  ];

  let items = allItems;
  if (params.status && params.status !== "all") {
    items = items.filter((item) => item.status === params.status);
  }

  const start = (page - 1) * limit;
  const slice = items.slice(start, start + limit);

  return {
    items: slice,
    hasMore: start + limit < items.length,
    total: items.length,
  };
}

export async function getCommissionLevelRules(): Promise<CommissionLevelRule[]> {
  return [
    { level: 1, ratePercent: 5, name: "سطح ۱" },
    { level: 2, ratePercent: 3, name: "سطح ۲" },
    { level: 3, ratePercent: 1, name: "سطح ۳" },
  ];
}
