# API Schema — Layout (هدر، پروفایل، اطلاعیه‌ها)

> **Base URL:** `NEXT_PUBLIC_API_BASE_URL`  
> **Registry:** [`schema.api-registry.md`](./schema.api-registry.md)  
> **Env slugs:** [`DATA_SOURCE.md`](./DATA_SOURCE.md)

---

## فهرست

| slug | Method | Endpoint | UI |
|------|--------|----------|-----|
| `layout-user` | GET | `/api/auth/getinfo` | `UserDropdown` — نام کاربر |
| `layout-announcements` | GET | `/api/User/Announcements` | `NotificationDropdown` |

---

## 1. layout-user — کاربر جاری

**Endpoint:** `GET /api/auth/getinfo` → `GET /api/v1/auth/getinfo`

### Schema (بک‌اند)

```ts
type AuthGetInfoResponse = {
  id: number
  lastLogin: string | null
  identifier: number
  email: string | null
  mobile: string | null
  creationDate: string   // ISO 8601
  isMobileConfirmed: boolean
  firstName: string | null
  lastName: string | null
  nationalCode: string | null
  birthDate: string | null
  gender: string | null
  legalType: number
  referrer: string | null
}
```

### نمونه پاسخ

```json
{
  "id": 123606,
  "lastLogin": null,
  "identifier": 13206556,
  "email": null,
  "mobile": "09358081232",
  "creationDate": "2026-05-24T08:41:07.588647",
  "isMobileConfirmed": true,
  "firstName": null,
  "lastName": null,
  "nationalCode": "4709859711",
  "birthDate": null,
  "gender": null,
  "legalType": 0,
  "referrer": null
}
```

### رفتار UI

- نمایش: `{firstName} {lastName}` — **بدون نقش**
- خطای API / mock: نام خالی (نه placeholder «کاربر»)
- کد: `src/hooks/layout/useCurrentUser.ts`, `src/@core/layouts/components/shared-components/UserDropdown.tsx`

### Mock

```json
{
  "id": 0,
  "lastLogin": null,
  "identifier": 0,
  "email": null,
  "mobile": null,
  "creationDate": "",
  "isMobileConfirmed": false,
  "firstName": null,
  "lastName": null,
  "nationalCode": null,
  "birthDate": null,
  "gender": null,
  "legalType": 0,
  "referrer": null
}
```

---

## 2. layout-announcements — اخبار و اطلاعیه‌ها

**Endpoint:** `GET /api/User/Announcements` → `GET /api/v1/User/Announcements`

### Schema

```ts
type LayoutAnnouncementItem = {
  id: string
  title: string
  subtitle: string
  meta: string          // برچسب زمان نمایشی
  publishedAt?: string
}

type LayoutAnnouncementsResponse = {
  items: LayoutAnnouncementItem[]
}
```

### پاسخ‌های پشتیبانی‌شده در mapper

- `{ items: [...] }`
- `{ announcements: [...] }`
- `{ messages: [...] }`
- آرایهٔ مستقیم `[...]`
- `{ data: ... }` (unwrap)

فیلدهای جایگزین هر آیتم: `title` | `subject` | `name`؛ `subtitle` | `body` | `description` | `message` | `content`

### رفتار ویژه

| وضعیت | نتیجه |
|--------|--------|
| HTTP **404** | `{ items: [] }` — بدون خطا در UI |
| mock (`DATA_SOURCE=mock`) | لیست خالی |
| لیست خالی | «اطلاعیه‌ای وجود ندارد» در dropdown |

### Mock

```json
{ "items": [] }
```

---

## پنل خارجی (نه API club)

| منو | Env | پیش‌فرض |
|-----|-----|---------|
| پروفایل | `NEXT_PUBLIC_PANEL_PROFILE_URL` | `https://panel.nibmarket.com/profile/` |
| تنظیمات | `NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL` | `https://panel.nibmarket.com/user-account/` |
| Base | `NEXT_PUBLIC_PANEL_BASE_URL` | `https://panel.nibmarket.com` |

کد: `src/configs/panel-urls.ts`

---

## فایل‌های پیاده‌سازی

| نقش | مسیر |
|-----|------|
| Types | `src/types/api/layout.ts` |
| Mock | `src/mocks/layout/index.ts` |
| API | `src/api/layout/user.ts`, `announcements.ts` |
| Mapper | `src/lib/layout/mappers.ts` |
| Hooks | `src/hooks/layout/useCurrentUser.ts`, `useLayoutAnnouncements.ts` |
