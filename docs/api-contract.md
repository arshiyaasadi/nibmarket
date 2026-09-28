# NIB Club — API Contract

**Purpose:** This document is the single source of truth for the API contract between the NIB Club frontend (Next.js BFF) and the backend service. A .NET backend implementation must satisfy every endpoint, field, type, validation rule, and error code listed here exactly. The frontend services will break silently if field names, types, or enum values differ.

**Base URL:** `POST /api/v2/{path}` — all endpoints are prefixed with `/api/v2`

**Source files this document was derived from:**
- `src/lib/api/server/handlers/*.handler.ts` — endpoint implementations
- `src/lib/api/server/route-registry.ts` — route registration table
- `src/lib/api/server/session.ts` — JWT / cookie handling
- `src/types/mlm.ts` — all TypeScript interfaces (the frontend's canonical types)
- `src/types/mappers.ts` — DB→API field mapping logic
- `src/lib/db/repositories/*.repository.ts` — business logic and DB queries
- `src/features/*/service.ts` + `queries.ts` — frontend data access layer
- `src/config/roles.ts`, `env.server.ts`, `sso.ts` — configuration

---

## Table of Contents

1. [Global Conventions](#1-global-conventions)
2. [Authentication & Session](#2-authentication--session)
3. [Dashboard](#3-dashboard)
4. [Wallet](#4-wallet)
5. [Network / Referral](#5-network--referral)
6. [Missions](#6-missions)
7. [Leaderboard & Competition](#7-leaderboard--competition)
8. [Subset Deposits (Commission)](#8-subset-deposits-commission)
9. [Reports](#9-reports)
10. [Capital](#10-capital)
11. [Admin](#11-admin)
12. [Shared Enums & Types](#12-shared-enums--types)
13. [Model Mapping Checklist](#13-model-mapping-checklist)

---

## 1. Global Conventions

### 1.1 Authentication

The API uses two tokens delivered as **httpOnly cookies** plus a `Authorization` header fallback.

| Token | Cookie Name | Header | TTL |
|---|---|---|---|
| Access Token | `nib_access` | `Authorization: Bearer <token>` | 900 seconds (15 min) |
| Refresh Token | `nib_refresh` | — | 2,592,000 seconds (30 days) |

**JWT Structure:**
```json
{
  "header": { "alg": "HS256", "typ": "JWT" },
  "payload": {
    "sub": "<userId (UUID)>",
    "type": "access | refresh | registration",
    "role": "client | manager | admin",
    "mobile": "<string>",
    "referralCode": "<string>",
    "tokenVersion": "<string>",
    "iat": 1234567890,
    "exp": 1234567890
  }
}
```

**Protected endpoints** require a valid access token. The backend must:
1. Read `Authorization: Bearer <token>` header first
2. Fall back to the `nib_access` httpOnly cookie
3. Return `401 unauthorized` if neither is present or token is invalid/expired

### 1.2 Error Envelope

All errors must return this exact JSON shape:

```json
{
  "error": "snake_case_error_code",
  "message": "Human readable description"
}
```

**Common error codes:**

| HTTP Status | `error` field | When |
|---|---|---|
| 400 | `bad_request` | Missing or invalid required fields |
| 401 | `unauthorized` | No token, expired token, wrong credentials |
| 403 | `forbidden` | Token valid but insufficient role |
| 404 | `not_found` | Resource not found |
| 409 | `conflict` | Resource already exists (e.g. mobile already registered) |
| 429 | `too_many_requests` | Rate limit exceeded |
| 500 | `internal_server_error` | Unexpected server error |

### 1.3 Pagination

Endpoints that return lists support two pagination patterns:

**Pattern A — Page/Size (admin endpoints):**
```
Query: ?page=0&pageSize=20   (0-based)
Response:
{
  "data": [...],
  "total": 100,
  "page": 0,
  "pageSize": 20,
  "pageCount": 5
}
```

**Pattern B — Page/HasMore (user-facing endpoints):**
```
Query: ?page=1   (1-based)
Response:
{
  "items": [...],
  "hasMore": true,
  "total": 100
}
```
Default page size is **10** unless otherwise specified. `hasMore = (page * pageSize) < total`.

### 1.4 Date & Time

- All date/time values in API requests and responses must be **ISO 8601 strings** (e.g. `"2025-06-29T14:30:00.000Z"`)
- `null` is acceptable for optional date fields
- The frontend displays dates in the **Persian (Jalali) calendar** but stores/transmits them as Gregorian ISO strings

### 1.5 Number Types

- Token/balance amounts are **plain JavaScript numbers** (float64), not strings
- Percentages are **decimal numbers** (e.g. `2.5` means 2.5%)
- Negative amounts represent debit/outflow; positive amounts represent credit/inflow

---

## 2. Authentication & Session

> Handles user identity: registration, login, OTP, password reset, token refresh, profile, and SSO.

### `POST /api/v2/auth/check-mobile`

> Check if a mobile number is already registered before showing the login/register split screen.

**Auth:** None

**Request Body:**
```json
{ "mobile": "09123456789" }
```

| Field | Type | Required | Validation |
|---|---|---|---|
| `mobile` | string | ✅ | Non-empty |

**Response `200`:**
```json
{
  "exists": true,
  "status": "active"
}
```

| Field | Type | Notes |
|---|---|---|
| `exists` | boolean | Whether a user with this mobile exists |
| `status` | `UserStatus \| null` | null if user doesn't exist |

**Errors:**

| Status | `error` | Condition |
|---|---|---|
| 400 | `bad_request` | `mobile` missing |

---

### `POST /api/v2/auth/login`

> Authenticate an existing user with mobile/email + password.

**Auth:** None

**Request Body:**
```json
{ "mobile": "09123456789", "password": "secret" }
```
or
```json
{ "email": "user@example.com", "password": "secret" }
```

| Field | Type | Required | Validation |
|---|---|---|---|
| `mobile` | string | one of mobile/email | — |
| `email` | string | one of mobile/email | — |
| `password` | string | ✅ | Non-empty |

**Response `200` — `AuthResponse`:**
```json
{
  "id": "uuid",
  "fullName": "Ali Rezaei",
  "role": "client",
  "mobile": "09123456789",
  "email": "user@example.com",
  "referralCode": "NIB123456",
  "inviteCode": "NIB123456",
  "balance": 150.5,
  "token": "<access_jwt>",
  "refreshToken": "<refresh_jwt>",
  "recentSessions": [
    {
      "ip": "1.2.3.4",
      "userAgent": "Mozilla/5.0...",
      "status": "success",
      "createdAt": "2025-06-29T10:00:00.000Z"
    }
  ]
}
```

**Errors:**

| Status | `error` | Condition |
|---|---|---|
| 400 | `bad_request` | Neither mobile/email or password provided |
| 401 | `unauthorized` | User not found or password mismatch |

**Notes:**
- `inviteCode` is always the same value as `referralCode` (the frontend uses both names)
- Passwords in the DB may use bcrypt `$2y$` prefix — normalize to `$2b$` before comparison
- Sets `nib_access` and `nib_refresh` httpOnly cookies on success

---

### `POST /api/v2/auth/logout`

> Invalidate the current session.

**Auth:** None (cookies are cleared regardless)

**Request Body:** None

**Response `200`:**
```json
{ "ok": true }
```

**Notes:** Clears `nib_access` and `nib_refresh` cookies.

---

### `POST /api/v2/auth/otp/send`

> Send OTP to a mobile number for login (mobile must already exist).

**Auth:** None

**Request Body:**
```json
{ "mobile": "09123456789" }
```

**Response `200`:**
```json
{ "success": true, "expiresIn": 120 }
```

**Errors:**

| Status | `error` | Condition |
|---|---|---|
| 400 | `bad_request` | `mobile` missing |
| 401 | `unauthorized` | Mobile not registered |

---

### `POST /api/v2/auth/otp/verify`

> Verify OTP code and log in.

**Auth:** None

**Request Body:**
```json
{ "mobile": "09123456789", "code": "1234" }
```
or
```json
{ "email": "user@example.com", "code": "1234" }
```

**Response `200`:** Same as `AuthResponse` (see login)

**Errors:**

| Status | `error` | Condition |
|---|---|---|
| 401 | `unauthorized` | Invalid OTP code |

---

### `POST /api/v2/auth/register/otp/send`

> Send OTP to a mobile number for registration (mobile must NOT exist yet).

**Auth:** None

**Request Body:**
```json
{ "mobile": "09123456789" }
```

**Response `200`:**
```json
{ "success": true, "expiresIn": 120 }
```

**Errors:**

| Status | `error` | Condition |
|---|---|---|
| 400 | `bad_request` | `mobile` missing |
| 409 | `conflict` | Mobile already registered — `{ "error": "already_registered" }` |

---

### `POST /api/v2/auth/register/otp/verify`

> Verify OTP during registration flow; returns a short-lived registration token.

**Auth:** None

**Request Body:**
```json
{ "mobile": "09123456789", "code": "1234" }
```

**Response `200`:**
```json
{ "success": true, "registrationToken": "<jwt_10min>" }
```

**Errors:**

| Status | `error` | Condition |
|---|---|---|
| 400 | `bad_request` | `mobile` or `code` missing |
| 401 | `unauthorized` | Invalid OTP code |

**Notes:** `registrationToken` is a JWT with `type: "registration"`, valid for 10 minutes. Must be passed in the subsequent `/auth/register` call.

---

### `POST /api/v2/auth/register`

> Create a new user account.

**Auth:** None

**Request Body:**
```json
{
  "mobile": "09123456789",
  "password": "secret123",
  "registrationToken": "<jwt>",
  "referralCode": "NIB123456",
  "code": "1234"
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| `mobile` | string | ✅ | Non-empty |
| `password` | string | ✅ | Non-empty |
| `registrationToken` | string | ✅ | Valid 10-min registration JWT |
| `referralCode` | string | ❌ | Referral or VIP invite code |
| `code` | string | ❌ | OTP code alternative |

**Response `200`:** Same as `AuthResponse` (see login)

**Errors:**

| Status | `error` | Condition |
|---|---|---|
| 400 | `bad_request` | `mobile` or `password` missing |
| 401 | `unauthorized` | Invalid registration token |
| 409 | `conflict` | Mobile already registered |

**Notes:**
- Creates user, wallet (TWIN currency, zero balance), network closure (self at depth 0), and 5 VIP invite codes
- Auto-assigns `client` role
- Generates referral code in format `NIB{6 digits}` (e.g. `NIB123456`)
- If `referralCode` is provided, links the referrer and builds network ancestry
- Automatically completes the "registration" mission and credits reward tokens

---

### `POST /api/v2/auth/forgot/send`

> Send OTP to a mobile number to initiate password reset.

**Auth:** None

**Request Body:**
```json
{ "mobile": "09123456789" }
```

**Response `200`:**
```json
{ "success": true, "expiresIn": 120 }
```

**Errors:**

| Status | `error` | Condition |
|---|---|---|
| 400 | `bad_request` | `mobile` missing |
| 401 | `unauthorized` | Mobile not registered |

---

### `POST /api/v2/auth/forgot/verify`

> Verify OTP for password reset; returns a reset token.

**Auth:** None

**Request Body:**
```json
{ "mobile": "09123456789", "code": "1234" }
```

**Response `200`:**
```json
{ "success": true, "resetToken": "<jwt>" }
```

**Errors:**

| Status | `error` | Condition |
|---|---|---|
| 400 | `bad_request` | `mobile` or `code` missing |
| 401 | `unauthorized` | Invalid OTP |

---

### `POST /api/v2/auth/forgot/reset`

> Set a new password using the reset token.

**Auth:** None

**Request Body:**
```json
{ "mobile": "09123456789", "newPassword": "newSecret123" }
```
or `"password"` field instead of `"newPassword"` (both accepted).

**Response `200`:**
```json
{ "success": true }
```

**Errors:**

| Status | `error` | Condition |
|---|---|---|
| 400 | `bad_request` | `mobile` or `newPassword`/`password` missing |
| 401 | `unauthorized` | Invalid or missing reset token |

---

### `POST /api/v2/auth/refresh`

> Exchange a valid refresh token for new access + refresh tokens.

**Auth:** Refresh token via `nib_refresh` httpOnly cookie

**Request Body:** None

**Response `200`:** Same as `AuthResponse` (see login)

**Errors:**

| Status | `error` | Condition |
|---|---|---|
| 401 | `unauthorized` | Refresh token missing, expired, or invalid |

**Notes:** Sets new `nib_access` and `nib_refresh` cookies. Old refresh token is invalidated.

---

### `GET /api/v2/auth/profile`

> Get the current user's profile details.

**Auth:** Bearer / cookie (access token)

**Response `200`:**
```json
{
  "fullName": "Ali Rezaei",
  "mobile": "09123456789",
  "email": "user@example.com",
  "birthDate": "1990-01-15T00:00:00.000Z",
  "nationalId": "1234567890",
  "nibMarketLinked": false,
  "recentSessions": [
    {
      "ip": "1.2.3.4",
      "userAgent": "Mozilla/5.0...",
      "status": "success",
      "createdAt": "2025-06-29T10:00:00.000Z"
    }
  ]
}
```

| Field | Type | Notes |
|---|---|---|
| `fullName` | string | First + last name |
| `mobile` | string | — |
| `email` | string | — |
| `birthDate` | string \| null | ISO date or null |
| `nationalId` | string \| null | Iranian national ID or null |
| `nibMarketLinked` | boolean | Whether user has linked external NibMarket account |
| `recentSessions` | `LoginActivity[]` | Last 10 sessions |

**`LoginActivity` shape:**
```json
{
  "ip": "1.2.3.4",
  "userAgent": "Mozilla/5.0...",
  "status": "success",
  "createdAt": "2025-06-29T10:00:00.000Z"
}
```

**Errors:**

| Status | `error` | Condition |
|---|---|---|
| 401 | `unauthorized` | No valid token |

---

### `POST /api/v2/auth/sso/exchange`

> Exchange an SSO token (from external NibMarket platform) for a NIB Club session.

**Auth:** SSO token via one of:
1. `Authorization: Bearer <sso_token>` header
2. `nib_auth` cookie (configurable via `SSO_ENTRY_COOKIE` env)
3. Request body `{ "token": "<sso_token>" }`

**Request Body (optional):**
```json
{ "token": "<sso_token>" }
```

**Response `200`:** Same as `AuthResponse` (see login)

**Errors:**

| Status | `error` | Condition |
|---|---|---|
| 401 | `unauthorized` | Invalid SSO token |
| 500 | `internal_server_error` | `SSO_CHECK_TOKEN_URL` not configured |

**Notes:**
- Backend must call `SSO_CHECK_TOKEN_URL` with the token to validate it
- If user doesn't exist, creates a new account via `findOrCreateNibMarketUser`
- SSO response must include `externalUserId`, optionally `role`, `mobile`, `email`, `fullName`

---

## 3. Dashboard

> Aggregated data for the user's main dashboard page.

### `GET /api/v2/dashboard/rewards`

> Returns reward summary cards (token breakdown).

**Auth:** Required

**Response `200`:**
```json
[
  {
    "label": "موجودی کل",
    "value": 1500.0,
    "type": "total"
  },
  {
    "label": "پاداش ماموریت",
    "value": 300.0,
    "type": "mission"
  },
  {
    "label": "کمیسیون",
    "value": 1200.0,
    "type": "commission"
  },
  {
    "label": "قفل شده",
    "value": 50.0,
    "type": "frozen"
  }
]
```

Returns exactly **4 items** in order: total, mission, commission, frozen.

| Field | Type |
|---|---|
| `label` | string (Persian label) |
| `value` | number |
| `type` | `"total" \| "mission" \| "commission" \| "frozen"` |

---

### `GET /api/v2/dashboard/wallet`

> Returns the user's wallet summary.

**Auth:** Required

**Response `200`:**
```json
{
  "totalTokens": 1500.0,
  "frozenTokens": 50.0,
  "availableTokens": 1450.0,
  "pendingTokens": 0.0
}
```

---

### `GET /api/v2/dashboard/leaderboard`

> Returns the top 10 leaderboard entries.

**Auth:** Required

**Response `200`:**
```json
[
  {
    "rank": 1,
    "userId": "uuid",
    "fullName": "Ali Rezaei",
    "tokens": 5000.0,
    "period": "current",
    "isSelf": false
  }
]
```

Returns up to **10** entries. `isSelf: true` for the current user's entry.

---

### `GET /api/v2/dashboard/missions`

> Returns the first 5 active missions for the dashboard widget.

**Auth:** Required

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "code": "REGISTRATION",
    "title": "ثبت‌نام",
    "completed": true,
    "reward": "10 توکن"
  }
]
```

| Field | Type | Notes |
|---|---|---|
| `id` | string (UUID) | — |
| `code` | string | Mission code identifier |
| `title` | string | Persian title |
| `completed` | boolean | Whether user completed this mission |
| `reward` | string | Formatted Persian string, e.g. `"10 توکن"` |

Returns **at most 5** missions.

---

### `GET /api/v2/dashboard/subset-deposits`

> Returns the user's subset deposit (commission) summary.

**Auth:** Required

**Response `200`:**
```json
{
  "today": 12.5,
  "thisMonth": 150.0,
  "total": 1200.0,
  "activeSubsets": 8,
  "pendingAmount": 25.0
}
```

---

### `GET /api/v2/dashboard/referral`

> Returns the current user's referral / invite code.

**Auth:** Required

**Response `200`:**
```json
{
  "inviteCode": "NIB123456",
  "referralCode": "NIB123456"
}
```

Both fields always contain the same value.

---

### `GET /api/v2/dashboard/charts`

> Reserved endpoint for chart data (currently returns empty object).

**Auth:** None currently enforced

**Response `200`:**
```json
{}
```

---

## 4. Wallet

> TWIN token wallet: balance, transaction history, token price chart.

### `GET /api/v2/wallet/summary`

> Returns the user's wallet balance breakdown.

**Auth:** Required

**Response `200`:**
```json
{
  "totalTokens": 1500.0,
  "frozenTokens": 50.0,
  "availableTokens": 1450.0,
  "pendingTokens": 0.0
}
```

---

### `GET /api/v2/wallet/transactions`

> Returns a paginated list of wallet transactions.

**Auth:** Required

**Query Parameters:**

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | number | 1 | 1-based |
| `type` | `WalletTxType \| "all"` | `"all"` | Filter by transaction type |
| `rrn` | string | — | Filter by reference number (optional) |

**Response `200`:**
```json
{
  "items": [
    {
      "id": "uuid",
      "rrn": "MSN12345678",
      "date": "2025-06-29T10:00:00.000Z",
      "type": "mission_reward",
      "description": "پاداش ماموریت ثبت‌نام",
      "amount": 10.0,
      "status": "settled"
    }
  ],
  "hasMore": false,
  "total": 1
}
```

| Field | Type | Notes |
|---|---|---|
| `id` | string | — |
| `rrn` | string \| null | Reference/receipt number, optional |
| `date` | string | ISO datetime |
| `type` | `WalletTxType` | See enums |
| `description` | string | Persian description |
| `amount` | number | Positive = credit, Negative = debit |
| `status` | `"pending" \| "settled" \| "failed" \| "reversed"` | — |

Page size: **10** items.

---

### `GET /api/v2/wallet/token-price`

> Returns the TWIN token price history for the last 30 days (public endpoint).

**Auth:** None

**Response `200`:**
```json
[
  { "date": "2025-06-01T00:00:00.000Z", "price": 1.05 },
  { "date": "2025-06-02T00:00:00.000Z", "price": 1.07 }
]
```

Returns up to **30** data points, one per day.

---

## 5. Network / Referral

> Multi-level network management: subsets, tree, invite letters, referrer.

### `GET /api/v2/network/subsets`

> Returns all users in the current user's downline network.

**Auth:** Required

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "firstName": "Ali",
    "lastName": "Rezaei",
    "fullName": "Ali Rezaei",
    "level": 1,
    "joinDate": "2025-06-01T00:00:00.000Z",
    "subMembersCount": 3,
    "leaderboardRank": 5,
    "directParentUserId": "uuid"
  }
]
```

| Field | Type | Notes |
|---|---|---|
| `id` | string | — |
| `firstName` | string | — |
| `lastName` | string | — |
| `fullName` | string | — |
| `level` | number | Depth in network (1 = direct referral) |
| `joinDate` | string | ISO datetime |
| `subMembersCount` | number | How many referrals this person has |
| `leaderboardRank` | number \| null | Optional |
| `directParentUserId` | string \| null | UUID of their direct upline |

Sorted by `level ASC`, then `joinDate ASC`.

---

### `GET /api/v2/network/tree`

> Returns the current user's network as a recursive tree.

**Auth:** Required

**Response `200`:**
```json
{
  "id": "uuid",
  "fullName": "Ali Rezaei",
  "level": 0,
  "isSelf": true,
  "children": [
    {
      "id": "uuid",
      "fullName": "Reza Ahmadi",
      "level": 1,
      "isSelf": false,
      "children": []
    }
  ]
}
```

---

### `GET /api/v2/network/referrer`

> Returns information about the current user's upline referrer.

**Auth:** Required

**Response `200`:**
```json
{
  "id": "uuid",
  "fullName": "Reza Ahmadi",
  "level": 1,
  "inviteCode": "NIB654321",
  "inviteType": "regular"
}
```
or `null` if the user has no referrer.

| Field | Type | Notes |
|---|---|---|
| `id` | string | — |
| `fullName` | string | — |
| `level` | number | Depth of the referrer relative to the user |
| `inviteCode` | string | Referrer's referral code |
| `inviteType` | `"regular" \| "vip" \| undefined` | How the user was invited |

---

### `GET /api/v2/network/invited`

> Returns people invited by the current user (both pending letters and registered users).

**Auth:** Required

**Query Parameters:**

| Param | Type | Default | Notes |
|---|---|---|---|
| `status` | `InviteStatus \| "all" \| "pending" \| "registered"` | `"all"` | Filter |
| `q` | string | — | Text search on fullName or mobile |

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "firstName": "Sara",
    "lastName": "Karimi",
    "fullName": "Sara Karimi",
    "mobile": "09111111111",
    "status": "active",
    "joinDate": "2025-06-15T00:00:00.000Z",
    "level": 1,
    "subMembersCount": 0,
    "inviteType": "regular"
  }
]
```

A person with `status: "pending_invite"` has been sent an invite letter but has not registered yet.

---

### `GET /api/v2/network/funds`

> Returns available funds/investment products for invite context.

**Auth:** None currently enforced

**Response `200`:** `[]` (currently empty — reserved for future use)

---

### `GET /api/v2/network/invite-quota`

> Returns how many invite letters the user can still send this week.

**Auth:** Required

**Response `200`:**
```json
{
  "remaining": 3,
  "limit": 5,
  "used": 2
}
```

Weekly limit is **5** invite letters per 7-day rolling window.

---

### `POST /api/v2/network/send-invite`

> Send an invite letter to a new person.

**Auth:** Required

**Request Body:**
```json
{
  "firstName": "Sara",
  "lastName": "Karimi",
  "mobile": "09111111111",
  "fundId": "uuid",
  "message": "Optional personal message"
}
```

| Field | Type | Required | Validation |
|---|---|---|---|
| `firstName` | string | ✅ | — |
| `lastName` | string | ✅ | — |
| `mobile` | string | ✅ | — |
| `fundId` | string | ✅ | UUID of selected fund |
| `message` | string | ❌ | Optional |

**Response `200`:**
```json
{ "success": true, "remaining": 2 }
```

**Errors:**

| Status | `error` | Condition |
|---|---|---|
| 429 | `too_many_requests` | Weekly quota exceeded — also returns `{ "message": "LIMIT", "remaining": 0 }` |

**Notes:** Prevents duplicate invites (same mobile with status `"pending"`).

---

### `POST /api/v2/network/submit-referrer`

> Set the referrer for the current user (can only be done once, and only if user has no downline yet).

**Auth:** Required

**Request Body:**
```json
{ "referralCode": "NIB123456" }
```
or
```json
{ "inviteCode": "NIB123456" }
```

**Response `200`:**
```json
{ "success": true }
```

**Errors:**

| Status | `error` | Condition |
|---|---|---|
| 400 | `bad_request` | `{ "message": "INVALID_REFERRAL_CODE" }` — code not found or already used |

**Validation rules:**
- User must not already have a `referrer_id`
- User must have no direct children (descendants) in their network
- Referral code must belong to an active user

---

## 6. Missions

> Mission (task) system — users complete missions to earn TWIN token rewards.

### `GET /api/v2/missions/list`

> Returns all available mission definitions.

**Auth:** Required

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "code": "REGISTRATION",
    "title": "ثبت‌نام",
    "reward": 10.0,
    "description": "با ثبت‌نام در سیستم پاداش دریافت کنید",
    "missionType": "registration",
    "status": "active",
    "completed": true,
    "completedAt": "2025-06-01T10:00:00.000Z",
    "doubleBonus": false
  }
]
```

| Field | Type | Notes |
|---|---|---|
| `id` | string | — |
| `code` | string | Unique mission identifier |
| `title` | string | Persian title |
| `reward` | number | TWIN tokens rewarded |
| `description` | string \| undefined | — |
| `missionType` | `MissionType` | See enums |
| `status` | `MissionStatus` | Only `"active"` missions shown to users |
| `completed` | boolean \| undefined | Whether this user completed it |
| `completedAt` | string \| undefined | ISO datetime |
| `doubleBonus` | boolean \| undefined | Whether double reward is active |

Ordered by `priority DESC`, then `createdAt ASC`.

---

### `GET /api/v2/missions/activity`

> Returns a paginated history of mission attempts/completions for the current user.

**Auth:** Required

**Query Parameters:**

| Param | Type | Default |
|---|---|---|
| `page` | number | 1 |
| `status` | `MissionActivityStatus \| "all"` | `"all"` |

**Response `200`:**
```json
{
  "items": [
    {
      "id": "uuid",
      "missionId": "uuid",
      "title": "ثبت‌نام",
      "date": "2025-06-01T10:00:00.000Z",
      "status": "completed",
      "reward": 10.0,
      "rrn": "MSN12345678"
    }
  ],
  "hasMore": false,
  "total": 1
}
```

| Field | Type | Notes |
|---|---|---|
| `id` | string | user_missions record ID |
| `missionId` | string | Mission definition ID |
| `title` | string | Persian mission title |
| `date` | string | ISO datetime |
| `status` | `MissionActivityStatus` | — |
| `reward` | number | TWIN tokens |
| `rrn` | string \| undefined | Payment reference number (format: `MSN{8 digits}`) |

Page size: **10** items.

---

## 7. Leaderboard & Competition

> Token-based ranking system with monthly competition pools.

### `GET /api/v2/leaderboard/pool-balance`

> Returns the current user's share in the reward pool.

**Auth:** Required

**Response `200`:**
```json
{
  "totalPool": 10000.0,
  "userShare": 250.0,
  "sharePercent": 2.5
}
```

`sharePercent` is capped to 2 decimal places.

---

### `GET /api/v2/leaderboard/current-month`

> Returns the current month's leaderboard (top 20 users by token balance).

**Auth:** Required

**Response `200`:**
```json
[
  {
    "rank": 1,
    "userId": "uuid",
    "fullName": "Ali Rezaei",
    "tokens": 5000.0,
    "period": "current",
    "isSelf": false
  }
]
```

Returns up to **20** entries. `rank` starts at 1. `isSelf` is `true` for the authenticated user.

---

### `GET /api/v2/leaderboard/last-month`

> Returns last month's leaderboard (same shape as current-month).

**Auth:** Required

**Response `200`:** Same as `current-month`

---

### `GET /api/v2/leaderboard/my-subsets`

> Returns leaderboard entries for the current user's direct network members.

**Auth:** Required

**Response `200`:** Same shape as `current-month`

---

### `GET /api/v2/leaderboard/missions`

> Returns missions relevant to the leaderboard/competition context.

**Auth:** Required

**Response `200`:** Same as `/missions/list`

---

### `GET /api/v2/leaderboard/competition-pool`

> Returns the current month's competition pool details.

**Auth:** Required

**Response `200`:**
```json
{
  "totalPool": 10000.0,
  "dailyChange": 150.0,
  "participantCount": 45,
  "startDate": "2025-06-01T00:00:00.000Z",
  "endDate": "2025-06-30T23:59:59.999Z",
  "contextTitle": "رقابت جاری",
  "topWinners": 20,
  "myRank": 7
}
```

| Field | Type | Notes |
|---|---|---|
| `totalPool` | number | — |
| `dailyChange` | number | Today's pool increase |
| `participantCount` | number | — |
| `startDate` | string | First day of current month |
| `endDate` | string | Last moment of current month |
| `contextTitle` | string | Always `"رقابت جاری"` |
| `topWinners` | number | Always `20` |
| `myRank` | number \| null | Current user's rank (null if not ranked) |

---

### `GET /api/v2/leaderboard/honors`

> Returns the current user's honor/achievement badges.

**Auth:** Required (not enforced currently)

**Response `200`:** `[]` (currently empty — reserved)

---

### `GET /api/v2/leaderboard/history`

> Returns past competition periods.

**Auth:** Required (not enforced currently)

**Response `200`:** `[]` (currently empty — reserved)

---

## 8. Subset Deposits (Commission)

> Commission earned from the deposits/activity of a user's downline network.

### `GET /api/v2/subset-deposits/transactions`

> Returns a paginated list of commission transactions earned from subset (downline) activity.

**Auth:** Required

**Query Parameters:**

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | number | 1 | 1-based |
| `status` | `"all" \| "calculated" \| "credited"` | `"all"` | — |

**Response `200`:**
```json
{
  "items": [
    {
      "id": "uuid",
      "date": "2025-06-29T10:00:00.000Z",
      "level": 1,
      "sourceUserName": "Ali Rezaei",
      "description": "رسوب سطح 1 — Ali Rezaei",
      "baseAmount": 100.0,
      "ratePercent": 5.0,
      "amount": 5.0,
      "status": "credited",
      "externalTxId": null,
      "fundId": null
    }
  ],
  "hasMore": false,
  "total": 1
}
```

| Field | Type | Notes |
|---|---|---|
| `id` | string | — |
| `date` | string | ISO datetime |
| `level` | number | Network depth of the source user (1 = direct referral) |
| `sourceUserName` | string | Full name of the person whose deposit generated this commission |
| `description` | string | Format: `"رسوب سطح {level} — {sourceUserName}"` |
| `baseAmount` | number | Original deposit amount that generated this commission |
| `ratePercent` | number | Commission rate applied (e.g. `5.0` = 5%) |
| `amount` | number | Final TWIN commission amount |
| `status` | `SubsetDepositStatus` | — |
| `externalTxId` | string \| null | External transaction reference |
| `fundId` | string \| null | Fund reference if applicable |

Page size: **10** items.

---

### `GET /api/v2/subset-deposits/rules`

> Returns the commission rate rules per network level.

**Auth:** Required

**Response `200`:**
```json
[
  { "level": 1, "ratePercent": 5.0, "name": "سطح اول" },
  { "level": 2, "ratePercent": 3.0, "name": "سطح دوم" }
]
```

Ordered by `level ASC`. Only active rules are returned.

---

## 9. Reports

> Historical transaction and income reports.

### `GET /api/v2/reports/subsets`

> Returns subset (network) activity report for the current user.

**Auth:** Required

**Response `200`:** Same shape as `/network/subsets` (`NetworkSubset[]`)

---

### `GET /api/v2/reports/income`

> Returns income (commission) transaction report.

**Auth:** Required

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "year": 2025,
    "month": 6,
    "type": "commission_reward",
    "amount": 5.0,
    "description": "کمیسیون سطح 1"
  }
]
```

| Field | Type | Notes |
|---|---|---|
| `id` | string | — |
| `year` | number | Gregorian year (e.g. 2025) |
| `month` | number | 1–12 (1-indexed) |
| `type` | `"commission_reward"` | Always this value currently |
| `amount` | number | TWIN tokens earned |
| `description` | string | Format: `"کمیسیون سطح {level}"` |

Returns last **50** commission entries.

---

### `GET /api/v2/reports/capital-deposit`

> Returns capital deposit statistics for the current user.

**Auth:** Required

**Response `200`:**
```json
{
  "totalDeposited": 500000.0,
  "activeDeposits": 2,
  "totalReturn": 0.0,
  "pendingReturn": 50000.0
}
```

---

## 10. Capital

> Investment fund management (reserved for future use).

### `GET /api/v2/capital/funds`

> Returns available investment funds.

**Auth:** None currently enforced

**Response `200`:** `[]` (currently empty — reserved)

---

## 11. Admin

> Administrative management panel. All endpoints require `admin` or `manager` role unless specified.

### `GET /api/v2/admin/stats`

> Returns platform-wide statistics for admin dashboard.

**Auth:** Required — role: `admin` or `manager`

**Response `200`:**
```json
{
  "totalUsers": 1500,
  "activeUsers": 1200,
  "activeMissions": 5
}
```

---

### `GET /api/v2/admin/users`

> Returns a paginated list of all users.

**Auth:** Required — role: `admin` or `manager`

**Query Parameters:**

| Param | Type | Default | Notes |
|---|---|---|---|
| `page` | number | 0 | 0-based |
| `pageSize` | number | 20 | — |
| `search` | string | `""` | Search on mobile, email, name |
| `status` | `UserStatus \| ""` | `""` | Filter by status |

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "mobile": "09123456789",
      "email": "user@example.com",
      "firstName": "Ali",
      "lastName": "Rezaei",
      "role": "client",
      "status": "active",
      "kycStatus": "none",
      "referralCode": "NIB123456",
      "createdAt": "2025-06-01T00:00:00.000Z"
    }
  ],
  "total": 1500,
  "page": 0,
  "pageSize": 20,
  "pageCount": 75
}
```

---

### `PATCH /api/v2/admin/users/:id/status`

> Update a user's account status.

**Auth:** Required — role: `admin` or `manager`

**Path Parameter:** `id` — user UUID

**Request Body:**
```json
{ "status": "suspended" }
```

| Field | Type | Required | Values |
|---|---|---|---|
| `status` | `UserStatus` | ✅ | `"active" \| "suspended" \| "pending_verification" \| "closed"` |

**Response `200`:**
```json
{ "ok": true }
```

---

### `PATCH /api/v2/admin/users/:id/role`

> Change a user's role.

**Auth:** Required — role: **super admin only**

**Path Parameter:** `id` — user UUID

**Request Body:**
```json
{ "roleCode": "manager" }
```

**Response `200`:**
```json
{ "ok": true }
```

---

### `GET /api/v2/admin/network/closure`

> Returns the network closure (ancestry relationships) for admin inspection.

**Auth:** Required — role: `admin` or `manager`

**Query Parameters:**

| Param | Type | Default |
|---|---|---|
| `userId` | string | — |
| `depth` | number | — |
| `page` | number | 0 |
| `pageSize` | number | 50 |

**Response `200`:**
```json
{
  "data": [
    {
      "ancestorId": "uuid",
      "ancestorName": "Ali Rezaei",
      "ancestorCode": "NIB123456",
      "descendantId": "uuid",
      "descendantName": "Sara Karimi",
      "descendantCode": "NIB654321",
      "depth": 1
    }
  ],
  "total": 100,
  "page": 0,
  "pageSize": 50,
  "pageCount": 2
}
```

---

### `GET /api/v2/admin/missions/list`

> Returns all mission definitions (admin view, including non-active).

**Auth:** Required — role: `admin` or `manager`

**Response `200`:**
```json
[
  {
    "id": "uuid",
    "code": "REGISTRATION",
    "title": "ثبت‌نام",
    "description": "...",
    "missionType": "registration",
    "rewardAmount": 10.0,
    "criteria": {},
    "verificationMode": "auto",
    "status": "active",
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": null,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

| Field | Type | Notes |
|---|---|---|
| `id` | string | — |
| `code` | string | — |
| `title` | string | — |
| `description` | string \| null | — |
| `missionType` | `MissionType` | — |
| `rewardAmount` | number | — |
| `criteria` | object \| null | JSON criteria config |
| `verificationMode` | `"auto" \| "manual"` | — |
| `status` | `MissionStatus` | All statuses included |
| `startDate` | string \| null | ISO datetime |
| `endDate` | string \| null | ISO datetime |
| `createdAt` | string | ISO datetime |

---

### `POST /api/v2/admin/missions/create`

> Create a new mission.

**Auth:** Required — role: `admin` or `manager`

**Request Body:**
```json
{
  "code": "REFERRAL_5",
  "title": "دعوت ۵ نفر",
  "description": "5 نفر را دعوت کنید",
  "missionType": "referral_count",
  "rewardAmount": 50.0,
  "criteria": { "count": 5 },
  "verificationMode": "auto",
  "startDate": "2025-07-01T00:00:00.000Z",
  "endDate": "2025-12-31T23:59:59.999Z",
  "status": "active"
}
```

| Field | Required | Notes |
|---|---|---|
| `code` | ✅ | — |
| `title` | ✅ | — |
| `description` | ❌ | — |
| `missionType` | ✅ | — |
| `rewardAmount` | ❌ | — |
| `criteria` | ❌ | JSON object |
| `verificationMode` | ❌ | Default `"auto"` |
| `startDate` | ❌ | ISO datetime |
| `endDate` | ❌ | ISO datetime |
| `status` | ❌ | Default `"draft"` |

**Response `200`:**
```json
{ "id": "uuid" }
```

---

### `PATCH /api/v2/admin/missions/:id`

> Update an existing mission.

**Auth:** Required — role: `admin` or `manager`

**Path Parameter:** `id` — mission UUID

**Request Body (all optional):**
```json
{
  "status": "paused",
  "title": "Updated Title",
  "description": "...",
  "rewardAmount": 25.0,
  "criteria": {},
  "startDate": "...",
  "endDate": "...",
  "verificationMode": "manual"
}
```

**Response `200`:**
```json
{ "ok": true }
```

---

### `GET /api/v2/admin/admins/list`

> Returns all admin and manager accounts.

**Auth:** Required — **super admin only**

**Response `200`:**
```json
[
  {
    "userId": "uuid",
    "mobile": "09123456789",
    "email": "admin@example.com",
    "fullName": "Admin User",
    "role": "admin",
    "roleName": "مدیر سیستم",
    "permissions": null,
    "grantedAt": "2025-01-01T00:00:00.000Z"
  }
]
```

---

### `POST /api/v2/admin/admins/assign`

> Assign admin or manager role to a user.

**Auth:** Required — **super admin only**

**Request Body:**
```json
{ "userId": "uuid", "roleCode": "manager" }
```

**Response `200`:**
```json
{ "ok": true }
```

---

### `DELETE /api/v2/admin/admins/revoke/:id`

> Remove admin/manager role from a user.

**Auth:** Required — **super admin only**

**Path Parameter:** `id` — user UUID

**Response `200`:**
```json
{ "ok": true }
```

---

## 12. Shared Enums & Types

### `UserRole`
```
"client" | "manager" | "admin"
```

### `UserStatus`
```
"pending_verification" | "active" | "suspended" | "closed"
```

### `KycStatus`
```
"none" | "pending" | "verified" | "rejected"
```

### `WalletTxType`
```
"mint" | "commission_reward" | "mission_reward" | "transfer_in" | "transfer_out"
| "lock" | "unlock" | "pool_deposit" | "pool_withdrawal" | "adjustment"
```

### `WalletTxStatus`
```
"pending" | "settled" | "failed" | "reversed"
```

### `MissionType`
```
"referral_count" | "purchase" | "registration" | "fund_issue" | "custom"
```

### `MissionStatus`
```
"draft" | "active" | "paused" | "archived"
```

### `MissionActivityStatus`
```
"in_progress" | "pending_verification" | "completed" | "rejected" | "expired"
```

### `InviteStatus`
```
"pending_verification" | "active" | "suspended" | "closed" | "pending_invite"
```

### `SubsetDepositStatus`
```
"calculated" | "credited" | "reversed" | "failed"
```

### `NotificationType`
```
"system" | "network" | "promotion"
```

### `InviteType`
```
"regular" | "vip"
```

### `AuthResponse` (reused across auth endpoints)
```typescript
{
  id: string           // UUID
  fullName: string
  role: UserRole
  mobile: string
  email: string
  referralCode: string // e.g. "NIB123456"
  inviteCode: string   // same as referralCode — frontend uses both
  balance: number      // TWIN token balance
  token: string        // Access JWT
  refreshToken: string // Refresh JWT
  recentSessions: LoginActivity[]
}
```

### `LoginActivity`
```typescript
{
  ip: string
  userAgent: string
  status: "success" | "failed"
  createdAt: string  // ISO datetime
}
```

---

## 13. Model Mapping Checklist

This section lists every data concept the .NET backend must be able to provide. For each item, the .NET team should mark whether their models can supply it directly, require a transformation, or need to be discussed.

### Users & Identity
- [ ] User UUID (`users.id`)
- [ ] Mobile number (`users.mobile`)
- [ ] Email (`users.email`)
- [ ] First name + last name (`user_profiles.first_name`, `last_name`)
- [ ] Referral code — format `NIB{6 digits}` (`users.referral_code`)
- [ ] User role — `"client" | "manager" | "admin"` (`user_roles` or role code)
- [ ] User status — `"active" | "suspended" | "pending_verification" | "closed"`
- [ ] KYC status — `"none" | "pending" | "verified" | "rejected"`
- [ ] Birth date (`user_profiles.birth_date`)
- [ ] National ID (`user_profiles.national_id`)
- [ ] External NibMarket account link (`external_account_links`)
- [ ] Password stored as bcrypt hash — must support `$2b$` prefix normalization from `$2y$`
- [ ] Login session log (ip, user_agent, status, created_at)

### Wallet & Tokens
- [ ] Wallet record per user (`wallets.id`, `owner_id`, `currency`, `status`)
- [ ] Token balances split into: `available`, `locked`, `pending`, `total` (`wallet_balances` or computed)
- [ ] Transaction records with: `id`, `rrn`, `date`, `type` (WalletTxType), `direction` (debit/credit), `amount`, `status`, `description`
- [ ] TWIN token price history — one record per day for last 30 days

### Network / Referral
- [ ] Network closure table — ancestor/descendant/depth relationships (`network_closure`)
- [ ] Referrer linkage (`users.referrer_id`)
- [ ] VIP invite codes — format `VIP{5 alphanumeric chars}`, 5 per user (`vip_invite_codes`)
- [ ] Invite letters — pending invites to non-registered users (`invite_letters`)
- [ ] Referral record (`referrals.invite_type` — `"regular" | "vip"`)
- [ ] Invite type tracked per referral

### Missions
- [ ] Mission definitions (`missions` table: id, code, title, description, type, reward, status, start/end dates, priority, verification mode)
- [ ] User mission records (`user_missions`: user_id, mission_id, status, progress JSON)
- [ ] Mission idempotency key — `mission:{code}:{userId}` to prevent duplicate completions
- [ ] Mission reward transaction — RRN format: `MSN{8 digits from timestamp}`

### Commission / Subset Deposits
- [ ] Commission entries table (`commission_entries`: user_id, level, base_amount, rate_percent, amount, status, created_at, source_user_id, fund_id, external_tx_id)
- [ ] Commission rules table (`commission_rules`: level, rate_percent, name, active)
- [ ] Status values: `"calculated" | "credited" | "reversed" | "failed"`

### Leaderboard & Competition
- [ ] Pool table (`pools`: code="REWARDS", total_amount)
- [ ] User balance used as ranking key
- [ ] Competition period = current calendar month (start/end computed dynamically)
- [ ] Top 20 winners per month

### Reports
- [ ] Commission entries accessible for income report (year, month, level, amount)
- [ ] Capital deposits (`nib_market_transactions`: tx_type="purchase", processing_status)

### Admin
- [ ] Admin role assignment table (with granted_at timestamp)
- [ ] Super admin concept — configured at environment level (not just a DB role)
- [ ] Mission CRUD with criteria JSON field

### Authentication / SSO
- [ ] JWT signing secret (min 32 chars) via `AUTH_SECRET` environment variable
- [ ] SSO token validation endpoint URL via `SSO_CHECK_TOKEN_URL` environment variable
- [ ] SSO response must include at minimum: `externalUserId`, optionally `role`, `mobile`, `email`, `fullName`
- [ ] Registration token flow: short-lived (10 min) JWT with `type: "registration"` claim

---

*This document was auto-generated from the NIB Club web-panel BFF source on 2026-06-29.*
*Any backend implementation must match every field name, type, and enum value exactly as specified.*
