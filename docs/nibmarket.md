# nibmarket (production zone)

Live production zone for the Novin club panel. **Single** Docker prod stack + host nginx for **club.nibmarket.ir** (UI/v2 stack is no longer built).

## Identity

| Key | Value |
|-----|--------|
| Zone name | `nibmarket` |
| `APP_ENV` (prod stack) | `production` |
| Live host (SSH) | `club-docker.nibmarket.com` / alias `nibmarket-live` |
| Project dir | `/opt/MLM_Front` |
| Public front | https://club.nibmarket.ir |
| Backend API | https://api-club.nibmarket.com |
| Panel (legacy SSO) | https://panel.nibmarket.com |
| Account auth | https://auth.nibmarket.com |

## Ports on the live host

| Stack | Compose | Container | Host port | Purpose |
|-------|---------|-----------|-----------|---------|
| Production | `docker-compose.prod.yml` + `.env.production` | `mlm_front_prod` | **3002** | Real API + auth (`APP_ENV=production`) |

nginx listens on **80/443** and reverse-proxies `club.nibmarket.ir` → `127.0.0.1:3002`.

## Deploy (live only)

WireGuard must be ON so the host resolves.

```bash
yarn sync:live
```

What happens:

1. **rsync** local tree → `/opt/MLM_Front`
2. Patches `.env.production` auth/SSO URLs (`club.nibmarket.ir` / `auth.nibmarket.com` / `panel.nibmarket.com`)
3. Builds **prod only** (stops legacy `mlm-v2` if present)
4. Starts **`scripts/remote-deploy.sh` detached**

```bash
yarn sync:live:status
yarn sync:live:follow
yarn sync:live --force
```

Stages: `docker` → `network` → `env` → `base_image` → `build_prod` → `nginx` → `ssl` → `done`

## Test / nibdev deploy

Separate host + command — see [nibdev.md](./nibdev.md):

```bash
yarn sync:dev
```

## Related

- Development zone: [nibdev.md](./nibdev.md)
- Env reference: [env.md](./env.md)
