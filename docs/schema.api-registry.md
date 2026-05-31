# API Schema Registry — فهرست و لاگ تغییرات

> **هدف:** یک نقطهٔ مرجع برای **همه** قراردادهای API پروژه و **ثبت تغییرات** endpointها، slugها و mapperها.  
> جزئیات هر بخش در فایل schema اختصاصی همان بخش است؛ این فایل **جنرال** است.

| Env | مقدار |
|-----|--------|
| Base URL | `NEXT_PUBLIC_API_BASE_URL` → `https://api-club.nibdev.com` |
| نسخه | `/api/...` → `/api/v1/...` (در `api-client`) |
| Mock / API | [`docs/DATA_SOURCE.md`](./DATA_SOURCE.md) |

---

## فهرست schemaها

| فایل | محدوده UI | وضعیت |
|------|-----------|--------|
| [`schema.dashboard.md`](./schema.dashboard.md) | `/dashboard` | ✅ متصل |
| [`schema.network.md`](./schema.network.md) | `/network/*` | ✅ متصل |
| [`schema.reports.md`](./schema.reports.md) | `/reports/*`, `/capital-deposit` | ✅ متصل |
| [`schema.leaderboard.md`](./schema.leaderboard.md) | `/leaderboard/*` | ✅ متصل |
| [`schema.twin-token.md`](./schema.twin-token.md) | `/manager/twin-token` | ✅ متصل |
| [`schema.layout.md`](./schema.layout.md) | هدر، منوی کاربر، اطلاعیه‌ها | ✅ متصل (جدید) |

---

## slugهای layout (جدید)

| slug | Method | Endpoint | UI |
|------|--------|----------|-----|
| `layout-user` | GET | `/api/auth/getinfo` | منوی پروفایل — نام و نام‌خانوادگی |
| `layout-announcements` | GET | `/api/User/Announcements` | dropdown «اخبار و اطلاعیه‌ها» |

---

## لاگ تغییرات API

> هر بار endpoint، فیلد، mapper یا slug عوض شد، یک ردیف **جدید بالای جدول** اضافه کنید.

| تاریخ | بخش | تغییر | فایل‌های مرتبط |
|-------|-----|--------|----------------|
| 2026-05-31 | layout | `layout-user`: endpoint از `/api/User` به **`GET /api/auth/getinfo`**؛ DTO جدید `AuthGetInfoResponse` | `schema.layout.md`, `src/api/layout/user.ts`, `src/types/api/layout.ts` |
| 2026-05-31 | layout | اضافه شد: `GET /api/User/Announcements`؛ slugهای `layout-user`، `layout-announcements`؛ 404 اطلاعیه → لیست خالی | `schema.layout.md`, `src/api/layout/*`, `src/hooks/layout/*` |
| 2026-05-31 | layout | لینک پروفایل/تنظیمات به پنل خارجی `panel.nibmarket.com` via env | `src/configs/panel-urls.ts`, `.env.example` |
| — | dashboard | (نمونه) تغییر مسیر wallet | `schema.dashboard.md`, `src/api/dashboard/wallet.ts` |

---

## APIهای باقی‌مانده / پیشنهادی

| بخش | Endpoint پیشنهادی | UI | یادداشت |
|-----|-------------------|-----|---------|
| اعلان‌ها (صفحه کامل) | همان `layout-announcements` | `/notifications` | هنوز mock صفحه؛ dropdown از API |
| قوانین / پشتیبانی | TBD | سایدبار پایین | «به زودی» — بدون route |
| مسابقه | TBD | `/competition/*` | خارج از فاز فعلی |

---

## الگوی افزودن API جدید

1. ردیف در **لاگ تغییرات** (همین فایل)
2. بخش در `schema.<domain>.md` یا فایل schema جدید
3. slug در `src/configs/data-source.ts`
4. `src/types/api/` + `src/mocks/` + `src/api/` + `src/lib/*/mappers.ts` + `src/hooks/`
5. به‌روز [`DATA_SOURCE.md`](./DATA_SOURCE.md) و [`.env.example`](../.env.example)

---

## لینک‌های خارج از API club

برای URLهای اینترنتی (تایل مپ، CDN، پنل قدیمی) → [`external-urls.md`](./external-urls.md)
