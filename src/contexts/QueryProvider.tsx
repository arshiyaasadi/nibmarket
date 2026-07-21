"use client";

import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { ApiErrorToaster, showApiErrorToast } from "@/components/molecules/ApiErrorToaster";
import { handleApiError, resolveUserErrorMessage } from "@/lib/errors/error-handler";

function shouldRetry(failureCount: number, error: unknown): boolean {
  const appError = handleApiError(error);
  if (appError.code === "UNAUTHORIZED" || appError.code === "NOT_FOUND") {
    return false;
  }
  return failureCount < 2;
}

function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: shouldRetry,
      },
    },
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.meta?.silent) return;
        showApiErrorToast(resolveUserErrorMessage(error));
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.silent) return;
        showApiErrorToast(resolveUserErrorMessage(error));
      },
    }),
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === "undefined") {
    return createQueryClient();
  }
  if (!browserQueryClient) {
    browserQueryClient = createQueryClient();
  }
  return browserQueryClient;
}

export function clearQueryCache(): void {
  getQueryClient().clear();
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={client}>
      {children}
      <ApiErrorToaster />
    </QueryClientProvider>
  );
}
