/**
 * Single source of truth for zone-specific URLs and shared constants.
 * Override any value via explicit env vars in `.env` / `.env.local`.
 *
 * Club front public host is NOT here — derive from the request / browser
 * (`src/config/public-origin.ts`).
 */

export type AppEnv = "development" | "production";

export type EnvPreset = {
  appName: string;
  backendApiBaseUrl: string;
  backendApiVersion: string;
  /** NIB account auth host (refresh / logout). */
  authBaseUrl: string;
  ssoCheckTokenUrl: string;
  ssoCallbackPath: string;
  ssoEntryCookie: string;
  panelBaseUrl: string;
  panelProfileUrl: string;
  panelUserAccountUrl: string;
};

const SHARED = {
  appName: "Nib Club",
  backendApiVersion: "v2",
  /** Callback lands on this Next.js panel — not the club backend API. */
  ssoCallbackPath: "/login/sso",
  ssoEntryCookie: "nib_auth",
} as const;

function panelUrls(panelBase: string) {
  const base = panelBase.replace(/\/+$/, "");
  return {
    panelBaseUrl: base,
    panelProfileUrl: `${base}/profile/`,
    panelUserAccountUrl: `${base}/user-account/`,
    ssoCheckTokenUrl: `${base}/api/v1/auth/check_token`,
  };
}

export const ENV_PRESETS: Record<AppEnv, EnvPreset> = {
  development: {
    ...SHARED,
    backendApiBaseUrl: "https://api-club.nibdev.com",
    authBaseUrl: "https://auth.nibdev.com",
    ...panelUrls("https://panel.nibdev.com"),
  },
  production: {
    ...SHARED,
    backendApiBaseUrl: "https://club-srv.nibmarket.com",
    authBaseUrl: "https://auth.nibmarket.com",
    ...panelUrls("https://panel.nibmarket.com"),
  },
};

export function parseAppEnv(value: string | undefined): AppEnv {
  if (value === "production") return "production";
  return "development";
}

/** Prefer an explicit non-empty env override; otherwise use the preset value. */
export function resolveEnvValue(explicit: string | undefined, presetValue: string): string {
  if (explicit !== undefined && explicit !== "") {
    return explicit;
  }
  return presetValue;
}
