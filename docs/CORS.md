# CORS — درخواست مستقیم از مرورگر به API

با `NEXT_PUBLIC_API_USE_PROXY=false` (پیش‌فرض)، مرورگر مستقیم به `NEXT_PUBLIC_API_BASE_URL` درخواست می‌زند (مثلاً `https://api-club.nibdev.com`).

## چرا فرانت CORS را «ست» نمی‌کند؟

**CORS فقط روی سرور API** تنظیم می‌شود. اپ Next.js نمی‌تواند به مرورگر اجازه دهد پاسخ `api-club.nibdev.com` را بخواند؛ آن دامنه باید خودش هدرهای CORS را برگرداند.

هدرهای CORS روی routeهای داخلی Next (`/api/health/*`, `/api/version`) فقط همان origin را پوشش می‌دهند، نه بک‌اند خارجی.

## آنچه تیم بک‌اند باید روی `api-club.nibdev.com` بگذارد

برای originهای مجاز (مثال):

- `https://club.nibdev.com`
- `https://club.nibdev.com:3000`
- `http://localhost:3000` (توسعه)

```
Access-Control-Allow-Origin: <origin دقیق — نه * اگر Authorization + cookie دارید>
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, Accept
Access-Control-Allow-Credentials: true   # در صورت نیاز به cookie
```

برای `OPTIONS` (preflight) همان origin و هدرها را برگردانید؛ status `204` یا `200`.

## چک در مرورگر

1. DevTools → Network → یک GET مثل `dashboard/rewards`
2. **Request URL** باید `https://api-club.nibdev.com/api/v1/...` باشد (نه `club.../api/v1`)
3. اگر CORS باشد: خطای console با `blocked by CORS policy` و درخواست بدون پاسخ قابل خواندن

## پروکسی (اختیاری)

اگر تا CORS روی API باز نشده: `NEXT_PUBLIC_API_USE_PROXY=true` و rebuild — درخواست از همان origin با rewrite در `next.config.js` (بدون نیاز به CORS روی API برای مرورگر).
