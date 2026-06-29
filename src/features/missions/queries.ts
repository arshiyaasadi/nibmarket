"use client";

import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { MissionsService } from "./service";
import type { MissionActivityStatus } from "@/types/mlm";

export function useMissionsList() {
  return useQuery({
    queryKey: ["missions", "list"],
    queryFn: () => MissionsService.getList(),
    staleTime: 300_000,
  });
}

export function useMissionsActivity(status: MissionActivityStatus | "all") {
  return useInfiniteQuery({
    queryKey: ["missions", "activity", status],
    queryFn: ({ pageParam = 1 }) => MissionsService.getActivity({ page: pageParam as number, status }),
    getNextPageParam: (last, pages) => last.hasMore ? pages.length + 1 : undefined,
    initialPageParam: 1,
    staleTime: 60_000,
  });
}
