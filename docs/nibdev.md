# nibdev (development zone)

Old / staging server zone for the Novin club panel. DNS and APIs use the **nibdev** brand.

## Identity

| Key | Value |
|-----|--------|
| Zone name | `nibdev` |
| `APP_ENV` | `development` |
| Typical host | `pod1.nibdev.com` (see `deploy.sh` defaults) |
| Project dir on server | `/opt/MLM_Front` |

## URLs

| Role | URL |
|------|-----|
| Panel (legacy SSO) | https://panel.nibdev.com |
| Club panel (SSO callback) | https://club.nibdev.com |
| Club API | https://api-club.nibdev.com |
| Account auth | https://auth.nibdev.com |

Test deploy uses the **same** paths/names as `./deploy.sh`:

- dir: `/opt/MLM_Front`
- compose: `docker-compose.prod.yml`
- container: `mlm_front_prod`
- host port: `APP_PORT` (default **3000**)
- no host nginx install — only docker network name `nginx` (required by compose)

## Env on server

```bash
# Seed from repo example when missing
cp .env.example .env
# Ensure:
APP_ENV=development
NEXT_PUBLIC_APP_ENV=development
API_SERVICE_MODE=api
AUTH_SECRET=<long-random>
```

Client URLs are baked at **image build** from `NEXT_PUBLIC_APP_ENV`. Changing zone requires rebuild.

## Deploy (from laptop) — recommended

rsync + detached remote build (same pattern as live, but **nibdev** host):

```bash
yarn sync:dev              # rsync → pod1 + build (patches .env for auth.nibdev.com)
yarn sync:dev --status
yarn sync:dev --follow
yarn sync:dev --force
```

Patches server `.env` auth/SSO URLs:

- `NEXT_PUBLIC_APP_URL=https://club.nibdev.com` (SSO callback — never api-club)
- `NEXT_PUBLIC_AUTH_BASE_URL=https://auth.nibdev.com`
- `NEXT_PUBLIC_PANEL_BASE_URL=https://panel.nibdev.com`
- container: **`mlm_front_prod`** with host port exposed (same as `./deploy.sh`)

### Legacy git-pull deploy

```bash
./deploy.sh   # needs sudo_pass.txt + git_credentials.txt; requires push first
```

## Compose

Single stack (no UI/v2):

```bash
docker compose -p mlm-dev -f docker-compose.prod.yml --env-file .env up -d --build
```

Live zone (club.nibmarket.ir): [nibmarket.md](./nibmarket.md) → `yarn sync:live`.

## Related

- Live zone: [nibmarket.md](./nibmarket.md)
- Env reference: [env.md](./env.md)
- Abysso context: `docs/context/nibmarket.md` (monorepo)
