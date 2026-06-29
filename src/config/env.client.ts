import { z } from "zod";

const optionalUrl = z.preprocess(
  (value) => value === "" ? undefined : value,
  z.string().url().optional(),
);

const clientSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().default("Nib Club"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_APP_URL: optionalUrl,
  NEXT_PUBLIC_SSO_CALLBACK_PATH: z.string().default("/login/sso"),
  NEXT_PUBLIC_PANEL_BASE_URL: optionalUrl,
  NEXT_PUBLIC_PANEL_LOGIN_URL: optionalUrl,
  NEXT_PUBLIC_SSO_ENTRY_COOKIE: z.string().default("nib_auth"),
  NEXT_PUBLIC_PANEL_PROFILE_URL: optionalUrl,
  NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL: optionalUrl,
});

function createClientEnv() {
  const parsed = clientSchema.safeParse({
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SSO_CALLBACK_PATH: process.env.NEXT_PUBLIC_SSO_CALLBACK_PATH,
    NEXT_PUBLIC_PANEL_BASE_URL: process.env.NEXT_PUBLIC_PANEL_BASE_URL,
    NEXT_PUBLIC_PANEL_LOGIN_URL: process.env.NEXT_PUBLIC_PANEL_LOGIN_URL,
    NEXT_PUBLIC_SSO_ENTRY_COOKIE: process.env.NEXT_PUBLIC_SSO_ENTRY_COOKIE,
    NEXT_PUBLIC_PANEL_PROFILE_URL: process.env.NEXT_PUBLIC_PANEL_PROFILE_URL,
    NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL: process.env.NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL,
  });

  if (!parsed.success) {
    console.error(
      "❌ Client env validation failed:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid client environment variables");
  }

  return parsed.data;
}

export const clientEnv = createClientEnv();
