import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { MissionDef, MissionActivityPage, MissionActivityStatus } from "@/types/mlm";

export const MissionsService = {
  getList: (): Promise<MissionDef[]> =>
    apiClient.get(ENDPOINTS.MISSIONS.LIST),

  getActivity: (params: { page: number; status?: MissionActivityStatus | "all" }): Promise<MissionActivityPage> => {
    const search = new URLSearchParams({ page: String(params.page) });
    if (params.status && params.status !== "all") search.set("status", params.status);
    return apiClient.get(`${ENDPOINTS.MISSIONS.ACTIVITY}?${search}`);
  },
};
