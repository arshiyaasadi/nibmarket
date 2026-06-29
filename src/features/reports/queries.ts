"use client";

import { useQuery } from "@tanstack/react-query";
import { ReportsService } from "./service";

export function useReportsWallet() {
  return useQuery({
    queryKey: ["reports", "wallet"],
    queryFn: () => ReportsService.getWallet(),
    staleTime: 60_000,
  });
}

export function useReportsIncome() {
  return useQuery({
    queryKey: ["reports", "income"],
    queryFn: () => ReportsService.getIncome(),
    staleTime: 60_000,
  });
}

export function useReportsSubsets() {
  return useQuery({
    queryKey: ["reports", "subsets"],
    queryFn: () => ReportsService.getSubsets(),
    staleTime: 120_000,
  });
}
