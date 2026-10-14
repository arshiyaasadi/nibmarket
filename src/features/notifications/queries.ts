"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Notification, NotificationType, Paginated } from "@/types/mlm";
import { NotificationsService, type NotificationsListParams } from "./service";

function markAllReadInCache(
  old: Paginated<Notification> | undefined,
): Paginated<Notification> | undefined {
  if (!old) return old;
  return {
    ...old,
    items: old.items.map((item) => (item.isRead ? item : { ...item, isRead: true })),
  };
}

function markOneReadInCache(
  old: Paginated<Notification> | undefined,
  id: string,
): Paginated<Notification> | undefined {
  if (!old) return old;
  return {
    ...old,
    items: old.items.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
  };
}

export function useNotifications(params: NotificationsListParams | NotificationType = {}) {
  const normalized: NotificationsListParams =
    typeof params === "string" ? { type: params } : params;

  return useQuery({
    queryKey: ["notifications", normalized],
    queryFn: () => NotificationsService.getList(normalized),
  });
}

export function useLoginActivity() {
  return useQuery({
    queryKey: ["notifications", "activity"],
    queryFn: () => NotificationsService.getActivity(),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => NotificationsService.markRead(id),
    onSuccess: (_data, id) => {
      qc.setQueriesData<Paginated<Notification>>({ queryKey: ["notifications"] }, (old) =>
        markOneReadInCache(old, id),
      );
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => NotificationsService.markAllRead(),
    onSuccess: () => {
      // Optimistic update only — avoid invalidate/refetch toast when list GET is flaky.
      qc.setQueriesData<Paginated<Notification>>(
        { queryKey: ["notifications"] },
        markAllReadInCache,
      );
    },
  });
}
