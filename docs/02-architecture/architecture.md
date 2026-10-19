# Architecture

## Stack

| Tool | Role |
|------|------|
| Next.js (App Router) | Pages + BFF route handlers under `/api/v2` |
| React 19 | UI |
| TypeScript (strict) | Types / DTOs |
| TanStack Query | Server state |
| Zustand | Client auth/UI slices |
| next-intl | Persian UI strings (`localePrefix: "never"`) |
| Tailwind CSS v4 | `@theme` tokens in `src/styles/globals.css` |
| Zod | Env validation |

## Request path

```
Browser
  → apiClient (src/lib/api/client.ts)
  → Next BFF  /api/v2/*
  → either LOCAL_ONLY handler  (missions sections, leads, geo, session cookies, …)
  → or mock handler registry   (API_SERVICE_MODE=mock / UI_DEV_MODE)
  → or proxyRequestToBackend   (API_SERVICE_MODE=api → club BE /api/v2)
```

**Rule:** the browser never calls club BE directly.

Mode switch: `src/config/api-service.ts` (`API_SERVICE_MODE`, `UI_DEV_MODE` / force flags).

## Layers

```
app/(panel|admin|auth|…)     pages / layouts
components/{atoms|molecules|organisms}
features/*/queries.ts        React Query hooks
features/*/service.ts        apiClient + ENDPOINTS
types/mlm.ts | admin.ts      DTO SSOT (JSDoc)
lib/api/endpoints.ts         path SSOT
lib/api/server/
  bff-route-handler.ts       mode + LOCAL_ONLY
  route-registry.ts          mock/custom handlers
  handlers/*                 request handlers
lib/mock/repositories/*      in-memory fixtures (UI-dev)
```

## Auth session

BFF owns httpOnly cookies / signed access for panel sessions (`lib/api/server/session.ts`). Refresh and logout stay local-only so API mode does not break cookie sessions.

## Where to look

| Need | File |
|------|------|
| Paths | `src/lib/api/endpoints.ts` |
| DTOs | `src/types/mlm.ts`, `src/types/admin.ts` |
| Proxy detail | [`proxy-pattern.md`](./proxy-pattern.md) |
| Feature checklist | [`features.md`](./features.md) |
| Open BE work | `novin-club-work/backend-inbox.md` |
