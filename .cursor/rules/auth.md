# Auth & RBAC Rules

## جریان احراز هویت

```
Client  POST /api/v1/auth/check-mobile  {mobile}
Server  exists → password/OTP login | missing → register OTP-first flow
Client  POST /api/v1/auth/login  {mobile, password}
Server  loginHandler → Prisma users/user_roles → signed tokens → set httpOnly cookies
Client  setAuth(Zustand) + router.refresh()
proxy.ts  بررسی cookie در هر request → RBAC guard
```

## کوکی‌ها

- `nib_token`، `nib_refresh` و `nib_role` همگی **httpOnly** هستند
- client نمی‌تواند با JavaScript به آن‌ها دسترسی داشته باشد
- `proxy.ts` (route guard) آن‌ها را می‌خواند
- API handlers از `nib_token` برای resolve کردن current user استفاده می‌کنند
- اگر API با `401` جواب دهد، `apiClient` یک بار `/auth/refresh` را با `nib_refresh` صدا می‌زند و request را retry می‌کند

## Zustand Auth State

```ts
// فقط selector hook — نه کل slice
const isAuth = useIsAuthenticated();       // ← boolean
const role   = useUserRole();              // ← UserRole | null
const { setAuth, clearAuth } = useAuthActions();
const canView = useCanAccess("/admin");    // ← RBAC check
```

## نقش‌ها

```ts
type UserRole = "client" | "manager" | "admin"
```

| مسیر | دسترسی |
|------|---------|
| `/dashboard`، `/network/*`، `/reports/*`، `/capital`، ... | client + manager + admin |
| `/admin`، `/admin/users` | manager + admin |
| `/admin/reports` | admin only |

## DB Auth

- نقش از `roles` و `user_roles` خوانده می‌شود؛ client نقش را انتخاب نمی‌کند.
- پسورد seed توسعه `Test@1234` است و hash آن در SQL seed قرار دارد.
- auth همیشه از `users.password_hash` استفاده می‌کند؛ تغییر رمز باید همین ستون را با bcrypt hash جدید به‌روزرسانی کند.
- OTP فعلی توسعه با `MOCK_OTP` validate می‌شود، اما validation server-side است.
- ثبت‌نام کاربر جدید باید `users`، `user_profiles`، `user_roles`، `wallets`، `wallet_balances` و در صورت referral معتبر `referrals`/`network_closure` را در یک transaction بسازد.
- `userId` در تمام auth payloadها UUID string است.

## Logout

```ts
// client-side
clearAuth()          // پاک کردن Zustand
router.push("/login")

// server-side (POST /api/v1/auth/logout)
logoutHandler → cookies.delete("nib_token") + cookies.delete("nib_role")
```

## قوانین

- هرگز token را در localStorage ذخیره نکنید
- token access/refresh باید signed و claim-based باشد، نه base64 ساده
- inputهای mobile/OTP/search عددی باید قبل از validation با helper نرمال‌سازی digitها به انگلیسی تبدیل شوند
- هرگز role را از client بررسی نکنید برای دسترسی امنیتی — `proxy.ts` مرجع است
- `canAccess()` فقط برای **hide/show** UI elements استفاده شود، نه security
- Security boundary واقعی: `proxy.ts` + server-side guard
