/**
 * Public club origin — derived from the current browser location or inbound request.
 * Do not put the front domain in env; nginx Host / the page URL is the source of truth.
 */

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

/** Browser origin (SSO callback, invite links). Empty when called on the server. */
export function getBrowserOrigin(): string {
  if (typeof window === "undefined" || !window.location?.origin) {
    return "";
  }
  return trimTrailingSlash(window.location.origin);
}

/**
 * Origin for the public club front from an inbound HTTP request
 * (respects X-Forwarded-Host / X-Forwarded-Proto behind nginx).
 */
export function getRequestOrigin(req: Request): string {
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
