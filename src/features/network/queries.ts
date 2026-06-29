"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NetworkService } from "./service";
import type { InviteStatus, SendInviteRequest, InviteQuota } from "@/types/mlm";

export function useNetworkTree() {
  return useQuery({
    queryKey: ["network", "tree"],
    queryFn: () => NetworkService.getTree(),
    staleTime: 120_000,
  });
}

export function useNetworkSubsets() {
  return useQuery({
    queryKey: ["network", "subsets"],
    queryFn: () => NetworkService.getSubsets(),
    staleTime: 120_000,
  });
}

export function useNetworkReferrer() {
  return useQuery({
    queryKey: ["network", "referrer"],
    queryFn: () => NetworkService.getReferrer(),
    staleTime: 300_000,
  });
}

export function useSendInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendInviteRequest) => NetworkService.sendInvite(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["network", "invited"] });
      qc.invalidateQueries({ queryKey: ["network", "invite-quota"] });
    },
  });
}

export function useNetworkInvited(status: InviteStatus | "all" | "pending" | "registered", q: string) {
  return useQuery({
    queryKey: ["network", "invited", status, q],
    queryFn: () => NetworkService.getInvited({ status, q }),
    staleTime: 60_000,
  });
}

export function useNetworkFunds() {
  return useQuery({
    queryKey: ["network", "funds"],
    queryFn: () => NetworkService.getFunds(),
    staleTime: 300_000,
  });
}

export function useSubmitReferrer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteCode: string) => NetworkService.submitReferrer(inviteCode),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["network", "tree"] });
      qc.invalidateQueries({ queryKey: ["network", "referrer"] });
      qc.invalidateQueries({ queryKey: ["network", "subsets"] });
    },
  });
}

export function useInviteQuota() {
  return useQuery<InviteQuota>({
    queryKey: ["network", "invite-quota"],
    queryFn: () => NetworkService.getInviteQuota(),
    staleTime: 30_000,
  });
}
