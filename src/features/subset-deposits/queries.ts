"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { SubsetDepositsService } from "./service";
import type { SubsetDepositStatusFilter } from "@/types/mlm";

export function useSubsetDeposits() {
  return useQuery({
    queryKey: ["subset-deposits", "summary"],
    queryFn: () => SubsetDepositsService.getSummary(),
    staleTime: 60_000,
  });
}

export function useSubsetDepositTransactions(status: SubsetDepositStatusFilter) {
  return useInfiniteQuery({
    queryKey: ["subset-deposits", "transactions", status],
    queryFn: ({ pageParam = 1 }) =>
      SubsetDepositsService.getTransactions({ page: pageParam as number, status }),
    getNextPageParam: (last, pages) => last.hasMore ? pages.length + 1 : undefined,
    initialPageParam: 1,
    staleTime: 60_000,
  });
}

export function useCommissionLevelRules() {
  return useQuery({
    queryKey: ["subset-deposits", "rules"],
    queryFn: () => SubsetDepositsService.getRules(),
    staleTime: 300_000,
  });
}
