import { isApiServiceMode } from "@/lib/api/server/services";
import { proxyRequestToBackend } from "@/lib/api/server/services/backend-api-service";
import { resolveHandler } from "@/lib/api/server/route-registry";
import { proxyToBackend } from "@/lib/api/server/proxy-handler";
import { sessionEstablishHandler } from "@/lib/api/server/handlers/auth.handler";
import { internalServerError } from "@/lib/api/server/session";
import { logger } from "@/lib/errors/logger";
import { NextResponse } from "next/server";

type Params = Promise<{ path: string[] }>;

const LOCAL_ONLY_ROUTES: Record<string, (req: Request) => Promise<Response>> = {
  "POST:/auth/session/establish": sessionEstablishHandler,
};

export async function handleBffRequest(
  req: Request,
  context: { params: Params },
): Promise<Response> {
  try {
    const { path } = await context.params;
    const routeKey = `${req.method}:/${path.join("/")}`;
    const localHandler = LOCAL_ONLY_ROUTES[routeKey];
    if (localHandler) {
      return await localHandler(req);
    }

    if (isApiServiceMode()) {
      return await proxyRequestToBackend(req, path);
    }

    // mock mode — local BFF handlers with in-memory fixtures
    const custom = resolveHandler(req.method, path);
    if (custom) {
      const result = await custom(req);
      if (result instanceof Response) return result;
      return NextResponse.json(result);
    }

    return await proxyToBackend(req, path);
  } catch (error) {
    logger.error("BFF unhandled error", error);
    return internalServerError();
  }
}

export function createBffRouteHandlers() {
  const handle = (req: Request, context: { params: Params }) => handleBffRequest(req, context);

  return {
    GET: handle,
    POST: handle,
    PUT: handle,
    PATCH: handle,
    DELETE: handle,
  };
}
