import { prisma } from "@/lib/db/prisma";
import { decimalToNumber, mapTransaction } from "@/types/mappers";
import type { WalletSummary, WalletTransactionPage, WalletTxType } from "@/types/mlm";
import { getUserWalletBalance } from "./user.repository";

export async function getWalletSummary(userId: string): Promise<WalletSummary> {
  const walletBalance = await getUserWalletBalance(userId);
  const balance = walletBalance?.balance;

  return {
    totalTokens: decimalToNumber(balance?.total),
    frozenTokens: decimalToNumber(balance?.locked),
    availableTokens: decimalToNumber(balance?.available),
    pendingTokens: decimalToNumber(balance?.pending),
  };
}

export async function getWalletTransactions(
  userId: string,
  params: { page?: number; type?: WalletTxType | "all"; rrn?: string },
): Promise<WalletTransactionPage> {
  const walletBalance = await getUserWalletBalance(userId);
  if (!walletBalance?.wallet) {
    return { items: [], hasMore: false, total: 0 };
  }

  const page = Math.max(params.page ?? 1, 1);
  const limit = 10;
  const where = {
    wallet_id: walletBalance.wallet.id,
    ...(params.type && params.type !== "all" ? { type: params.type } : {}),
  };

  const [total, rows] = await Promise.all([
    prisma.token_transactions.count({ where }),
    prisma.token_transactions.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const rrn = params.rrn?.trim();
  const mapped = rows.map(mapTransaction);
  const items = rrn
    ? mapped.filter((item) => item.rrn?.includes(rrn))
    : mapped;

  return {
    items,
    hasMore: page * limit < total,
    total,
  };
}

export async function getRewardCards(userId: string) {
  const walletBalance = await getUserWalletBalance(userId);
  if (!walletBalance?.wallet) return [];

  const transactions = await prisma.token_transactions.groupBy({
    by: ["type"],
    where: {
      wallet_id: walletBalance.wallet.id,
      status: "settled",
    },
    _sum: { amount: true },
  });

  const sumByType = new Map(
    transactions.map((item) => [item.type, decimalToNumber(item._sum.amount)]),
  );

  return [
    {
      title: "کل توکن دریافتی",
      stats: String(decimalToNumber(walletBalance.balance?.total)),
      trendNumber: "+۰٪",
      trend: "positive" as const,
      color: "green",
      icon: "token",
    },
    {
      title: "توکن از ماموریت",
      stats: String(sumByType.get("mission_reward") ?? 0),
      trendNumber: "+۰٪",
      trend: "positive" as const,
      color: "blue",
      icon: "calendar",
    },
    {
      title: "توکن از معرفی",
      stats: String(sumByType.get("commission_reward") ?? 0),
      trendNumber: "+۰٪",
      trend: "positive" as const,
      color: "purple",
      icon: "users",
    },
    {
      title: "توکن فریز شده",
      stats: String(decimalToNumber(walletBalance.balance?.locked)),
      trendNumber: "۰٪",
      trend: "negative" as const,
      color: "orange",
      icon: "lock",
    },
  ];
}
