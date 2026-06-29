import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { Notification, LoginActivity, NotificationType, Paginated } from "@/types/mlm";

export const NotificationsService = {
  getList: (type?: NotificationType): Promise<Paginated<Notification>> =>
    apiClient.get(`${ENDPOINTS.NOTIFICATIONS.LIST}${type ? `?type=${type}` : ""}`),

  getActivity: (): Promise<LoginActivity[]> =>
    apiClient.get(ENDPOINTS.NOTIFICATIONS.ACTIVITY),
};
