import { QueryClient } from "@tanstack/react-query";
import { handleApiError } from "@/lib/errors/error-handler";

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: (failureCount, error) => {
          const appError = handleApiError(error);
          if (appError.code === "UNAUTHORIZED" || appError.code === "NOT_FOUND") {
            return false;
          }
          return failureCount < 2;
        },
      },
    },
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
