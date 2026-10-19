# nibmarket (production / live zone)

Live production zone for the Novin club panel. **One** Docker stack + host nginx for **club.nibmarket.ir**.

## Identity

| Key | Value |
|-----|--------|
| Zone name | `nibmarket` (live) |
| `APP_ENV` | `production` |
| Live host (SSH) | `club-docker.nibmarket.com` / alias `nibmarket-live` |
| Project dir | `/opt/MLM_Front` |
| Public front | https://club.nibmarket.ir |
| Backend API | https://api-club.nibmarket.com (`/api/v2`) |
| Panel (legacy SSO) | https://panel.nibmarket.com |
| Account auth | https://auth.nibmarket.com |

## Stack on the live host

| Compose | Env file | Container | Host port | Purpose |
|---------|----------|-----------|-----------|---------|
| `docker-compose.live.yml` | `.env.live` | `mlm_front_live` | **3002** | Real API + auth |

nginx listens on **80/443** and reverse-proxies `club.nibmarket.ir` → `127.0.0.1:3002`.

## Deploy (live only)

WireGuard must be ON so the host resolves.

```bash
yarn sync:live
```

What happens:

1. **rsync** local tree → `/opt/MLM_Front`
2. Patches `.env.live` auth/SSO URLs (`club.nibmarket.ir` / `auth.nibmarket.com` / `panel.nibmarket.com`)
3. Builds **live only** (stops legacy containers if present)
4. Starts **`scripts/remote-deploy.sh` detached**

```bash
yarn sync:live:status
yarn sync:live:follow
yarn sync:live --force
```

### UI-mock demo on live

Same host/URL, but BFF uses in-memory mocks (`FORCE_UI_DEV_MODE` + `API_SERVICE_MODE=mock`):

```bash
yarn sync:live:ui
# or: yarn sync:live --ui-mock --force
yarn sync:live:follow
```

WireGuard must be ON. To return to real API later, deploy without `--ui-mock` and clear mock flags in `/opt/MLM_Front/.env.live` (or re-run a normal `yarn sync:live --force` after setting `FORCE_UI_DEV_MODE=0`).

Stages: `docker` → `network` → `env` → `base_image` → `build_live` → `nginx` → `ssl` → `done`

## Dev / nibdev deploy

Separate host + command — see [nibdev.md](./nibdev.md):

```bash
yarn sync:dev
```

## Related

- Development zone: [nibdev.md](./nibdev.md)
- Env reference: [env.md](./env.md)
