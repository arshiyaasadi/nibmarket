# Backend Requirements

This document lists every API the frontend currently mocks or works around, and what the backend team needs to build or change. Each item includes the expected contract so the frontend can switch from mock to real data without UI changes.

Source of truth for frontend-side tracking: [`docs/todo-tracker.md`](./todo-tracker.md)

---

## 1. Admin Authentication (High Priority)

**Frontend TODO ID:** `backend-admin-auth`

### Current temporary state
The frontend ships a fake admin login: a hardcoded mobile number + OTP pair (`DEV_ADMIN` in `src/config/dev-admin-auth.ts`) that issues a locally signed token with `role: "admin"`. The BFF keeps `/admin/*` routes and token refresh local in development so this virtual session works. This entire bypass must be removed once the real API exists.

### Requirement
Admin users must be able to log in through the same mobile + OTP flow as regular users. The auth response must include the user's role.

- `POST /auth/otp/send` and `POST /auth/otp/verify` should work for admin accounts, **or** provide a dedicated endpoint such as `POST /auth/admin/otp-login`.
- The verify/login response must return `role` as `"admin"` or `"manager"` so the frontend can route to the admin panel:

```json
{
  "userId": "uuid",
  "fullName": "Admin Name",
  "mobile": "09xxxxxxxxx",
  "role": "admin",
  "token": "jwt",
  "refreshToken": "jwt"
}
```

- `POST /auth/refresh` must also work for admin sessions.

---

## 2. Admin Panel APIs (High Priority)

### Requirement
All admin panel endpoints must accept real admin tokens and enforce role-based access (`admin` / `manager`):

| Endpoint | Purpose |
|----------|---------|
| `GET /admin/stats` | Dashboard KPIs |
| `GET /admin/users` | User list with pagination, search, status filter |
| `PATCH /admin/users/:id/status` | Activate / suspend user |
| `PATCH /admin/users/:id/role` | Change user role |
| `GET /admin/network/closure` | Network closure table (pagination, userId, depth filters) |
| `GET /admin/missions/list` | Mission list |
| `POST /admin/missions/create` | Create mission |
| `PATCH /admin/missions/:id` | Update mission / status |
| `GET /admin/admins/list` | Admin assignments list |
| `POST /admin/admins/assign` | Assign admin role |
| `DELETE /admin/admins/revoke/:id` | Revoke admin role |

Request/response shapes are documented in [`docs/api-contract.md`](./api-contract.md) (section "Admin").

---

## 3. Referrer Status (Medium Priority)

**Frontend TODO ID:** `backend-referrer-status`

### Current temporary state
After a user successfully submits an upline referral code (`POST /network/submit-referrer`), the frontend stores a flag in `localStorage` so the "register referrer" button is hidden on subsequent visits. This breaks across devices and browsers.

### Requirement
`GET /network/referrer-status` — returns whether the current user has already registered an upline referrer:

```json
{
  "hasReferrer": true,
  "registeredAt": "2026-07-01T10:00:00Z"
}
```

Alternatively, include a `hasReferrer` boolean in the auth/profile payload.

---

## 4. Upline Referrer Info (Medium Priority)

**Frontend TODO ID:** `upline-referrer`

### Requirement
`GET /network/upline` — returns the current user's upline referrer for display in the network tree:

```json
{
  "fullName": "Ali Rezaei",
  "level": 1
}
```

Returns `404` or `null` body when the user has no upline.

---

## 5. VIP Invite Message Templates (Medium Priority)

**Frontend TODO ID:** `backend-invite-templates`

### Current temporary state
The VIP invite modal has a "choose message" step with 3 hardcoded formal templates rendered client-side. The send-invite request payload is unchanged (no message is sent yet).

### Requirement
`GET /network/invite-templates` — returns the curated list of invite message templates:

```json
[
  {
    "id": "formal",
    "title": "رسمی",
    "body": "سرکار خانم / جناب آقای {firstName} {lastName}، ...\n{inviterName}"
  }
]
```

Expected placeholders inside `body` (frontend substitutes them before preview):

| Placeholder | Meaning |
|-------------|---------|
| `{firstName}` | Invitee first name (from the invite form) |
| `{lastName}` | Invitee last name (from the invite form) |
| `{inviterName}` | Current user's full name |

### Optional follow-up (Low Priority)
`POST /network/send-invite` — accept the selected template so the SMS/notification uses it:

```json
{
  "firstName": "…",
  "lastName": "…",
  "mobile": "09xxxxxxxxx",
  "fundId": "uuid",
  "templateId": "formal"
}
```

Until then, the frontend keeps sending the current payload without any message field.

---

## 6. Pool Leaderboards (High Priority)

**Frontend TODO ID:** `backend-leaderboard-pool`

### Current temporary state
The leaderboard page shows two equal-height tables (current-month top participants and the user's direct subsets), both fed by mock data. The `LeaderboardEntry` type has an optional `subsetCount` field; the UI renders `—` when it is missing.

### Requirement

**`GET /leaderboard/current-month`** — top participants of the current month's pool (frontend displays 7 rows):

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

- Sorted by `tokens` descending, `rank` starting at 1.
- `subsetCount` = number of direct subsets of that user.
- `isSelf` = `true` for the authenticated user's own row.
- Only users participating in the current pool should be included.

**`GET /leaderboard/my-subsets`** — same shape, but restricted to the authenticated user's direct subsets, sorted by `tokens` descending.

---

## 7. Twin Token Price (Medium Priority)

### Current temporary state
`GET /wallet/token-price` is mocked with a deterministic 7-day series priced in Rial.

### Requirement
Return the Twin token price in **Rial (IRR)** for the last 7 days, one point per day:

```json
[
  { "date": "2026-07-11", "price": 24500 },
  { "date": "2026-07-12", "price": 24680 }
]
```

- `date`: ISO date (`YYYY-MM-DD`), oldest first, ending today.
- `price`: integer Rial amount.

---

## 8. Registration Delegated to Nib Market (Already Agreed — For Reference)

The frontend no longer registers users itself. `POST /auth/check-mobile` must return the following for mobiles not registered in Nib Market:

```json
{
  "error": "nib_market_required",
  "message": "ابتدا باید فرایند ثبت‌نام در نیب مارکت را کامل کنید."
}
```

(HTTP 403.) The frontend then shows the "register on Nib Market" screen and redirects to the panel login/registration URL.

---

## Priority Summary

| # | Requirement | Priority |
|---|-------------|----------|
| 1 | Admin OTP login (`role` in auth response) | High |
| 2 | Admin panel APIs with real admin tokens | High |
| 6 | Pool leaderboards with `subsetCount` | High |
| 3 | `GET /network/referrer-status` | Medium |
| 4 | `GET /network/upline` | Medium |
| 5 | `GET /network/invite-templates` | Medium |
| 7 | Token price in Rial, 7-day series | Medium |
| 5b | `templateId` in send-invite payload | Low |
