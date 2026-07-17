import { z } from "zod";

import { ENV_PRESETS, parseAppEnv, resolveEnvValue, type AppEnv } from "./env-presets";

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);

const apiServiceMode = z.enum(["mock", "api"]).default("mock");

const serverSchema = z.object({
  APP_ENV: z.enum(["development", "production"]),
  /** `mock` = BFF handlers + in-memory fixtures; `api` = proxy to external backend. */
  API_SERVICE_MODE: apiServiceMode,
  BACKEND_API_BASE_URL: z.string().url(),
  BACKEND_API_VERSION: z.string().min(1),
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

export type ServerEnv = z.infer<typeof serverSchema>;

function buildPlaceholder(appEnv: AppEnv): ServerEnv {
  const preset = ENV_PRESETS[appEnv];
  return {
    APP_ENV: appEnv,
    API_SERVICE_MODE: "api",
    BACKEND_API_BASE_URL: preset.backendApiBaseUrl,
    BACKEND_API_VERSION: preset.backendApiVersion,
    SSO_CHECK_TOKEN_URL: preset.ssoCheckTokenUrl,
    AUTH_SECRET: "docker-build-placeholder-secret-32ch",
    ACCESS_TOKEN_TTL_SECONDS: 900,
    REFRESH_TOKEN_TTL_SECONDS: 2_592_000,
  };
}

function isBuildPhase(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" || process.env.NEXT_PHASE === "phase-export"
  );
}

function createServerEnv(): ServerEnv {
  const appEnv = parseAppEnv(process.env.APP_ENV ?? process.env.NEXT_PUBLIC_APP_ENV);
  const preset = ENV_PRESETS[appEnv];

  const parsed = serverSchema.safeParse({
    APP_ENV: appEnv,
    API_SERVICE_MODE: process.env.API_SERVICE_MODE,
    BACKEND_API_BASE_URL: resolveEnvValue(
      process.env.BACKEND_API_BASE_URL,
      preset.backendApiBaseUrl,
    ),
    BACKEND_API_VERSION: resolveEnvValue(process.env.BACKEND_API_VERSION, preset.backendApiVersion),
    BACKEND_API_URL: process.env.BACKEND_API_URL,
    SSO_CHECK_TOKEN_URL: resolveEnvValue(process.env.SSO_CHECK_TOKEN_URL, preset.ssoCheckTokenUrl),
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

let cachedServerEnv: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  if (isBuildPhase()) {
    const appEnv = parseAppEnv(process.env.APP_ENV ?? process.env.NEXT_PUBLIC_APP_ENV);
    return buildPlaceholder(appEnv);
  }

  if (!cachedServerEnv) {
    cachedServerEnv = createServerEnv();
  }

  return cachedServerEnv;
}

export const serverEnv: ServerEnv = new Proxy({} as ServerEnv, {
  get(_target, prop: string | symbol) {
    return Reflect.get(getServerEnv(), prop);
  },
});
