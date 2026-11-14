"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthService } from "./service";
import type { KycVerifyRequest } from "@/types/mlm";

export const authProfileQueryKey = ["auth", "profile"] as const;

export function useAuthProfile(enabled = true) {
  return useQuery({
    queryKey: authProfileQueryKey,
    queryFn: () => AuthService.getProfile(),
    enabled,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useVerifyKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: KycVerifyRequest) => AuthService.verifyKyc(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authProfileQueryKey });
    },
  });
}
