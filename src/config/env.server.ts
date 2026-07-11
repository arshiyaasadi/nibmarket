import { z } from "zod";

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);

const apiServiceMode = z.enum(["mock", "api"]).default("mock");

const serverSchema = z.object({
  /** `mock` = BFF handlers + in-memory fixtures; `api` = proxy to external backend. */
  API_SERVICE_MODE: apiServiceMode,
  BACKEND_API_BASE_URL: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().url().default("https://api-club.nibdev.com"),
  ),
  BACKEND_API_VERSION: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.string().default("v2"),
  ),
  /** @deprecated Use BACKEND_API_BASE_URL + BACKEND_API_VERSION instead. */
  BACKEND_API_URL: z.string().url().optional(),
  SSO_CHECK_TOKEN_URL: optionalUrl,
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET باید حداقل ۳۲ کاراکتر باشد"),
  ACCESS_TOKEN_TTL_SECONDS: z
    .string()
    .default("900")
    .transform((v) => parseInt(v, 10)),
  REFRESH_TOKEN_TTL_SECONDS: z
    .string()
    .default("2592000")
    .transform((v) => parseInt(v, 10)),
});

function createServerEnv() {
  const parsed = serverSchema.safeParse({
    API_SERVICE_MODE: process.env.API_SERVICE_MODE,
    BACKEND_API_BASE_URL: process.env.BACKEND_API_BASE_URL,
    BACKEND_API_VERSION: process.env.BACKEND_API_VERSION,
    BACKEND_API_URL: process.env.BACKEND_API_URL,
    SSO_CHECK_TOKEN_URL: process.env.SSO_CHECK_TOKEN_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    ACCESS_TOKEN_TTL_SECONDS: process.env.ACCESS_TOKEN_TTL_SECONDS,
    REFRESH_TOKEN_TTL_SECONDS: process.env.REFRESH_TOKEN_TTL_SECONDS,
  });

  if (!parsed.success) {
    console.error("❌ Server env validation failed:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid server environment variables");
  }

  return parsed.data;
}

export const serverEnv = createServerEnv();
