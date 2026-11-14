import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { AuthProfile, KycVerifyRequest, KycVerifyResponse } from "@/types/mlm";

export const AuthService = {
  getProfile: (): Promise<AuthProfile> => apiClient.get(ENDPOINTS.AUTH.PROFILE),

  verifyKyc: (body: KycVerifyRequest): Promise<KycVerifyResponse> =>
    apiClient.post(ENDPOINTS.AUTH.KYC_VERIFY, body),
};
