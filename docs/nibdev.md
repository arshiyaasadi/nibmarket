# nibdev (development zone)

Staging / test zone for the Novin club panel. DNS and APIs use the **nibdev** brand.

## Identity

| Key | Value |
|-----|--------|
| Zone name | `nibdev` (dev) |
| `APP_ENV` | `development` |
| Typical host | `pod1.nibdev.com` (alias `nibdev`) |
| Project dir on server | `/opt/MLM_Front` |

## URLs

| Role | URL |
|------|-----|
| Panel (legacy SSO) | https://panel.nibdev.com |
| Club panel (SSO callback) | https://club.nibdev.com |
| Club API | https://api-club.nibdev.com (`/api/v2`) |
| Account auth | https://auth.nibdev.com |

## Stack on the dev host

| Compose | Env file | Container | Host port |
|---------|----------|-----------|-----------|
| `docker-compose.dev.yml` | `.env` | `mlm_front_dev` | **3000** (default) |

No host nginx install — only the Docker network name `nginx` required by compose.

## Env on server

```bash
cp .env.example .env
# Ensure:
APP_ENV=development
NEXT_PUBLIC_APP_ENV=development
API_SERVICE_MODE=api
AUTH_SECRET=<long-random>
```

Client URLs are baked at **image build** from `NEXT_PUBLIC_APP_ENV`. Changing zone requires rebuild.

## Deploy (from laptop) — recommended

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
- container: **`mlm_front_dev`**

### Legacy git-pull deploy

```bash
./deploy.sh   # needs sudo_pass.txt + git_credentials.txt; uses docker-compose.dev.yml
```

## Compose

```bash
docker compose -p mlm-dev -f docker-compose.dev.yml --env-file .env up -d --build
```

Live zone (club.nibmarket.ir): [nibmarket.md](./nibmarket.md) → `yarn sync:live`.

## Related

- Live zone: [nibmarket.md](./nibmarket.md)
- Env reference: [env.md](./env.md)
- Abysso context: `docs/context/nibmarket.md` (monorepo)
