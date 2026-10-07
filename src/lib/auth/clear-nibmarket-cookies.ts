import { env } from "@/config/env";

function parentCookieDomain(hostname: string): string | null {
  const parts = hostname.split(".").filter(Boolean);
  if (parts.length < 2) return null;
  return `.${parts.slice(-2).join(".")}`;
}

function domainsFromUrl(value: string | undefined): string[] {
  if (!value) return [];
  try {
    const host = new URL(value).hostname;
    const out = [host];
    const parent = parentCookieDomain(host);
    if (parent) out.push(parent);
    return out;
  } catch {
    return [];
  }
}

/**
 * Clear NIB Market SSO cookies from the browser.
 * Uses Domain=.nibmarket.com / .nibdev.com as advised by the Nibmarket team.
 * Browsers only honor Domain for the current site's eTLD+1; this is still the
 * agreed client-side attempt alongside BFF logout.
 */
export function clearNibmarketSsoCookies(): void {
  if (typeof document === "undefined") return;

  const names = Array.from(
    new Set([
      env.SSO_ENTRY_COOKIE || "nib_auth",
      "nib_auth",
      "nib_refresh",
      "nib_user_role",
      "nib_username",
    ]),
  );

  const domains = new Set<string>([
    ...domainsFromUrl(env.PANEL_BASE_URL),
    ...domainsFromUrl(env.AUTH_BASE_URL),
    ".nibmarket.com",
    ".nibdev.com",
  ]);

  for (const name of names) {
    for (const domain of domains) {
      document.cookie = `${name}=; Domain=${domain}; Path=/; Max-Age=0; Secure; SameSite=Lax`;
      document.cookie = `${name}=; Domain=${domain}; Path=/; Max-Age=0; SameSite=Lax`;
    }
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
  }
}
