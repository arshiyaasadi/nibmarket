import { buildBackendApiUrl } from "@/config/api-service";
import { internalServerError } from "@/lib/api/server/session";

const FORWARD_REQUEST_HEADERS = [
  "authorization",
  "content-type",
  "accept",
  "accept-language",
  "cookie",
  "x-forwarded-for",
  "x-real-ip",
  "user-agent",
] as const;

function pickForwardHeaders(req: Request): Headers {
  const headers = new Headers();
  for (const name of FORWARD_REQUEST_HEADERS) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

function copyResponseHeaders(source: Headers): Headers {
  const headers = new Headers();
  source.forEach((value, key) => {
    if (key.toLowerCase() === "transfer-encoding") return;
    headers.append(key, value);
  });
  return headers;
}

/**
 * Proxies an incoming BFF request to the external backend (API v2).
 * Path segments match the Prisma handler routes exactly (e.g. `wallet/summary`).
 */
export async function proxyRequestToBackend(
  req: Request,
  pathSegments: string[],
): Promise<Response> {
  const path = `/${pathSegments.join("/")}`;
  const url = new URL(req.url);
  const targetUrl = `${buildBackendApiUrl(path)}${url.search}`;

  if (process.env.NODE_ENV === "development") {
    console.log(`[api-service] ${req.method} → ${targetUrl}`);
  }

  const init: RequestInit = {
    method: req.method,
    headers: pickForwardHeaders(req),
    redirect: "manual",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(targetUrl, init);
  } catch {
    return internalServerError();
  }

  if (backendResponse.status >= 500) {
    return internalServerError();
  }

  const body = await backendResponse.arrayBuffer();

  return new Response(body, {
    status: backendResponse.status,
    statusText: backendResponse.statusText,
    headers: copyResponseHeaders(backendResponse.headers),
  });
}

/**
 * Server-side GET helper for explicit service calls (non-proxy use cases).
 */
export async function backendApiGet<T>(path: string, req: Request): Promise<T> {
  const url = new URL(req.url);
  const targetUrl = `${buildBackendApiUrl(path)}${url.search}`;
  const headers = pickForwardHeaders(req);

  const response = await fetch(targetUrl, { method: "GET", headers });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(`Backend API ${path} failed (${response.status}): ${JSON.stringify(error)}`);
  }
  return response.json() as Promise<T>;
}

/**
 * Server-side mutating helper for explicit service calls (non-proxy use cases).
 */
export async function backendApiMutate<T>(
  path: string,
  req: Request,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const targetUrl = buildBackendApiUrl(path);
  const headers = pickForwardHeaders(req);

  const response = await fetch(targetUrl, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      `Backend API ${method} ${path} failed (${response.status}): ${JSON.stringify(error)}`,
    );
  }
  return response.json() as Promise<T>;
}
