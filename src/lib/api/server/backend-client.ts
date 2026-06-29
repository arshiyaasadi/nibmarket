import { buildBackendApiUrl } from "@/config/api-service";

export async function backendFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const url = buildBackendApiUrl(path);

  return fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
}
