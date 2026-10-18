import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { mergeMehrUserMissions } from "@/resources/data/mehr-missions";
import type { MissionDef, MissionActivityPage, MissionActivityStatus } from "@/types/mlm";

export const MissionsService = {
  getList: async (): Promise<MissionDef[]> => {
    const list = await apiClient.get<MissionDef[]>(ENDPOINTS.MISSIONS.LIST);
    return mergeMehrUserMissions(list);
  },

  getActivity: (params: {
    page: number;
    status?: MissionActivityStatus | "all";
  }): Promise<MissionActivityPage> => {
    const search = new URLSearchParams({ page: String(params.page) });
    if (params.status && params.status !== "all") search.set("status", params.status);
    return apiClient.get(`${ENDPOINTS.MISSIONS.ACTIVITY}?${search}`);
  },
};
