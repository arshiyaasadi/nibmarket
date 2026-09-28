import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { mapNetworkSubsets } from "@/lib/network/subset-mapper";
import { normalizeInvitedList } from "@/lib/mock/network-normalize";
import { normalizeInviteTemplates, type InviteTemplate } from "@/lib/network/invite-templates";
import type {
  InvitedPerson,
  InviteQuota,
  InviteStatus,
  NetworkFund,
  NetworkSubset,
  SendInviteRequest,
  SendInviteResponse,
} from "@/types/mlm";

export const NetworkService = {
  getSubsets: async (): Promise<NetworkSubset[]> => {
    const raw = await apiClient.get<unknown>(ENDPOINTS.NETWORK.SUBSETS);
    return mapNetworkSubsets(raw);
  },

  sendInvite: (payload: SendInviteRequest): Promise<SendInviteResponse> =>
    apiClient.post(ENDPOINTS.NETWORK.SEND_INVITE, payload),

  submitReferrer: (inviteCode: string): Promise<void> =>
    apiClient.post(ENDPOINTS.NETWORK.SUBMIT_REFERRER, { inviteCode }),

  getInvited: async (params: {
    status?: InviteStatus | "all" | "pending" | "registered";
    q?: string;
  }): Promise<InvitedPerson[]> => {
    const items = await apiClient.get<InvitedPerson[]>(ENDPOINTS.NETWORK.INVITED);
    return normalizeInvitedList(items, params);
  },

  getFunds: (): Promise<NetworkFund[]> => apiClient.get(ENDPOINTS.NETWORK.FUNDS),

  getInviteQuota: (): Promise<InviteQuota> => apiClient.get(ENDPOINTS.NETWORK.INVITE_QUOTA),

  getInviteTemplates: async (): Promise<InviteTemplate[]> => {
    const raw = await apiClient.get<unknown>(ENDPOINTS.NETWORK.INVITE_TEMPLATES);
    return normalizeInviteTemplates(raw);
  },
};
