"use client";

import { useQuery } from "@tanstack/react-query";
import { CapitalService } from "./service";

export function useCapitalStats() {
  return useQuery({
    queryKey: ["capital", "stats"],
    queryFn: () => CapitalService.getStats(),
    staleTime: 120_000,
  });
}

export function useCapitalFunds() {
  return useQuery({
    queryKey: ["capital", "funds"],
    queryFn: () => CapitalService.getFunds(),
    staleTime: 300_000,
  });
}
