import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Notification, LoginActivity, NotificationType, Paginated } from "@/types/mlm";

export type NotificationsListParams = {
  type?: NotificationType;
  page?: number;
  limit?: number;
};

export const NotificationsService = {
  getList: (params: NotificationsListParams = {}): Promise<Paginated<Notification>> => {
    const search = new URLSearchParams();
    if (params.type) search.set("type", params.type);
    if (params.page != null) search.set("page", String(params.page));
    if (params.limit != null) search.set("limit", String(params.limit));
    const qs = search.toString();
    return apiClient.get(`${ENDPOINTS.NOTIFICATIONS.LIST}${qs ? `?${qs}` : ""}`);
  },

  getActivity: (): Promise<LoginActivity[]> => apiClient.get(ENDPOINTS.NOTIFICATIONS.ACTIVITY),

  markRead: (id: string): Promise<{ id: string; isRead: true }> =>
    apiClient.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(id), {}),

  markAllRead: async (): Promise<{ ok: boolean; updated: number }> => {
    const result = await apiClient.post<{ ok?: boolean; updated?: number } | undefined>(
      ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ,
      {},
    );
    return {
      ok: result?.ok ?? true,
      updated: result?.updated ?? 0,
    };
  },
};
