export interface ApiTestConfig {
  /** BFF base URL — e.g. http://localhost:3000/api/v1 */
  baseUrl: string;
  /** Direct backend URL for parity tests — e.g. https://api-club.nibdev.com/api/v2 */
  backendBaseUrl: string;
  mobile: string;
  password: string;
  accessToken?: string;
  serviceMode: "prisma" | "api";
}

export function loadTestConfig(): ApiTestConfig {
  const baseUrl = process.env.API_TEST_BASE_URL ?? "http://localhost:3000/api/v2";
  const backendBaseUrl =
    process.env.API_TEST_BACKEND_URL ?? "https://api-club.nibdev.com/api/v2";
  const mobile = process.env.API_TEST_MOBILE ?? "09123456789";
  const password = process.env.API_TEST_PASSWORD ?? "Test@1234";
  const serviceMode = (process.env.API_TEST_SERVICE_MODE ?? "prisma") as "prisma" | "api";

  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    backendBaseUrl: backendBaseUrl.replace(/\/$/, ""),
    mobile,
    password,
    accessToken: process.env.API_TEST_ACCESS_TOKEN,
    serviceMode,
  };
}

export function resolveTargetBaseUrl(config: ApiTestConfig): string {
  return config.serviceMode === "api" ? config.backendBaseUrl : config.baseUrl;
}
