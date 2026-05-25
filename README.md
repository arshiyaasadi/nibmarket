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
# روی سرور لایو (اولین بار):
cp .env.production .env   # همان مقادیر لوکال — API + SSO token
./scripts/run-prod.sh
```

یا دستی:

```bash
cp .env.production .env
docker compose up --build -d
```

**مهم:** فایل `.env` داخل image کپی نمی‌شود. مقادیر `NEXT_PUBLIC_*` (مثل `NEXT_PUBLIC_API_BASE_URL`) باید **موقع `docker compose build`** از `.env` به‌عنوان `build-arg` پاس داده شوند تا درخواست‌های کلاینت به بک‌اند درست ساخته شوند. بعد از هر تغییر در `NEXT_PUBLIC_*` حتماً `--build` بزنید.

بعد از بالا آمدن سرویس: [http://localhost:3000/version](http://localhost:3000/version) — زمان بیلد، commit، و محیط (پروداکشن/توسعه).

**عیب‌یابی SSO:** در DevTools باید درخواست مستقیم به `NEXT_PUBLIC_API_BASE_URL/api/v1/auth/check_token` با هدر `Authorization: Bearer TOKEN` دیده شود.

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
| 1 | Redirect to `https://{project-domain}/login/token/{ENTRY_TOKEN}/` یا ورود دستی در `/login` |
| 2 | `POST {NEXT_PUBLIC_API_BASE_URL}/api/v1/auth/check_token` with `Authorization: Bearer {ENTRY_TOKEN}` |
| 3 | `/login/token/{token}` calls `check_token`, waits for **200**, stores session → redirects to `/dashboard` |
| 4 | On **401**: error message on `/login/token/{token}` or `/login` |

**Dev:** open `/login` and paste the foreign token, or open `/login/token/{token}/`.

**Session token:** only `accessToken` from `check_token` is sent to dashboard/network/reports APIs. The entry token is never reused after exchange.

## Backend health check

UI page (calls the backend directly from the browser):

- **[`/health/`](http://localhost:3000/health/)** — probes `GET https://api-club.nibdev.com/health` and shows whether the response is HTTP **200** with `{ "status": "healthy" }`.

## Environment

Copy and edit env files:

```bash
cp .env.example .env
# optional: .env.local for local overrides
```

| Topic | Doc |
|-------|-----|
| All env variables (JWT, mock/api, token) | [`.env.example`](./.env.example) |
| **Mock vs fake-db vs real API** | [`docs/DATA_SOURCE.md`](./docs/DATA_SOURCE.md) |
| Dashboard API contracts | [`docs/schema.md`](./docs/schema.md) |

Quick defaults: `NEXT_PUBLIC_DATA_SOURCE=mock` (dashboard uses local mocks; template auth still uses `@fake-db`). Set `NEXT_PUBLIC_DATA_SOURCE=api` and list slugs in `NEXT_PUBLIC_API_ENABLED` to call `https://api-club.nibdev.com` gradually.

Restart `npm run dev` after changing any `NEXT_PUBLIC_*` variable.