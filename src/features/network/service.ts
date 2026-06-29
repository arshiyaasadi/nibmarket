import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { InvitedPerson, InviteQuota, InviteStatus, NetworkFund, NetworkSubset, NetworkTreeNode, ReferrerInfo, SendInviteRequest, SendInviteResponse } from "@/types/mlm";

export const NetworkService = {
  getSubsets: (): Promise<NetworkSubset[]> =>
    apiClient.get(ENDPOINTS.NETWORK.SUBSETS),

  getTree: (): Promise<NetworkTreeNode> =>
    apiClient.get(ENDPOINTS.NETWORK.TREE),

  getReferrer: (): Promise<ReferrerInfo | null> =>
    apiClient.get(ENDPOINTS.NETWORK.REFERRER),

  sendInvite: (payload: SendInviteRequest): Promise<SendInviteResponse> =>
    apiClient.post(ENDPOINTS.NETWORK.SEND_INVITE, payload),

  submitReferrer: (inviteCode: string): Promise<void> =>
    apiClient.post(ENDPOINTS.NETWORK.SUBMIT_REFERRER, { inviteCode }),

  getInvited: (params: { status?: InviteStatus | "all" | "pending" | "registered"; q?: string }): Promise<InvitedPerson[]> => {
    const sp = new URLSearchParams();
    if (params.status && params.status !== "all") sp.set("status", params.status);
    if (params.q) sp.set("q", params.q);
    const qs = sp.toString();
    return apiClient.get(`${ENDPOINTS.NETWORK.INVITED}${qs ? "?" + qs : ""}`);
  },

  getFunds: (): Promise<NetworkFund[]> =>
    apiClient.get(ENDPOINTS.NETWORK.FUNDS),

  getInviteQuota: (): Promise<InviteQuota> =>
    apiClient.get(ENDPOINTS.NETWORK.INVITE_QUOTA),
};
