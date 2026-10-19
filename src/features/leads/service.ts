import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type {
  RegistrationLinkLeadRequest,
  RegistrationLinkLeadResponse,
  RegistrationLinkLeadSource,
} from "@/types/mlm";

export const LeadsService = {
  requestRegistrationLink: (params: {
    mobile: string;
    source: RegistrationLinkLeadSource;
  }): Promise<RegistrationLinkLeadResponse> => {
    const body: RegistrationLinkLeadRequest = {
      mobile: params.mobile,
      source: params.source,
    };
    return apiClient.post(ENDPOINTS.LEADS.REGISTRATION_LINK, body);
  },
};
