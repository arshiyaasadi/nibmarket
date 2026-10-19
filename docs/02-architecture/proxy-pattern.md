# BFF proxy pattern

The browser only talks to Next.js under `/api/v2/*`. Club BE (when used) is reached from the server.

## Why BFF

| Reason | Detail |
|--------|--------|
| Secrets | Backend URL / service credentials stay server-side |
| Session | httpOnly cookies + refresh owned by BFF |
| Mode switch | Same client paths for mock UI-dev and live API |
| Local contracts | Routes club BE does not ship yet can stay `LOCAL_ONLY` |

## Flow

```
Browser  fetch("/api/v2/…")
  → src/app/api/v2/[...path]/route.ts
  → handleBffRequest (lib/api/server/bff-route-handler.ts)
       ├─ LOCAL_ONLY_ROUTES?  → local handler (always)
       ├─ API_SERVICE_MODE=api → proxyRequestToBackend
       └─ mock / UI_DEV       → route-registry handler → mock repositories
```

## Key files

| File | Role |
|------|------|
| `src/app/api/v2/[...path]/route.ts` | Catch-all |
| `src/lib/api/server/bff-route-handler.ts` | Mode + LOCAL_ONLY |
| `src/lib/api/server/route-registry.ts` | `METHOD:/path` → handler |
| `src/lib/api/server/services/backend-api-service.ts` | Upstream proxy / `backendApiGet` |
| `src/lib/api/server/session.ts` | Auth helpers |
| `src/lib/api/server/handlers/*.ts` | Domain handlers |
| `src/config/api-service.ts` | `API_SERVICE_MODE`, UI-dev flags |

## LOCAL_ONLY examples

Used when the FE contract exists but club BE is not ready (or must stay on BFF forever):

- Mission section lists + badges
- Landing `POST /leads/registration-link`
- Session establish / logout / refresh / SSO complete
- Admin users geo density map

See `LOCAL_ONLY_ROUTES` in `bff-route-handler.ts` and open BE work in `novin-club-work/backend-inbox.md`.

## Client rules

1. Import paths only from `ENDPOINTS` (`src/lib/api/endpoints.ts`).
2. Use `apiClient` — do not `fetch` club BE from the browser.
3. DTO types live in `src/types/*`.
