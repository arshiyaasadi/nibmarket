import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { mergeMehrUserMissions } from "@/resources/data/mehr-missions";
import type {
  MarketingBadgeItem,
  MarketingBadgesResponse,
  MissionCompleteResponse,
  MissionDef,
  MissionActivityPage,
  MissionActivityStatus,
  MissionSectionResponse,
} from "@/types/mlm";

async function getSectionItems(path: string): Promise<MissionDef[]> {
  const res = await apiClient.get<MissionSectionResponse>(path);
  return res.items ?? [];
}

export const MissionsService = {
  getList: async (): Promise<MissionDef[]> => {
    const list = await apiClient.get<MissionDef[]>(ENDPOINTS.MISSIONS.LIST);
    return mergeMehrUserMissions(list);
  },

  getPromotion: (): Promise<MissionDef[]> => getSectionItems(ENDPOINTS.MISSIONS.SECTIONS.PROMOTION),

  getOnboarding: (): Promise<MissionDef[]> =>
    getSectionItems(ENDPOINTS.MISSIONS.SECTIONS.ONBOARDING),

  getMarketing: (): Promise<MissionDef[]> => getSectionItems(ENDPOINTS.MISSIONS.SECTIONS.MARKETING),

  getBadges: async (): Promise<MarketingBadgeItem[]> => {
    const res = await apiClient.get<MarketingBadgesResponse>(ENDPOINTS.MISSIONS.SECTIONS.BADGES);
    return res.items ?? [];
  },

  getActivity: (params: {
    page: number;
    status?: MissionActivityStatus | "all";
  }): Promise<MissionActivityPage> => {
    const search = new URLSearchParams({ page: String(params.page) });
    if (params.status && params.status !== "all") search.set("status", params.status);
    return apiClient.get(`${ENDPOINTS.MISSIONS.ACTIVITY}?${search}`);
  },

  completeByCode: (code: string): Promise<MissionCompleteResponse> =>
    apiClient.post(ENDPOINTS.MISSIONS.COMPLETE, { code }),
};
