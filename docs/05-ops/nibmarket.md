# nibmarket (production / live)

Live is stable. Two-zone overview: [deploy.md](./deploy.md).

Public HTTPS terminates at **ArvanCloud CDN**. This host is the **HTTP origin** only.

## Identity

| Key | Value |
|-----|--------|
| Zone | `nibmarket` (live) |
| `APP_ENV` | `production` |
| Docker / SSH | `club-docker.nibmarket.com` / alias `nibmarket-live` |
| Project dir | `/opt/MLM_Front` |
| App container | `mlm_front_live` → **`:3000`** |
| Origin nginx | **`:80` only** → `127.0.0.1:3000` (no certbot / no 301→HTTPS) |
| Public URL | https://club.nibmarket.com |
| Backend API | `http://club-srv.nibmarket.com` (`/api/v2`) |
| Panel / auth | `panel.nibmarket.com` / `auth.nibmarket.com` |
| SSO callback origin | always `https://club.nibmarket.com` (`NEXT_PUBLIC_PUBLIC_ORIGIN`) |

## Traffic

```
User → ArvanCloud (HTTPS)
     → club-docker :80  (nginx HTTP origin, no SSL redirect)
     → 127.0.0.1:3000   (Next.js)
     → BFF → http://club-srv.nibmarket.com
```

**Do not** run certbot for `club.nibmarket.com` on this host — it re-adds `return 301 https://…` and the CDN loops.

Competing nginx vhosts (e.g. `club.nibmarket.ir`) are disabled during deploy so only this origin remains.

## Deploy

**Target (auto CD):** merge `develop` → `main`, then **`git push novin main`** (Azure tip — GitHub alone is not enough). Host `mlm-cd.timer` polls Azure (~2 min). Enable once: [release-history.md](./release-history.md).

**2026-11-14:** push-only did not ship (Azure tip stale); live was updated with **`yarn sync:live`**. Next cut: `git ls-remote novin refs/heads/main` must match tip before waiting on the timer. Verify with `/api/ping` (`version` + `deploy` + `cd`) or `yarn logs:live`.

```bash
# After push to Azure main (when novin tip is current):
curl -sS https://club.nibmarket.com/api/ping
yarn logs:live                # confirm SHA / status → logs/live/
yarn sync:live:status
yarn sync:live:follow         # tails only

# Break-glass / when auto path fails (this cut):
yarn sync:live
yarn sync:live --force
# SKIP_NGINX=1 yarn sync:live   # only when host nginx must not change
# yarn sync:live:ui             # temporary UI-mock on live (not default)
```

Break-glass / bootstrap flow (`SKIP_NGINX=0`):

1. rsync → `/opt/MLM_Front`
2. Patch `.env.live` (real API, clear UI-mock, `BACKEND_API_BASE_URL=http://club-srv…`, bake origin)
3. Build/start `mlm_front_live` on `:3000`
4. Rewrite nginx as sole HTTP origin (wipe leftover certbot SSL blocks)
5. Smoke: `Host: club.nibmarket.com` → `http://127.0.0.1/build-info.json` → **200**

Stages: `docker` → `network` → `env` → `base_image` → `build_live` → `nginx` → `done`  
Worker: `scripts/remote-deploy.sh` · template: `deploy/nginx/club.nibmarket.com.conf`

## SSO / landing

Home entry (`landing-v2`) matches legacy:

`panel.nibmarket.com/login/?callbackUrl=https://club.nibmarket.com/login/sso/?returnUrl=/dashboard`

Not a bare link to `/login` or `/login/sso` without the panel hop.

Server log collection (paste for agent): [`scripts/live-logs-prompt.md`](../../scripts/live-logs-prompt.md)

## Related

- [deploy.md](./deploy.md) · [nibdev.md](./nibdev.md) · [env.md](./env.md)
