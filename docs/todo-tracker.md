# TODO Tracker

مرکز پیگیری کارهایی که در فرانت به‌صورت موقت (mock / localStorage / bypass) جلو رفته‌اند و کارهایی که بک‌اند باید سرویس یا تغییر API برایشان بدهد.

---

## A) TODOهای Frontend (موجود در کد)

| ID | محل | توضیح |
|----|-----|--------|
| `backend-admin-auth` | `src/config/dev-admin-auth.ts`, `src/config/mock-hints.ts`, `src/lib/api/server/dev-admin-auth.ts` | حذف login فیک ادمین با موبایل/OTP وقتی بک‌اند login ادمین را پشتیبانی کند |
| `backend-referrer-status` | `src/lib/storage/referrer-registration.ts`, `src/components/organisms/network/NetworkTreeWidget.tsx` | جایگزینی localStorage با API وضعیت ثبت کد معرف |
| `upline-referrer` | `src/types/mlm.ts` | نمایش نام/سطح معرف بالاسری بعد از آماده شدن API |
| `backend-invite-templates` | `src/lib/network/invite-templates.ts`, `src/components/organisms/network/InviteModal.tsx` | جایگزینی ۳ تمپلیت mock با `GET /network/invite-templates` |
| `backend-leaderboard-pool` | `src/types/mlm.ts`, `src/app/(panel)/dashboard/leaderboard/LeaderboardClient.tsx` | اطمینان از دریافت `subsetCount` و top-7 شرکت‌کنندگان pool از API |
| `mobile-drawer` | `src/components/organisms/layout/PanelSidebar.tsx` | پیاده‌سازی drawer موبایل سایدبار |

### جزئیات کوتاه

#### `backend-admin-auth`
- ورود موقت: موبایل `09173648291` + OTP تعریف‌شده در `DEV_ADMIN`
- BFF در حالت non-production مسیرهای `/admin/*` و refresh محلی را برای توکن مجازی ادمین نگه می‌دارد
- بعد از آماده شدن بک‌اند: حذف bypass و مسیرهای local admin

#### `backend-referrer-status`
- فعلاً بعد از ثبت موفق کد معرف در `localStorage` ذخیره می‌شود تا دکمه «ثبت معرف» دوباره نشان داده نشود
- نیاز به endpoint رسمی برای وضعیت معرف

#### `backend-invite-templates`
- در InviteModal مرحله `message` با ۳ تمپلیت رسمی mock وجود دارد
- ارسال دعوت هنوز همان payload قبلی است (بدون `message`) تا API تمپلیت آماده شود

#### `backend-leaderboard-pool`
- UI دو جدول هم‌ارتفاع نشان می‌دهد: ماه جاری و زیرمجموعه‌های من
- فیلد اختیاری `subsetCount` در `LeaderboardEntry`؛ در نبود داده `—` نمایش داده می‌شود

---

## B) TODOهای Backend / تغییر یا توسعه API

| API / حوزه | نیاز | اولویت |
|------------|------|--------|
| `POST /auth/admin/otp-login` (یا معادل) | login واقعی ادمین با OTP؛ جایگزین `DEV_ADMIN` | بالا |
| `GET /admin/*` | سرویس‌های پنل ادمین (`stats`, `users`, `network`, `missions`, `admins`) باید توکن واقعی ادمین را بپذیرند | بالا |
| `GET /network/referrer-status` | وضعیت ثبت کد معرف بالاسری برای کاربر جاری | متوسط |
| `GET /network/upline` | نام و سطح معرف بالاسری | متوسط |
| `GET /network/invite-templates` | لیست تمپلیت‌های متن دعوت VIP (`id`, `title`, `body` با placeholder) | متوسط |
| `POST /network/send-invite` | در صورت نیاز، پذیرش `message` / `templateId` انتخاب‌شده توسط کاربر | پایین |
| `GET /leaderboard/current-month` | top ۷ (یا قابل تنظیم) شرکت‌کننده ماه جاری در pool با فیلدهای: `rank`, `fullName`, `subsetCount`, `tokens` | بالا |
| `GET /leaderboard/my-subsets` | همان shape برای زیرمجموعه‌های مستقیم کاربر، مرتب‌شده بر اساس Twin | بالا |
| `GET /wallet/token-price` | قیمت Twin بر حسب **ریال** برای ۷ روز اخیر با تاریخ ISO روزانه | متوسط |

### قرارداد پیشنهادی برای لیدربورد pool

```json
[
  {
    "rank": 1,
    "userId": "uuid",
    "fullName": "علی رضایی",
    "subsetCount": 42,
    "tokens": 9800,
    "period": "current",
    "isSelf": false
  }
]
```

### قرارداد پیشنهادی برای تمپلیت دعوت

```json
[
  {
    "id": "formal",
    "title": "رسمی",
    "body": "سرکار خانم / جناب آقای {firstName} {lastName}، ...\n{inviterName}"
  }
]
```

Placeholderهای مورد انتظار: `{firstName}`, `{lastName}`, `{inviterName}`

---

## C) وضعیت موقت فعلی (تا آماده شدن بک‌اند)

| قابلیت | وضعیت موقت |
|--------|-------------|
| Login ادمین از `/login` | موبایل/OTP فیک + توکن local |
| ثبت کد معرف | `localStorage` بعد از موفقیت API submit |
| تمپلیت متن دعوت VIP | mock در فرانت؛ send بدون message |
| لیدربورد ماه جاری / زیرمجموعه‌ها | mock handler در BFF (حالت mock) |
| قیمت Twin در کیف پول | mock ۷ روزه به ریال |

---

*آخرین به‌روزرسانی: هم‌زمان با بچ UI/admin (InviteModal message step، چارت ریال، رسوب، لیدربورد، fix logout ادمین).*
