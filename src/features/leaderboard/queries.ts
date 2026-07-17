"use client";

import { useQuery } from "@tanstack/react-query";
import { LeaderboardService } from "./service";

export function useLeaderboardPool() {
  return useQuery({
    queryKey: ["leaderboard", "pool"],
    queryFn: () => LeaderboardService.getPoolBalance(),
    staleTime: 120_000,
  });
}

export function useLeaderboardCurrentMonth() {
  return useQuery({
    queryKey: ["leaderboard", "current-month"],
    queryFn: () => LeaderboardService.getCurrentMonth(),
    staleTime: 120_000,
  });
}

export function useLeaderboardMySubsets() {
  return useQuery({
    queryKey: ["leaderboard", "my-subsets"],
    queryFn: () => LeaderboardService.getMySubsets(),
    staleTime: 120_000,
  });
}

export function useLeaderboardHonors() {
  return useQuery({
    queryKey: ["leaderboard", "honors"],
    queryFn: () => LeaderboardService.getHonors(),
    staleTime: 300_000,
  });
}

export function useLeaderboardMissions() {
  return useQuery({
    queryKey: ["leaderboard", "missions"],
    queryFn: () => LeaderboardService.getMissions(),
    staleTime: 300_000,
  });
}

export function useCompetitionPool() {
  return useQuery({
    queryKey: ["leaderboard", "competition-pool"],
    queryFn: () => LeaderboardService.getCompetitionPool(),
    staleTime: 60_000,
  });
}

export function useCompetitionHistory() {
  return useQuery({
    queryKey: ["leaderboard", "history"],
    queryFn: () => LeaderboardService.getHistory(),
    staleTime: 300_000,
  });
}
