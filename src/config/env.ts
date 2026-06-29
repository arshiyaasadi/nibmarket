import { clientEnv } from "./env.client";

// Client-safe env — only NEXT_PUBLIC_* vars.
// For server-only env (DATABASE_URL), import from env.server.ts.
export const env = {
  SITE_URL: clientEnv.NEXT_PUBLIC_SITE_URL,
  APP_URL: clientEnv.NEXT_PUBLIC_APP_URL ?? clientEnv.NEXT_PUBLIC_SITE_URL,
  APP_NAME: clientEnv.NEXT_PUBLIC_APP_NAME,
  SSO_CALLBACK_PATH: clientEnv.NEXT_PUBLIC_SSO_CALLBACK_PATH,
  PANEL_BASE_URL: clientEnv.NEXT_PUBLIC_PANEL_BASE_URL,
  PANEL_LOGIN_URL: clientEnv.NEXT_PUBLIC_PANEL_LOGIN_URL,
  SSO_ENTRY_COOKIE: clientEnv.NEXT_PUBLIC_SSO_ENTRY_COOKIE,
  PANEL_PROFILE_URL: clientEnv.NEXT_PUBLIC_PANEL_PROFILE_URL,
  PANEL_USER_ACCOUNT_URL: clientEnv.NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL,
} as const;
