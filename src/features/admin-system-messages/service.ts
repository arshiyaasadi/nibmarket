import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  AdminPaginatedResponse,
  CreateNotificationGroupRequest,
  CreateSystemMessageRequest,
  NotificationGroup,
  NotificationGroupDetail,
  SystemMessageCampaign,
  UpdateNotificationGroupRequest,
} from "@/types/admin";

export const AdminSystemMessagesService = {
  listGroups: (
    params: {
      page?: number;
      pageSize?: number;
      search?: string;
    } = {},
  ): Promise<AdminPaginatedResponse<NotificationGroup>> => {
    const search = new URLSearchParams();
    search.set("page", String(params.page ?? 0));
    search.set("pageSize", String(params.pageSize ?? 50));
    if (params.search) search.set("search", params.search);
    return apiClient.get(`${ENDPOINTS.ADMIN.NOTIFICATION_GROUPS.LIST}?${search}`);
  },

  getGroup: (id: string): Promise<NotificationGroupDetail> =>
    apiClient.get(ENDPOINTS.ADMIN.NOTIFICATION_GROUPS.DETAIL(id)),

  createGroup: (body: CreateNotificationGroupRequest): Promise<NotificationGroupDetail> =>
    apiClient.post(ENDPOINTS.ADMIN.NOTIFICATION_GROUPS.CREATE, body),

  updateGroup: (
    id: string,
    body: UpdateNotificationGroupRequest,
  ): Promise<NotificationGroupDetail> =>
    apiClient.patch(ENDPOINTS.ADMIN.NOTIFICATION_GROUPS.UPDATE(id), body),

  deleteGroup: (id: string): Promise<{ ok: true }> =>
    apiClient.delete(ENDPOINTS.ADMIN.NOTIFICATION_GROUPS.DELETE(id)),

  listCampaigns: (
    params: {
      page?: number;
      pageSize?: number;
      status?: string;
      search?: string;
    } = {},
  ): Promise<AdminPaginatedResponse<SystemMessageCampaign>> => {
    const search = new URLSearchParams();
    search.set("page", String(params.page ?? 0));
    search.set("pageSize", String(params.pageSize ?? 20));
    if (params.status) search.set("status", params.status);
    if (params.search) search.set("search", params.search);
    return apiClient.get(`${ENDPOINTS.ADMIN.SYSTEM_MESSAGES.LIST}?${search}`);
  },

  createCampaign: (body: CreateSystemMessageRequest): Promise<SystemMessageCampaign> =>
    apiClient.post(ENDPOINTS.ADMIN.SYSTEM_MESSAGES.CREATE, body),

  deleteCampaign: (id: string): Promise<{ id: string; status: string; deletedAt: string | null }> =>
    apiClient.delete(ENDPOINTS.ADMIN.SYSTEM_MESSAGES.DELETE(id)),
};
