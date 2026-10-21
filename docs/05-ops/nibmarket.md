# nibmarket (production / live)

لایو پایدار است. نمای کلی دو زون: [deploy.md](./deploy.md).

Public HTTPS روی **ArvanCloud CDN**. این هاست فقط **HTTP origin** است.

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
| SSO callback origin | همیشه `https://club.nibmarket.com` (`NEXT_PUBLIC_PUBLIC_ORIGIN`) |

## Traffic

```
User → ArvanCloud (HTTPS)
     → club-docker :80  (nginx HTTP origin, no SSL redirect)
     → 127.0.0.1:3000   (Next.js)
     → BFF → http://club-srv.nibmarket.com
```

**Do not** run certbot for `club.nibmarket.com` on this host — آن `return 301 https://…` را برمی‌گرداند و CDN لوپ می‌کند.

رقابت‌کنندهٔ nginx (مثلاً `club.nibmarket.ir`) در دیپلوی disable می‌شود تا فقط همین origin بماند.

## Deploy

```bash
yarn sync:live
yarn sync:live --force
yarn sync:live:status
yarn sync:live:follow
# SKIP_NGINX=1 yarn sync:live   # فقط وقتی نباید nginx عوض شود
# yarn sync:live:ui             # UI-mock موقت روی لایو (غیرپیش‌فرض)
```

جریان پیش‌فرض (`SKIP_NGINX=0`):

1. rsync → `/opt/MLM_Front`
2. Patch `.env.live` (real API، پاک کردن UI-mock، `BACKEND_API_BASE_URL=http://club-srv…`, bake origin)
3. Build/start `mlm_front_live` روی `:3000`
4. بازنویسی nginx به‌عنوان sole HTTP origin (پاک کردن بلوک‌های leftover certbot)
5. Smoke: `Host: club.nibmarket.com` → `http://127.0.0.1/build-info.json` → **200**

Stages: `docker` → `network` → `env` → `base_image` → `build_live` → `nginx` → `done`  
Worker: `scripts/remote-deploy.sh` · template: `deploy/nginx/club.nibmarket.com.conf`

## SSO / لندینگ

ورود از هوم (`landing-v2`) مثل legacy:

`panel.nibmarket.com/login/?callbackUrl=https://club.nibmarket.com/login/sso/?returnUrl=/dashboard`

نه لینک خالی به `/login` یا `/login/sso` بدون پنل.

لاگ‌گیری از سرور (بدون ریموت برای ایجنت): [`scripts/live-logs-prompt.md`](../../scripts/live-logs-prompt.md)

## Related

- [deploy.md](./deploy.md) · [nibdev.md](./nibdev.md) · [env.md](./env.md)
