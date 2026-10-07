"use client";

import { useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/hooks/use-session";
import {
  buildSubsetTreeFromSubsets,
  wrapWithCurrentUserRoot,
} from "@/lib/network/subset-tree-builder";
import { displayPersonName } from "@/lib/person-name";
import { NetworkService } from "./service";
import type { InviteStatus, SendInviteRequest, InviteQuota } from "@/types/mlm";

export function useNetworkSubsets() {
  return useQuery({
    queryKey: ["network", "subsets"],
    queryFn: () => NetworkService.getSubsets(),
    staleTime: 120_000,
  });
}

/** Subset tree uses the same API as `/network/subsets`. */
export function useNetworkSubsetTree() {
  const { userId, fullName } = useSession();
  const query = useNetworkSubsets();

  const { root, truncated } = useMemo(() => {
    const rows = query.data ?? [];
    const { roots, truncated: isTruncated } = buildSubsetTreeFromSubsets(rows);
    const selfName = displayPersonName({ fullName, fallback: "-" });

    return {
      root: wrapWithCurrentUserRoot(
        roots,
        userId ? { id: userId, fullName: selfName } : null,
      ),
      truncated: isTruncated,
    };
  }, [query.data, userId, fullName]);

  return { ...query, root, truncated, subsets: query.data ?? [] };
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

export function useNetworkInvited(
  status: InviteStatus | "all" | "pending" | "registered",
  q: string,
) {
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

export function useInviteTemplates() {
  return useQuery({
    queryKey: ["network", "invite-templates"],
    queryFn: () => NetworkService.getInviteTemplates(),
    staleTime: 120_000,
  });
}
