/**
 * Public club origin for SSO callbacks and absolute invite links.
 *
 * Live edge (club.nibmarket.com :80/:443) terminates TLS and forwards to the
 * docker host :3000. Browser may open club-docker:3000 for debug — SSO must
 * still use the public production origin, not the docker host.
 */

import { parseAppEnv } from "@/config/env-presets";

/** Canonical public front (edge) — production only. */
export const PRODUCTION_PUBLIC_ORIGIN = "https://club.nibmarket.com";

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

/**
 * Origin used for SSO callback + public invite URLs.
 * - production: always PRODUCTION_PUBLIC_ORIGIN (or NEXT_PUBLIC_PUBLIC_ORIGIN)
 * - development: current browser origin (or request Host)
 */
export function getPublicClubOrigin(): string {
  const override = process.env.NEXT_PUBLIC_PUBLIC_ORIGIN?.trim();
  if (override) {
    return trimTrailingSlash(override);
  }

  const appEnv = parseAppEnv(process.env.NEXT_PUBLIC_APP_ENV ?? process.env.APP_ENV);
  if (appEnv === "production") {
    return PRODUCTION_PUBLIC_ORIGIN;
  }

  return getBrowserOrigin();
}

/**
 * Origin from an inbound HTTP request (X-Forwarded-* behind an edge proxy).
 * In production still prefers the canonical public origin for absolute links.
 */
export function getRequestOrigin(req: Request): string {
  const appEnv = parseAppEnv(process.env.NEXT_PUBLIC_APP_ENV ?? process.env.APP_ENV);
  if (appEnv === "production") {
    const override = process.env.NEXT_PUBLIC_PUBLIC_ORIGIN?.trim();
    return trimTrailingSlash(override || PRODUCTION_PUBLIC_ORIGIN);
  }

  const url = new URL(req.url);
  const forwardedHost = (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "")
    .split(",")[0]
    ?.trim();
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
