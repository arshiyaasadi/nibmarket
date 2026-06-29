"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "./service";

export { useSubsetDeposits } from "@/features/subset-deposits/queries";

export function useDashboardWallet() {
  return useQuery({
    queryKey: ["dashboard", "wallet"],
    queryFn: () => DashboardService.getWallet(),
    staleTime: 60_000,
  });
}

export function useDashboardReferral() {
  return useQuery({
    queryKey: ["dashboard", "referral"],
    queryFn: () => DashboardService.getReferral(),
    staleTime: 300_000,
  });
}

export function useDashboardRewards() {
  return useQuery({
    queryKey: ["dashboard", "rewards"],
    queryFn: () => DashboardService.getRewards(),
    staleTime: 60_000,
  });
}

export function useDashboardLeaderboard() {
  return useQuery({
    queryKey: ["dashboard", "leaderboard"],
    queryFn: () => DashboardService.getLeaderboard(),
    staleTime: 120_000,
  });
}

export function useDashboardMissions() {
  return useQuery({
    queryKey: ["dashboard", "missions"],
    queryFn: () => DashboardService.getMissions(),
    staleTime: 300_000,
  });
}

export function useMissionsList() {
  return useQuery({
    queryKey: ["missions", "list"],
    queryFn: () => DashboardService.getMissionsList(),
    staleTime: 300_000,
  });
}

