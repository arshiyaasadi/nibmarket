# Deploy (دو زون پایدار)

هر دو زون **کار می‌کنند**. دیپلوی از لپ‌تاپ با WireGuard؛ بدون Azure/git push برای ریلیز روزمره.

| زون | برند | دستور | جزئیات |
|-----|------|--------|--------|
| **دو / dig** | nibdev | `yarn sync:dev` | [nibdev.md](./nibdev.md) — blue/green `:3000` / `127.0.0.1:2999` |
| **لایو** | nibmarket | `yarn sync:live` | [nibmarket.md](./nibmarket.md) — `:3000` + nginx origin `:80` پشت CDN |

Env و presetها: [env.md](./env.md) · لاگ لایو بدون ریموت برای ایجنت: [`scripts/live-logs-prompt.md`](../../scripts/live-logs-prompt.md)

## پیش‌نیاز مشترک

1. WireGuard روشن
2. SSH: alias `nibdev` / `nibmarket-live` (یا `DEV_SSH_HOST` / `LIVE_SSH_HOST`)
3. روی سرور مسیر پروژه: `/opt/MLM_Front`
4. Docker network خارجی به نام `nginx`

## دو (nibdev) — خلاصه

```bash
yarn sync:dev                 # rsync + blue/green (API واقعی)
yarn sync:dev --status
yarn sync:dev --follow
yarn sync:dev --rollback      # سوییچ فوری بدون rebuild
yarn sync:dev --force
```

| | |
|--|--|
| Host | `pod1.nibdev.com` |
| Public | https://club.nibdev.com |
| BE | `https://api-club.nibdev.com` |
| Panel SSO | https://panel.nibdev.com → callback `https://club.nibdev.com/login/sso/` |
| Compose | `docker-compose.dev.yml` + `.env` → `mlm_front_dev_blue` / `_green` |
| Worker | `scripts/remote-deploy-dev.sh` |

## لایو (nibmarket) — خلاصه

```bash
yarn sync:live
yarn sync:live --force
yarn sync:live:status
yarn sync:live:follow
# SKIP_NGINX=1 yarn sync:live   # فقط اگر نباید nginx دست بخورد
```

| | |
|--|--|
| Host | `club-docker.nibmarket.com` (`nibmarket-live`) |
| Public | https://club.nibmarket.com (Arvan CDN → origin `:80`) |
| App | `mlm_front_live` → `:3000` |
| Origin nginx | **فقط HTTP `:80`** → `127.0.0.1:3000` — **بدون certbot** |
| BE | `http://club-srv.nibmarket.com` (HTTP داخلی) |
| Panel SSO | https://panel.nibmarket.com → callback `https://club.nibmarket.com/login/sso/` |
| Compose | `docker-compose.live.yml` + `.env.live` |
| Worker | `scripts/remote-deploy.sh` |
| Nginx template | `deploy/nginx/club.nibmarket.com.conf` |

Smoke لایو بعد از nginx:  
`Host: club.nibmarket.com` → `http://127.0.0.1/build-info.json` باید **200** باشد (نه 301).

## SSO (هر دو زون)

فلو درست (مثل legacy `startAuthEntry`):

```
CTA / لندینگ
  → panel…/login/?callbackUrl=<club>/login/sso/?returnUrl=…
  → برگشت به club /login/sso/
  → BFF session
  → /dashboard
```

- لندینگ استاتیک لایو (`public/landing-v2`): لینک‌ها مستقیم به پنل + `callbackUrl` (نه `/login` خالی).
- لایو: `NEXT_PUBLIC_PUBLIC_ORIGIN=https://club.nibmarket.com` در بیلد بیک می‌شود.
- دو: origin از request (`club.nibdev.com`).
- هرگز callback را به `club-srv` / `api-club` نزن.

## مراحل remote (مرجع سریع)

| لایو | دو |
|------|-----|
| `docker` → `network` → `env` → `base_image` → `build_live` → `nginx` → `done` | build اسلات غیرفعال روی `2999` → health → swap به `:3000` → `done` |

وضعیت: `.cd-state/deploy-status` (+ دو: `.cd-state/slot-state`).

## چه چیزی عوض نشود

- لایو: certbot روی `club.nibmarket.com` → لوپ CDN
- لایو: `BACKEND_API_BASE_URL` باید `http://club-srv…` بماند (نه https)
- دو: mock UI به‌صورت پیش‌فرض خاموش است (`API_SERVICE_MODE=api`)
- پورت عمومی اپ در هر دو زون: **3000**
