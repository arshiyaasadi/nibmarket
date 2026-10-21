# nibmarket (production / live zone)

Live production zone for the Novin club panel. App runs on the **docker host** at **`:3000`**. Public HTTPS is terminated on a **separate edge** host.

## Identity

| Key | Value |
|-----|--------|
| Zone name | `nibmarket` (live) |
| `APP_ENV` | `production` |
| Live host (SSH / Docker) | `club-docker.nibmarket.com` / alias `nibmarket-live` |
| Project dir | `/opt/MLM_Front` |
| App listen | **`:3000`** (`mlm_front_live`) |
| Public front (edge) | https://club.nibmarket.com → proxies to docker host `:3000` |
| Backend API | https://club-srv.nibmarket.com (`/api/v2`) |
| Panel (legacy SSO) | https://panel.nibmarket.com |
| Account auth | https://auth.nibmarket.com |
| SSO callback origin | always `https://club.nibmarket.com` (not `club-docker:3000`) |

## Traffic

```
User → club.nibmarket.com (edge :80/:443)
     → club-docker.nibmarket.com:3000  (this deploy)
     → BFF → club-srv.nibmarket.com
```

`yarn sync:live` **does not** configure nginx/certbot on the docker host (`SKIP_NGINX=1` by default). Optional: `SKIP_NGINX=0 yarn sync:live` if you intentionally want host nginx.

## Stack on the docker host

| Compose | Env file | Container | Host port | Purpose |
|---------|----------|-----------|-----------|---------|
| `docker-compose.live.yml` | `.env.live` | `mlm_front_live` | **3000** | Real API + auth |

## Deploy (live only)

WireGuard must be ON so the host resolves.

```bash
yarn sync:live
yarn sync:live:status
yarn sync:live:follow
yarn sync:live --force
```

What happens:

1. **rsync** local tree → `/opt/MLM_Front`
2. Patches `.env.live` (auth / panel / `club-srv`, clears UI-mock)
3. Builds and starts **`mlm_front_live` on :3000**
4. Skips nginx/ssl on this host

Stages (default): `docker` → `network` → `env` → `base_image` → `build_live` → `done`

### UI-mock demo on live

```bash
yarn sync:live:ui
yarn sync:live:follow
```

## Dev / nibdev deploy

Separate host + command — see [nibdev.md](./nibdev.md):

```bash
yarn sync:dev
```

## Related

- Development zone: [nibdev.md](./nibdev.md)
- Env reference: [env.md](./env.md)
