# Resources Rules

## i18n — رشته‌های UI

- هیچ رشته فارسی یا UI string مستقیم در `.tsx` — فقط `t("key")`
- رشته‌ها فقط در `src/resources/messages/fa/*.json`
- در Server Components: `const t = await getTranslations("namespace")`
- در Client Components: `const t = useTranslations("namespace")`

```ts
// ✅ درست
const t = useTranslations("dashboard");
<h1>{t("title")}</h1>

// ❌ اشتباه
<h1>داشبورد</h1>
```

## ساختار فایل‌های messages

```
resources/messages/fa/
├── index.ts         ← merge تمام JSON ها — export default
├── common.json      ← متون مشترک (confirm، cancel، loading، ...)
├── nav.json         ← عناوین منوی ناوبری
├── auth.json        ← فرم لاگین، خطاهای auth
├── dashboard.json   ← داشبورد
├── wallet.json      ← کیف پول و تراکنش‌ها
├── missions.json    ← ماموریت‌ها
├── network.json     ← شبکه معرفی
├── errors.json      ← پیام‌های خطا
└── pages.json       ← عناوین 16 صفحه پنل
```

## اضافه کردن رشته جدید

1. رشته را در فایل مناسب در `fa/` اضافه کنید
2. اگر فایل جدید بود، در `fa/index.ts` import و export کنید
3. در component با `t("namespace.key")` استفاده کنید

## داده ثابت UI

```
resources/data/
├── fund-labels.json      ← برچسب انواع صندوق سرمایه‌گذاری
└── mission-codes.json    ← برچسب کدهای ماموریت
```

برای enum‌ها و label‌های ثابت که از API نمی‌آیند — نه برای mock response.

## API Response Data

API responseها از Prisma handlers می‌آیند. داده ثابت UI فقط برای label و copy استفاده شود، نه برای ساخت response جعلی.

## ESLint Enforcement

کد ESLint در `eslint.config.mjs` رشته‌های فارسی مستقیم در `.tsx` را با warning بلاک می‌کند:

```
JSXText[value=/[؀-ۿ]/]  →  warning: از t() استفاده کنید
```

استثنا: فایل‌های `src/resources/**/*` از این قانون معاف‌اند.
