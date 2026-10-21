# nibdev (development / دو)

زون دو پایدار است. نمای کلی دو زون: [deploy.md](./deploy.md).

Staging با برند **nibdev**.

## Identity

| Key | Value |
|-----|--------|
| Zone | `nibdev` (dev / دو) |
| `APP_ENV` | `development` |
| Host / SSH | `pod1.nibdev.com` / alias `nibdev` |
| Project dir | `/opt/MLM_Front` |

## URLs

| Role | URL |
|------|-----|
| Club (public) | https://club.nibdev.com |
| Club API | https://api-club.nibdev.com (`/api/v2`) |
| Panel SSO | https://panel.nibdev.com |
| Account auth | https://auth.nibdev.com |
| SSO callback | `https://club.nibdev.com/login/sso/` (origin از request) |

## Blue / green

دقیقاً **دو** کانتینر اپ. پراکسی سوم نداریم.

| Role | Container | Host publish |
|------|-----------|--------------|
| **Active** (public) | `mlm_front_dev_blue` **یا** `_green` | `:3000` → container `3000` |
| **Standby** (قبلی) | اسلات دیگر | `127.0.0.1:2999` → container `3000` (فقط localhost) |

State: `/opt/MLM_Front/.cd-state/slot-state` (`ACTIVE=blue|green`).

### Deploy flow

1. Build در اسلات **غیرفعال** روی `127.0.0.1:2999`
2. Health-check
3. Swap: بیلد جدید → `:3000`، قبلی → `127.0.0.1:2999`
4. Prune dangling images

Cold start (بدون active): اسلات پیش‌فرض (`blue`) مستقیم روی `:3000`. Standby از دیپلوی بعدی.

### CLI

```bash
yarn sync:dev                 # rsync + blue/green (real API)
yarn sync:dev --status
yarn sync:dev --follow
yarn sync:dev --rollback      # سوییچ فوری بدون rebuild
yarn sync:dev --force
yarn sync:dev:rollback
```

روی سرور:

```bash
bash scripts/remote-deploy-dev.sh --status
bash scripts/remote-deploy-dev.sh --rollback
```

## Real API (پیش‌فرض)

همیشه `API_SERVICE_MODE=api` و UI-mock خاموش (`FORCE_UI_DEV_MODE=0`، …). BFF فقط روت‌های session-cookie (+ geo ادمین) را محلی نگه می‌دارد؛ بقیه `/api/v2` به `api-club.nibdev.com`.

### فلگ تست: نگه داشتن session روی 401

`NEXT_PUBLIC_KEEP_SESSION_ON_401=1` — 401 نشست را پاک / به session-expired نمی‌فرستد (`src/config/feature-flags.ts`).

## Stack

| Compose | Env | Project | Notes |
|---------|-----|---------|--------|
| `docker-compose.dev.yml` | `.env` | `mlm-dev` | `app_blue` / `app_green` |

نیاز به Docker network خارجی `nginx`.

## Env روی سرور

```bash
cp .env.example .env
# Ensure:
APP_ENV=development
NEXT_PUBLIC_APP_ENV=development
API_SERVICE_MODE=api
AUTH_SECRET=<long-random>
APP_PORT=3000
# اختیاری تست: NEXT_PUBLIC_KEEP_SESSION_ON_401=1
```

فلگ‌های `NEXT_PUBLIC_*` در **بیلد ایمیج** بیک می‌شوند؛ عوض کردن زون = rebuild.

`yarn sync:dev` این‌ها را روی `.env` سرور پچ می‌کند:

- `BACKEND_API_BASE_URL=https://api-club.nibdev.com`
- `NEXT_PUBLIC_AUTH_BASE_URL=https://auth.nibdev.com`
- `NEXT_PUBLIC_PANEL_BASE_URL=https://panel.nibdev.com`
- (origin فرانت از request؛ `NEXT_PUBLIC_PUBLIC_ORIGIN` عمداً ست نمی‌شود)

## Related

- [deploy.md](./deploy.md) · لایو: [nibmarket.md](./nibmarket.md) · [env.md](./env.md)
