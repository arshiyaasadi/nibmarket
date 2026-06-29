"use client";

import { useQuery } from "@tanstack/react-query";
import { NotificationsService } from "./service";
import type { NotificationType } from "@/types/mlm";

export function useNotifications(type?: NotificationType) {
  return useQuery({
    queryKey: ["notifications", type ?? "all"],
    queryFn: () => NotificationsService.getList(type),
    staleTime: 30_000,
  });
}

export function useLoginActivity() {
  return useQuery({
    queryKey: ["notifications", "activity"],
    queryFn: () => NotificationsService.getActivity(),
    staleTime: 60_000,
  });
}
