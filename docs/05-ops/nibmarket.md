# nibmarket (production / live zone)

Live production for the Novin club panel on **`club-docker`**.

Public HTTPS is terminated by **ArvanCloud CDN**. This host is the **HTTP origin** only.

## Identity

| Key | Value |
|-----|--------|
| Zone name | `nibmarket` (live) |
| `APP_ENV` | `production` |
| Docker / SSH host | `club-docker.nibmarket.com` / alias `nibmarket-live` |
| Project dir | `/opt/MLM_Front` |
| App | `mlm_front_live` → **`:3000`** |
| Origin nginx | **`:80` only** → `127.0.0.1:3000` (no certbot / no 301→HTTPS) |
| Public URL | https://club.nibmarket.com (CDN → this origin `:80`) |
| Backend API | `http://club-srv.nibmarket.com` (`/api/v2`) |
| SSO callback origin | always `https://club.nibmarket.com` |

## Traffic

```
User → ArvanCloud (HTTPS)
     → club-docker :80  (nginx HTTP origin, no SSL redirect)
     → 127.0.0.1:3000   (Next.js)
     → BFF → http://club-srv.nibmarket.com
```

**Do not** run certbot on this host for `club.nibmarket.com` — that re-adds `return 301 https://…` and the CDN loops (301 to the same HTTPS URL).

## Deploy

```bash
yarn sync:live
yarn sync:live --force
yarn sync:live:follow
```

Default (`SKIP_NGINX=0`):

1. rsync → `/opt/MLM_Front`
2. Patch `.env.live` (real API, clear UI-mock)
3. Build/start container on `:3000`
4. Rewrite nginx as sole HTTP origin (wipe leftover certbot SSL blocks)
5. Smoke: `Host: club.nibmarket.com` → `http://127.0.0.1/build-info.json` must be **200**

Stages: `docker` → `network` → `env` → `base_image` → `build_live` → `nginx` → `done`

## Related

- [nibdev.md](./nibdev.md) · [env.md](./env.md)
