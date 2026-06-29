import { prisma } from "@/lib/db/prisma";
import { decimalToNumber } from "@/types/mappers";
import type { CapitalDepositStats, IncomeTransaction, NetworkSubset } from "@/types/mlm";
import { getNetworkSubsets } from "./network.repository";

export async function getSubsetReport(userId: string): Promise<NetworkSubset[]> {
  return getNetworkSubsets(userId);
}

export async function getIncomeReport(userId: string): Promise<IncomeTransaction[]> {
  const entries = await prisma.commission_entries.findMany({
    where: {
      beneficiary_user_id: userId,
    },
    orderBy: { created_at: "desc" },
    take: 50,
  });

  return entries.map((entry) => {
    const date = entry.created_at;
    return {
      id: entry.id,
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      type: "commission_reward",
      amount: decimalToNumber(entry.commission_amount_twin),
      description: `کمیسیون سطح ${entry.level}`,
    };
  });
}

export async function getCapitalDepositStats(userId: string): Promise<CapitalDepositStats> {
  const txs = await prisma.nib_market_transactions.findMany({
    where: {
      user_id: userId,
      tx_type: "purchase",
    },
  });

  const totalDeposited = txs.reduce((sum, tx) => sum + decimalToNumber(tx.amount), 0);
  const pendingReturn = txs
    .filter((tx) => tx.processing_status === "pending")
    .reduce((sum, tx) => sum + decimalToNumber(tx.amount), 0);

  return {
    totalDeposited,
    activeDeposits: totalDeposited - pendingReturn,
    totalReturn: 0,
    pendingReturn,
  };
}
