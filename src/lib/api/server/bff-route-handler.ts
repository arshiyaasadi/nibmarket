import { isApiServiceMode } from "@/lib/api/server/services";
import { proxyRequestToBackend } from "@/lib/api/server/services/backend-api-service";
import { resolveHandler } from "@/lib/api/server/route-registry";
import { proxyToBackend } from "@/lib/api/server/proxy-handler";
import { NextResponse } from "next/server";

type Params = Promise<{ path: string[] }>;

export async function handleBffRequest(
  req: Request,
  context: { params: Params },
): Promise<Response> {
  const { path } = await context.params;

  if (isApiServiceMode()) {
    return proxyRequestToBackend(req, path);
  }

  const custom = resolveHandler(req.method, path);
  if (custom) {
    const result = await custom(req);
    if (result instanceof Response) return result;
    return NextResponse.json(result);
  }

  return proxyToBackend(req, path);
}

export function createBffRouteHandlers() {
  const handle = (req: Request, context: { params: Params }) =>
    handleBffRequest(req, context);

  return {
    GET: handle,
    POST: handle,
    PUT: handle,
    PATCH: handle,
    DELETE: handle,
  };
}
