/**
 * Public club origin for SSO callbacks and absolute invite links.
 *
 * ArvanCloud terminates HTTPS on club.nibmarket.com and forwards to docker :3000.
 * SSO callbackUrl must always be that public HTTPS origin — never club-docker:3000.
 */

import { parseAppEnv } from "@/config/env-presets";

/** Canonical public front (CDN) — production. */
export const PRODUCTION_PUBLIC_ORIGIN = "https://club.nibmarket.com";

const LIVE_HOSTS = new Set(["club.nibmarket.com", "club-docker.nibmarket.com"]);

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

/** Browser location origin. Empty on the server. */
export function getBrowserOrigin(): string {
  if (typeof window === "undefined" || !window.location?.origin) {
    return "";
  }
  return trimTrailingSlash(window.location.origin);
}

function isLiveHostname(hostname: string): boolean {
  const host = hostname.toLowerCase().split(":")[0] ?? "";
  return LIVE_HOSTS.has(host);
}

/**
 * Origin used for SSO callback + public invite URLs.
 * Priority: NEXT_PUBLIC_PUBLIC_ORIGIN → live host → production APP_ENV → browser.
 */
export function getPublicClubOrigin(): string {
  const override = process.env.NEXT_PUBLIC_PUBLIC_ORIGIN?.trim();
  if (override) {
    return trimTrailingSlash(override);
  }

  if (typeof window !== "undefined" && isLiveHostname(window.location.hostname)) {
    return PRODUCTION_PUBLIC_ORIGIN;
  }

  const appEnv = parseAppEnv(process.env.NEXT_PUBLIC_APP_ENV ?? process.env.APP_ENV);
  if (appEnv === "production") {
    return PRODUCTION_PUBLIC_ORIGIN;
  }

  return getBrowserOrigin();
}

/**
 * Origin from an inbound HTTP request (X-Forwarded-* behind CDN).
 * Live / production always uses the canonical public HTTPS origin.
 */
export function getRequestOrigin(req: Request): string {
  const override = process.env.NEXT_PUBLIC_PUBLIC_ORIGIN?.trim();
  if (override) {
    return trimTrailingSlash(override);
  }

  const url = new URL(req.url);
  const forwardedHost = (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "")
    .split(",")[0]
    ?.trim()
    .toLowerCase();

  if (forwardedHost && isLiveHostname(forwardedHost)) {
    return PRODUCTION_PUBLIC_ORIGIN;
  }

  const appEnv = parseAppEnv(process.env.NEXT_PUBLIC_APP_ENV ?? process.env.APP_ENV);
  if (appEnv === "production") {
    return PRODUCTION_PUBLIC_ORIGIN;
  }

  const forwardedProto = (req.headers.get("x-forwarded-proto") ?? "")
    .split(",")[0]
    ?.trim()
    .toLowerCase();

  if (forwardedHost) {
    const proto =
      forwardedProto === "http" || forwardedProto === "https"
        ? forwardedProto
        : url.protocol.replace(":", "") || "https";
    return trimTrailingSlash(`${proto}://${forwardedHost}`);
  }

  return trimTrailingSlash(`${url.protocol}//${url.host}`);
}
