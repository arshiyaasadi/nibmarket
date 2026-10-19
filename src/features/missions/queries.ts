"use client";

import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQueries,
} from "@tanstack/react-query";
import { useMemo } from "react";
import { MissionsService } from "./service";
import type { MissionActivityStatus, MissionDef } from "@/types/mlm";

export function useMissionsList() {
  return useQuery({
    queryKey: ["missions", "list"],
    queryFn: () => MissionsService.getList(),
    staleTime: 300_000,
  });
}

/** Three section APIs — preferred for missions page + dashboard widget. */
export function useMissionSections() {
  const results = useQueries({
    queries: [
      {
        queryKey: ["missions", "sections", "promotion"],
        queryFn: () => MissionsService.getPromotion(),
        staleTime: 300_000,
      },
      {
        queryKey: ["missions", "sections", "onboarding"],
        queryFn: () => MissionsService.getOnboarding(),
        staleTime: 300_000,
      },
      {
        queryKey: ["missions", "sections", "marketing"],
        queryFn: () => MissionsService.getMarketing(),
        staleTime: 300_000,
      },
    ],
  });

  const [promotionQ, onboardingQ, marketingQ] = results;

  const missions = useMemo((): MissionDef[] => {
    return [...(promotionQ.data ?? []), ...(onboardingQ.data ?? []), ...(marketingQ.data ?? [])];
  }, [promotionQ.data, onboardingQ.data, marketingQ.data]);

  return {
    missions,
    promotion: promotionQ.data ?? [],
    onboarding: onboardingQ.data ?? [],
    marketing: marketingQ.data ?? [],
    isLoading: results.some((r) => r.isLoading),
    isError: results.some((r) => r.isError),
  };
}

export function useMarketingBadges() {
  return useQuery({
    queryKey: ["missions", "sections", "badges"],
    queryFn: () => MissionsService.getBadges(),
    staleTime: 300_000,
  });
}

export function useMissionsActivity(status: MissionActivityStatus | "all") {
  return useInfiniteQuery({
    queryKey: ["missions", "activity", status],
    queryFn: ({ pageParam = 1 }) =>
      MissionsService.getActivity({ page: pageParam as number, status }),
    getNextPageParam: (last, pages) => (last.hasMore ? pages.length + 1 : undefined),
    initialPageParam: 1,
    staleTime: 60_000,
  });
}

export function useCompleteMission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => MissionsService.completeByCode(code),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["missions"] });
    },
  });
}
