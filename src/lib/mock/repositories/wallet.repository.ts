import { formatDateTime } from "@/lib/utils";
import { getMockUser } from "@/lib/mock/store";
import type { WalletSummary, WalletTransactionPage, WalletTxType } from "@/types/mlm";

export async function getWalletSummary(userId: string): Promise<WalletSummary> {
  const user = getMockUser(userId);
  const total = user?.balance ?? 0;
  return {
    totalTokens: total,
    frozenTokens: 0,
    availableTokens: total,
    pendingTokens: 0,
  };
}

export async function getWalletTransactions(
  userId: string,
  params: { page?: number; type?: WalletTxType | "all"; rrn?: string },
): Promise<WalletTransactionPage> {
  const page = Math.max(params.page ?? 1, 1);
  const limit = 10;
  const allItems = [
    {
      id: "tx-1",
      type: "mission_reward" as const,
      amount: 50,
      date: "2024-06-07T15:34:11.0000000",
      description: "پاداش ماموریت",
      rrn: "MSN000000413",
      status: "settled" as const,
    },
    {
      id: "tx-2",
      type: "commission_reward" as const,
      amount: 120,
      date: "2024-06-01T09:00:00.0000000",
      description: "کمیسیون زیرمجموعه",
      rrn: "MSN000000401",
      status: "settled" as const,
    },
  ];

  let items = allItems;
  if (params.type && params.type !== "all") {
    items = items.filter((item) => item.type === params.type);
  }
  const rrn = params.rrn?.trim();
  if (rrn) {
    items = items.filter((item) => item.rrn?.includes(rrn));
  }

  const start = (page - 1) * limit;
  const slice = items.slice(start, start + limit);

  return {
    items: slice.map((item) => ({
      id: item.id,
      type: item.type,
      amount: item.amount,
      description: item.description,
      rrn: item.rrn,
      status: item.status,
      date: formatDateTime(item.date),
    })),
    hasMore: start + limit < items.length,
    total: items.length,
  };
}

export async function getRewardCards(userId: string) {
  const summary = await getWalletSummary(userId);
  return [
    {
      title: "کل توکن دریافتی",
      stats: String(summary.totalTokens),
      trendNumber: "+۰٪",
      trend: "positive" as const,
      color: "green",
      icon: "token",
    },
    {
      title: "توکن از ماموریت",
      stats: "50",
      trendNumber: "+۰٪",
      trend: "positive" as const,
      color: "blue",
      icon: "calendar",
    },
    {
      title: "توکن از معرفی",
      stats: "120",
      trendNumber: "+۰٪",
      trend: "positive" as const,
      color: "purple",
      icon: "users",
    },
    {
      title: "توکن فریز شده",
      stats: "0",
      trendNumber: "۰٪",
      trend: "negative" as const,
      color: "orange",
      icon: "lock",
    },
  ];
}

export async function getUserWalletBalance(userId: string) {
  const user = getMockUser(userId);
  if (!user) return null;
  return {
    wallet: { id: `wallet-${userId}` },
    balance: {
      total: user.balance,
      available: user.balance,
      locked: 0,
      pending: 0,
    },
  };
}
