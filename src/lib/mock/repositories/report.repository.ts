import type { CapitalDepositStats, IncomeTransaction, NetworkSubset } from "@/types/mlm";
import { getNetworkSubsets } from "./network.repository";

export async function getSubsetReport(userId: string): Promise<NetworkSubset[]> {
  return getNetworkSubsets(userId);
}

export async function getIncomeReport(_userId: string): Promise<IncomeTransaction[]> {
  return [
    {
      id: "inc-1",
      year: 2024,
      month: 6,
      type: "commission_reward",
      amount: 85,
      description: "کمیسیون سطح ۱",
    },
  ];
}

export async function getCapitalDepositStats(_userId: string): Promise<CapitalDepositStats> {
  return {
    totalDeposited: 1000000,
    activeDeposits: 800000,
    totalReturn: 50000,
    pendingReturn: 200000,
  };
}
