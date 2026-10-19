import { isApiServiceMode } from "@/lib/api/server/services";
import { proxyRequestToBackend } from "@/lib/api/server/services/backend-api-service";
import { resolveHandler } from "@/lib/api/server/route-registry";
import { proxyToBackend } from "@/lib/api/server/proxy-handler";
import { tryHandleDevAdminAuth } from "@/lib/api/server/dev-admin-auth";
import {
  logoutHandler,
  refreshHandler,
  sessionEstablishHandler,
} from "@/lib/api/server/handlers/auth.handler";
import { ssoCompleteHandler } from "@/lib/api/server/handlers/auth-sso.handler";
import { adminUsersGeoHandler } from "@/lib/api/server/handlers/admin.handler";
import {
  missionsSectionBadgesHandler,
  missionsSectionMarketingHandler,
  missionsSectionOnboardingHandler,
  missionsSectionPromotionHandler,
} from "@/lib/api/server/handlers/missions.handler";
import { leadsRegistrationLinkHandler } from "@/lib/api/server/handlers/leads.handler";
import { isDevAdminAuthEnabled } from "@/config/dev-admin-auth";
import { internalServerError } from "@/lib/api/server/session";
import { logger } from "@/lib/errors/logger";
import { NextResponse } from "next/server";

type Params = Promise<{ path: string[] }>;

const LOCAL_ONLY_ROUTES: Record<string, (req: Request) => Promise<Response>> = {
  "POST:/auth/session/establish": sessionEstablishHandler,
  // BFF owns session cookies + NIB auth proxy (never hit from browser).
  "POST:/auth/logout": logoutHandler,
  "POST:/auth/refresh": refreshHandler,
  "POST:/auth/sso/complete": ssoCompleteHandler,
  // The density map has no backend counterpart — it is served from fixtures in every mode.
  "GET:/admin/users/geo": adminUsersGeoHandler,
  // Section + lead contracts not on club BE yet — merge live list / mock seed (see backend-inbox).
  "GET:/missions/sections/promotion": missionsSectionPromotionHandler,
  "GET:/missions/sections/onboarding": missionsSectionOnboardingHandler,
  "GET:/missions/sections/marketing": missionsSectionMarketingHandler,
  "GET:/missions/sections/badges": missionsSectionBadgesHandler,
  "POST:/leads/registration-link": leadsRegistrationLinkHandler,
};

async function tryLocalHandler(
  method: string,
  path: string[],
  req: Request,
): Promise<Response | null> {
  const custom = resolveHandler(method, path);
  if (!custom) return null;
  const result = await custom(req);
  if (result instanceof Response) return result;
  return NextResponse.json(result);
}

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

    const devAdminResponse = await tryHandleDevAdminAuth(routeKey, req);
    if (devAdminResponse) {
      return devAdminResponse;
    }

    // Dev-admin virtual sessions: keep refresh local so API mode does not 401.
    if (isDevAdminAuthEnabled() && routeKey === "POST:/auth/refresh") {
      const local = await tryLocalHandler(req.method, path, req);
      if (local && local.status !== 401) return local;
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
