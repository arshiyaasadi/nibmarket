"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { WalletService } from "./service";
import type { WalletTxType } from "@/types/mlm";

export function useWalletSummary() {
  return useQuery({
    queryKey: ["wallet", "summary"],
    queryFn: () => WalletService.getSummary(),
    staleTime: 60_000,
  });
}

export function useWalletTransactions(type: WalletTxType | "all", rrn: string) {
  return useInfiniteQuery({
    queryKey: ["wallet", "transactions", type, rrn],
    queryFn: ({ pageParam = 1 }) =>
      WalletService.getTransactions({ page: pageParam as number, type, rrn }),
    getNextPageParam: (last, pages) => last.hasMore ? pages.length + 1 : undefined,
    initialPageParam: 1,
    staleTime: 60_000,
  });
}

export function useTokenPrice() {
  return useQuery({
    queryKey: ["wallet", "token-price"],
    queryFn: () => WalletService.getTokenPrice(),
    staleTime: 300_000,
  });
}
