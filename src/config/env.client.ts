import { z } from "zod";

import { ENV_PRESETS, parseAppEnv, resolveEnvValue, type AppEnv } from "./env-presets";

const optionalUrl = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z.string().url().optional(),
);

const clientSchema = z.object({
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "production"]),
  NEXT_PUBLIC_APP_NAME: z.string().min(1),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_AUTH_BASE_URL: z.string().url(),
  NEXT_PUBLIC_SSO_CALLBACK_PATH: z.string().min(1),
  NEXT_PUBLIC_PANEL_BASE_URL: optionalUrl,
  NEXT_PUBLIC_PANEL_LOGIN_URL: optionalUrl,
  NEXT_PUBLIC_SSO_ENTRY_COOKIE: z.string().min(1),
  NEXT_PUBLIC_PANEL_PROFILE_URL: optionalUrl,
  NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL: optionalUrl,
});

function createClientEnv() {
  const appEnv: AppEnv = parseAppEnv(process.env.NEXT_PUBLIC_APP_ENV);
  const preset = ENV_PRESETS[appEnv];

  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_APP_ENV: appEnv,
    NEXT_PUBLIC_APP_NAME: resolveEnvValue(process.env.NEXT_PUBLIC_APP_NAME, preset.appName),
    NEXT_PUBLIC_SITE_URL: resolveEnvValue(process.env.NEXT_PUBLIC_SITE_URL, preset.siteUrl),
    NEXT_PUBLIC_APP_URL: resolveEnvValue(process.env.NEXT_PUBLIC_APP_URL, preset.appUrl),
    NEXT_PUBLIC_AUTH_BASE_URL: resolveEnvValue(
      process.env.NEXT_PUBLIC_AUTH_BASE_URL,
      preset.authBaseUrl,
    ),
    NEXT_PUBLIC_SSO_CALLBACK_PATH: resolveEnvValue(
      process.env.NEXT_PUBLIC_SSO_CALLBACK_PATH,
      preset.ssoCallbackPath,
    ),
    NEXT_PUBLIC_PANEL_BASE_URL: resolveEnvValue(
      process.env.NEXT_PUBLIC_PANEL_BASE_URL,
      preset.panelBaseUrl,
    ),
    NEXT_PUBLIC_PANEL_LOGIN_URL: process.env.NEXT_PUBLIC_PANEL_LOGIN_URL,
    NEXT_PUBLIC_SSO_ENTRY_COOKIE: resolveEnvValue(
      process.env.NEXT_PUBLIC_SSO_ENTRY_COOKIE,
      preset.ssoEntryCookie,
    ),
    NEXT_PUBLIC_PANEL_PROFILE_URL: resolveEnvValue(
      process.env.NEXT_PUBLIC_PANEL_PROFILE_URL,
      preset.panelProfileUrl,
    ),
    NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL: resolveEnvValue(
      process.env.NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL,
      preset.panelUserAccountUrl,
    ),
  });

  if (!parsed.success) {
    console.error("❌ Client env validation failed:", parsed.error.flatten().fieldErrors);
    throw new Error("Invalid client environment variables");
  }

  return parsed.data;
}

export const clientEnv = createClientEnv();
