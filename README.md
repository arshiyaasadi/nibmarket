# Nibmarket (Next.js admin)

Company test deployment: Next.js app on **port 3000** (host and container).

## Quick start (local)

```bash
npm ci
cp .env.example .env
npm run dev
```

Open [http://localhost:3000/](http://localhost:3000/) (trailing slash enabled in Next config).

Build: `npm run build` · Run production build: `npm run start`

Docker/npm use `package-lock.json` (see `Dockerfile`).

## Docker

**Production** (standalone image, port **3000**):

```bash
./scripts/run-prod.sh
```

یا دستی:

```bash
docker compose up --build -d
```

بعد از بالا آمدن سرویس: [http://localhost:3000/version](http://localhost:3000/version) — زمان بیلد، commit، و محیط (پروداکشن/توسعه).

**Development** (hot reload, source mounted):

```bash
docker compose -f docker-compose.dev.yml up --build
```

The image is based on `node:22-bookworm-slim` from Docker Hub; the build host needs outbound access to pull base layers (or use a registry mirror on restricted networks).

### `auth.docker.io` / `DeadlineExceeded` during `docker compose up --build`

1. **Syntax image:** this repo’s `Dockerfile` does **not** use `# syntax=docker/dockerfile:1`, so BuildKit should not try to pull `docker/dockerfile` from Hub.
2. **Node base image:** if pulling `node:22-bookworm-slim` still times out, set a mirror in `.env` (Compose passes it as a build arg):

   ```bash
   NODE_BASE_IMAGE=public.ecr.aws/docker/library/node:22-bookworm-slim
   ```

   Then run `docker compose build` / `docker compose up --build` again (your machine must resolve `public.ecr.aws`).

3. Otherwise use VPN or your company’s Docker registry mirror.

## SSO token entry

External systems send users with a **foreign token** (not the app session token). The app exchanges it once, then uses the returned `accessToken` for all API calls.

| Step | What happens |
|------|----------------|
| 1 | Redirect to `https://{project-domain}/login/token/{ENTRY_TOKEN}/` (or `?token=` on any route) |
| 2 | `POST /api/v1/auth/check_token` with `Authorization: Bearer {ENTRY_TOKEN}` |
| 3 | On **200**: store `accessToken`, `userId`, `role` in `localStorage` → redirect `/dashboard` |
| 4 | On **401**: redirect to login (`/`) |

**Dev:** set `NEXT_PUBLIC_USER_TOKEN` in `.env` to the foreign token; on first load `AuthProvider` runs the same exchange (no manual login).

**Session token:** only `accessToken` from `check_token` is sent to dashboard/network/reports APIs. The entry token is never reused after exchange.

## Backend health check

UI page (calls the backend from the Next.js server):

- **[`/health/`](http://localhost:3000/health/)** — probes `GET https://api-club.nibdev.com/health` and shows whether the response is HTTP **200** with `{ "status": "healthy" }`.

API (same probe, JSON only):

- **GET** [`/api/health/backend/`](http://localhost:3000/api/health/backend/)  
  Override target with env: `BACKEND_HEALTH_URL` (see `.env.example`).

## Backend / Swagger reachability

Server-side check (from the machine or container running Node — must reach the internal network):

- **GET** [`/api/health/swagger-proxy/`](http://localhost:3000/api/health/swagger-proxy/)  
  Default target: `http://192.168.8.199:8070/swagger/index.html`  
  Override with env: `BACKEND_SWAGGER_TEST_URL` (see `.env.example`).

JSON response includes `ok`, `status`, and `url`. If the container cannot route to `192.168.8.199`, expect `502` and an error message.

## Environment

Copy and edit env files:

```bash
cp .env.example .env
# optional: .env.local for NEXT_PUBLIC_USER_TOKEN and overrides
```

| Topic | Doc |
|-------|-----|
| All env variables (JWT, mock/api, token) | [`.env.example`](./.env.example) |
| **Mock vs fake-db vs real API** | [`docs/DATA_SOURCE.md`](./docs/DATA_SOURCE.md) |
| Dashboard API contracts | [`docs/schema.md`](./docs/schema.md) |

Quick defaults: `NEXT_PUBLIC_DATA_SOURCE=mock` (dashboard uses local mocks; template auth still uses `@fake-db`). Set `NEXT_PUBLIC_DATA_SOURCE=api` and list slugs in `NEXT_PUBLIC_API_ENABLED` to call `https://api-club.nibdev.com` gradually.

Restart `npm run dev` after changing any `NEXT_PUBLIC_*` variable.

```bash
curl http://localhost:3000/api/health/backend/
```