# Admin Panel — Backend API Specification

This document describes every admin API consumed by the NIB Club admin frontend. Use it as the contract for backend service development.

**Source of truth in the codebase:**

| Concern | Location |
|---------|----------|
| API paths | `src/lib/api/endpoints.ts` → `ENDPOINTS.ADMIN.*` |
| Request/response DTOs | `src/types/admin.ts` |
| Shared client DTOs (reuse in admin) | `src/types/mlm.ts` |
| BFF handlers (current mock impl.) | `src/lib/api/server/handlers/admin.handler.ts` |
| Route registration | `src/lib/api/server/route-registry.ts` |
| Admin UI pages | `src/app/(admin)/admin/` |

---

## 1. Overview

### 1.1 Base URL

All admin endpoints are exposed through the BFF:

```
/api/v2/admin/...
```

Example: `GET /api/v2/admin/users`

The frontend `apiClient` prepends `/api/v2` automatically. Backend services should implement the paths **after** `/api/v2` (i.e. `/admin/...`).

### 1.2 Authentication

| Mechanism | Detail |
|-----------|--------|
| Session | HTTP-only cookie `nib_token` (signed JWT access token) |
| Admin login | `POST /admin/auth/login` with `username` + `password` |
| Dev credentials | See `src/config/mock-hints.ts` → `DEV_ADMIN_LOGIN` (overridable server-side via `DEV_ADMIN_USERNAME`, `DEV_ADMIN_PASSWORD`) |
| Production | Backend validates admin/manager accounts and returns the same session payload |

**API authorization (BFF handlers today):**

| Role | Access |
|------|--------|
| `manager` | All admin endpoints except super-admin-only |
| `admin` | All admin endpoints including role changes |
| `client` | **401 Unauthorized** on all `/admin/*` |

Super-admin-only endpoint: `PATCH /admin/users/:userId/role` (requires `role === "admin"`).

### 1.3 Route guards (UI)

Frontend page access is enforced in `src/config/roles.ts`:

| Path prefix | Allowed roles |
|-------------|---------------|
| `/admin`, `/admin/users`, `/admin/twin`, `/admin/pool`, `/admin/sediment`, `/admin/network`, `/admin/missions` | `manager`, `admin` |
| `/admin/reports` | `admin` only (page not implemented yet) |

### 1.4 Common response patterns

#### Paginated list (admin convention)

Admin list endpoints use this shape (different from client `Paginated<T>` which uses `items` + `limit`):

```ts
{
  data: T[];
  total: number;      // total matching rows (before pagination)
  page: number;       // 0-based page index
  pageSize: number;
  pageCount: number;  // Math.ceil(total / pageSize) || 1
}
```

#### Error responses

| Status | Body | When |
|--------|------|------|
| `401` | `{ "error": "Unauthorized" }` | Missing/invalid token or insufficient role |
| `400` | `{ "error": "<message>" }` | Validation failure |
| `404` | `{ "error": "<message>" }` | Resource not found |

#### Pagination query params (shared)

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | integer | `0` | 0-based page index |
| `pageSize` | integer | varies | Rows per page (see each endpoint) |
| `search` | string | `""` | Free-text filter (implementation varies) |
| `status` | string | `""` | Status filter where applicable |

---

## 2. Admin pages → APIs

| UI route | Page / section | APIs used |
|----------|----------------|-----------|
| `/admin/login` | Admin login | `POST /admin/auth/login` |
| `/admin` | Dashboard stats | `GET /admin/stats` |
| `/admin/users` | Demographics cards | `GET /admin/users/demographics` |
| `/admin/users` | User table + filters | `GET /admin/users` |
| `/admin/users` | Change user status (modal) | `PATCH /admin/users/:userId/status` |
| `/admin/users/:userId` | User profile (admin view) | `GET /admin/users/:userId` |
| `/admin/twin` | TWIN overview + allocations table | `GET /admin/twin/overview`, `GET /admin/twin/allocations` |
| `/admin/pool` | Pool overview + participants + history | `GET /admin/pool/overview`, `GET /admin/pool/participants`, `GET /admin/pool/periods` |
| `/admin/network` | Invite stats + templates + log | `GET /admin/network/invites/overview`, `GET /admin/network/invite-templates`, `POST /admin/network/invite-templates`, `PATCH /admin/network/invite-templates/:templateId`, `GET /admin/network/invites/log` |
| `/admin/missions` | Overview + list + job health + completions | `GET /admin/missions/overview`, `GET /admin/missions/list`, `GET /admin/missions/jobs/health`, `GET /admin/missions/completions`, `PATCH /admin/missions/:missionId/status` |
| `/admin/sediment` | Overview + job + assets + deposits | `GET /admin/sediment/overview`, `GET /admin/sediment/job`, `GET /admin/sediment/assets`, `GET /admin/sediment/deposits` |

### Pages / endpoints not wired to UI yet

| Item | Status |
|------|--------|
| `PATCH /admin/users/:userId/role` | Handler exists; no admin UI |
| `GET /admin/network/closure` | Stub returns empty list; no UI |
| `/admin/reports` | Route guard defined; no page or API |
| `/admin/admins` | Removed from UI; not in current `ENDPOINTS.ADMIN` |

---

## 3. Shared client DTOs (reuse in admin responses)

Admin responses should **extend or embed** these types from `src/types/mlm.ts` rather than inventing parallel shapes.

| Client type | Used in admin |
|-------------|---------------|
| `UserRole` | User list, profile, role update |
| `WalletSummary` | User profile (`totalTokens`, `frozenTokens`, `availableTokens`, `pendingTokens`) |
| `NetworkSubset` | User profile subordinates table |
| `SubsetDeposits` | User profile deposit summary |
| `LoginActivity` | User profile recent sessions |
| `ReferrerInfo` | User profile referrer block |
| `SubsetDepositStatus` | Sediment deposits |
| `MissionDef` fields | Mission list (mapped to `AdminMissionListItem`) |
| `CompetitionPool` fields | Pool overview |
| `LeaderboardEntry` fields | Pool participants |
| `CompetitionPeriod` fields | Pool period history |

**Admin-only extensions** (not in client DTOs): demographics, module access, inviter/invitee cross-user fields, job health metadata, NibMarket asset rows, sediment aggregates, TWIN allocation source per user.

---

## 4. API reference

---

### 4.0 Authentication

#### `POST /admin/auth/login`

**Auth:** Public (no session required)

**Business:** Authenticate an admin or manager user with username and password. Issues JWT access/refresh tokens and sets session cookies. Used exclusively by `/admin/login`.

**Request:** `AdminLoginRequest`

```ts
{
  username: string;
  password: string;
}
```

**Response:** `AdminLoginResponse`

```ts
{
  id: string;
  userId: string;
  fullName: string;
  mobile: string;
  email: string;
  role: "manager" | "admin";   // must not return "client" for admin panel access
  token: string;
  refreshToken: string;
  balance: number;
  wallet: WalletSummary;
  recentSessions: LoginActivity[];
}
```

**Cookies set:** `nib_token`, `nib_role`, `nib_refresh`

**Errors:**

| Status | When |
|--------|------|
| `400` | Missing username or password |
| `401` | Invalid credentials |

**Dev mock credentials** (when `NODE_ENV !== "production"` or `ENABLE_DEV_ADMIN_LOGIN=1`):

| Field | Default |
|-------|---------|
| Username | `admin` |
| Password | `Admin@1403` |

**Backend requirements:**

1. Store admin users with hashed passwords (bcrypt or equivalent).
2. Only users with `role` of `manager` or `admin` may log in via this endpoint.
3. Return the same session payload shape as client `POST /auth/login` so the frontend `applyAuthSession()` works unchanged.
4. Rate-limit failed attempts.

**UI:** `/admin/login`

---

### 4.1 Dashboard

#### `GET /admin/stats`

**Auth:** manager, admin

**Business:** Return high-level counters for the admin dashboard landing page.

**Response:** (type not yet in `admin.ts` — add `AdminStatsResponse`)

```ts
{
  totalUsers: number;    // count of all registered users
  activeUsers: number;   // users where status === "active"
  activeMissions: number; // missions where status === "active" (NOT user completion flags)
}
```

**UI:** `/admin` dashboard stat cards

**Backend note:** Current mock counts `!mission.completed` which is wrong for admin semantics. Backend should count missions with `status === "active"` (same as missions overview).

---

### 4.2 Users

#### `GET /admin/users/demographics`

**Auth:** manager, admin

**Business:** Aggregate user demographics for dashboard-style stat cards (age buckets, gender split, total count). Used for charts on the users list page.

**Response:** `AdminUsersDemographicsResponse`

```ts
{
  totalUsers: number;
  ageDistribution: { range: string; count: number; percent: number }[];
  genderDistribution: {
    gender: "male" | "female";
    label: string;   // localized display label
    count: number;
    percent: number;
  }[];
}
```

**UI:** `/admin/users` — demographics section

---

#### `GET /admin/users`

**Auth:** manager, admin

**Query params:**

| Param | Default | Description |
|-------|---------|-------------|
| `page` | `0` | Page index |
| `pageSize` | `20` | Rows per page |
| `search` | `""` | Match against mobile, email, firstName, lastName, fullName, referralCode |
| `status` | `""` | Filter by user status; empty = all |

**Business:** Paginated searchable list of all platform users for admin review.

**Response:** `AdminUsersListResponse`

```ts
{
  data: AdminUserListItem[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}
```

**`AdminUserListItem`** (aligned with client `User` + admin field):

```ts
{
  id: string;
  mobile: string;
  email: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  role: UserRole;           // "client" | "manager" | "admin"
  status: AdminUserStatus;  // "pending_verification" | "active" | "suspended" | "closed"
  kycStatus: AdminUserKycStatus; // "none" | "pending" | "verified" | "rejected"
  referralCode: string;
  createdAt: string;        // ISO 8601 — admin-only
}
```

**UI:** `/admin/users` table

---

#### `GET /admin/users/:userId`

**Auth:** manager, admin

**Business:** Full admin view of a single user — identity, wallet, network, module access, deposit summary, mission progress, sessions, referrer.

**Response:** `AdminUserProfileResponse`

```ts
{
  user: AdminUserListItem & {
    birthDate: string | null;
    gender: "male" | "female" | null;
    nationalId: string | null;
    nibMarketLinked: boolean;
  };
  wallet: WalletSummary;
  subordinates: NetworkSubset[];
  directSubordinatesCount: number;
  totalNetworkSize: number;
  modules: AdminUserModuleAccess[];
  subsetDeposits: SubsetDeposits;
  missionProgress: { completed: number; total: number; activeCount: number };
  recentSessions: LoginActivity[];
  referrer: ReferrerInfo | null;
}
```

**`AdminUserModuleAccess`** — client panel sections visible to this user:

```ts
{ key: string; label: string; path: string; enabled: boolean; description?: string }
```

**Shared types:**

- `WalletSummary`, `NetworkSubset`, `SubsetDeposits`, `LoginActivity`, `ReferrerInfo` from `mlm.ts`

**UI:** `/admin/users/:userId`

**Backend note:** `missionProgress` must be **per-user** (from mission completion records), not global mission definition flags.

---

#### `PATCH /admin/users/:userId/status`

**Auth:** manager, admin

**Business:** Change a user's account status (suspend, activate, close, etc.). Used from the users list status modal.

**Request:** `UpdateAdminUserStatusRequest`

```ts
{ status: "active" | "suspended" | "pending_verification" | "closed" }
```

**Response:** `UpdateAdminUserStatusResponse`

```ts
{ ok: true }
```

**Errors:** `400` invalid status, `404` user not found

**UI:** `/admin/users` — change status modal

---

#### `PATCH /admin/users/:userId/role`

**Auth:** **admin only** (super-admin)

**Business:** Assign a platform role to a user. Intended for promoting/demoting managers and admins.

**Request:** `UpdateAdminUserRoleRequest`

```ts
{ roleCode: UserRole }  // "client" | "manager" | "admin"
```

**Response:** `UpdateAdminUserStatusResponse`

```ts
{ ok: true }
```

**Errors:** `401` if caller is not `admin`, `400` missing roleCode, `404` user not found

**UI:** Not implemented yet — backend should still expose this for future admin management UI.

---

### 4.3 TWIN token management

#### `GET /admin/twin/overview`

**Auth:** manager, admin

**Business:** Platform-wide TWIN token aggregates and current token price for the admin TWIN dashboard.

**Response:** `AdminTwinOverviewResponse`

```ts
{
  tokenPriceRial: number;
  tokenPriceChangePercent24h: number;
  totalTokens: number;          // sum of all user balances
  totalFrozenTokens: number;
  frozenPercent: number;        // (totalFrozen / totalTokens) * 100
  totalAvailableTokens: number;
}
```

**UI:** `/admin/twin` — overview stat cards

**Client alignment:** Token price relates to client `GET /wallet/token-price`; aggregates are admin-only.

---

#### `GET /admin/twin/allocations`

**Auth:** manager, admin

**Query params:**

| Param | Default | Description |
|-------|---------|-------------|
| `page` | `0` | Page index |
| `pageSize` | `20` | Rows per page |
| `search` | `""` | Match mobile, name, referralCode |

**Business:** Per-user TWIN wallet breakdown for admin monitoring. Sorted by `totalTokens` descending.

**Response:** `AdminTwinAllocationsResponse`

**Row:** `AdminTwinAllocationRow`

```ts
{
  id: string;
  userId: string;
  fullName: string;
  mobile: string;
  totalTokens: number;
  availableTokens: number;
  frozenTokens: number;
  frozenPercent: number;
  primarySource: AdminTwinAllocationSource;
  lastAllocationAt: string;  // ISO 8601
}
```

**`AdminTwinAllocationSource`:**

```ts
"mission_reward" | "commission_reward" | "registration" | "adjustment" | "mint" | "pool_deposit"
```

**Client alignment:** Wallet fields match `WalletSummary`. `primarySource` maps to `WalletTxType` plus `"registration"` (consider adding to client enum).

**UI:** `/admin/twin` — allocations table

---

### 4.4 Competition pool

#### `GET /admin/pool/overview`

**Auth:** manager, admin

**Business:** Current competition period pool metrics for admin monitoring and distribution tracking.

**Response:** `AdminPoolOverviewResponse`

```ts
{
  totalPool: number;
  dailyChange: number;
  dailyChangePercent: number;
  participantCount: number;
  topWinners: number;           // number of ranked winners for current period
  startDate: string;            // ISO 8601 — current period start
  endDate: string;              // ISO 8601 — current period end
  contextTitle: string;         // period label or i18n key (UI resolves "current" → localized text)
  distributedThisPeriod: number;
  pendingDistribution: number;
}
```

**Client alignment:** Core fields match client `CompetitionPool`. Admin adds `dailyChangePercent`, `distributedThisPeriod`, `pendingDistribution`.

**UI:** `/admin/pool` — overview section

---

#### `GET /admin/pool/participants`

**Auth:** manager, admin

**Query params:** `page` (0), `pageSize` (20), `search` (name, mobile, userId)

**Business:** Ranked list of pool participants for the current period with estimated rewards.

**Response:** `AdminPoolParticipantsResponse`

**Row:** `AdminPoolParticipantRow`

```ts
{
  rank: number;
  userId: string;
  fullName: string;
  mobile: string;           // admin-only
  tokens: number;
  subsetCount: number;
  sharePercent: number;     // admin-only
  estimatedReward: number;  // admin-only — 0 if rank > topWinners
}
```

**Client alignment:** Extends client `LeaderboardEntry` with admin fields.

**Reward logic (mock reference):** Top N winners (`topWinners` from overview) share 70% of pool proportionally by token weight.

**UI:** `/admin/pool` — participants table

---

#### `GET /admin/pool/periods`

**Auth:** manager, admin

**Query params:** `page` (0), `pageSize` (10), `search` (title, winnerName, id)

**Business:** Historical competition periods with distribution outcomes.

**Response:** `AdminPoolPeriodsResponse`

**Row:** `AdminPoolPeriodRow`

```ts
{
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  totalPool: number;
  winnerName: string;
  participantCount: number;   // admin-only
  distributedAmount: number;  // admin-only
}
```

**Client alignment:** Extends client `CompetitionPeriod`.

**UI:** `/admin/pool` — period history table

---

### 4.5 Network & invites

#### `GET /admin/network/invites/overview`

**Auth:** manager, admin

**Business:** Quick invite activity counters for the network admin page header.

**Response:** `AdminInviteOverviewResponse`

```ts
{
  todayCount: number;  // invites sent today (local timezone)
  totalCount: number;  // all-time invite log count
}
```

**UI:** `/admin/network` — overview stat cards

---

#### `GET /admin/network/invites/log`

**Auth:** manager, admin

**Query params:** `page` (0), `pageSize` (10), `search` (inviter/invitee name or mobile, template title)

**Business:** Audit log of all invite messages sent on the platform. Newest first.

**Response:** `AdminInviteLogResponse`

**Row:** `AdminInviteLogRow`

```ts
{
  id: string;
  sentAt: string;
  inviterUserId: string;
  inviterName: string;
  inviterMobile: string;
  inviteeFullName: string;
  inviteeMobile: string;
  templateId: string;
  templateTitle: string;
  messagePreview: string;   // truncated plain-text preview (~120 chars)
  fundId: string;
  status: "pending_invite" | "pending_verification" | "active" | "suspended" | "closed";
}
```

**Client alignment:** Status values match client `InviteStatus`. Inviter/invitee fields are admin cross-user view.

**UI:** `/admin/network` — invite log table (subset of fields displayed; backend should return full row)

---

#### `GET /admin/network/invite-templates`

**Auth:** manager, admin

**Business:** List all invite message templates available to users. Admin can preview template bodies.

**Response:** `AdminInviteTemplatesResponse`

```ts
{
  data: AdminInviteTemplateRow[];
}
```

**Row:**

```ts
{
  id: string;
  title: string;
  body: string;              // with placeholders: {firstName}, {lastName}, {inviterName}
  placeholders: string[];
  isActive: boolean;
}
```

**Client alignment:** Client currently uses i18n keys (`titleKey`, `bodyKey`) in `src/lib/network/invite-templates.ts`. **Backend should expose resolved `title` + `body`** and serve the same templates to both client `GET /network/invite-templates` (future) and admin.

**UI:** `/admin/network` — template list

---

#### `POST /admin/network/invite-templates`

**Auth:** manager, admin

**Business:** Create a new custom invite template. Server generates `id` and extracts `placeholders` from `{placeholder}` patterns in body.

**Request:** `CreateAdminInviteTemplateRequest`

```ts
{ body: string }  // required, non-empty
```

**Response:** `CreateAdminInviteTemplateResponse`

```ts
{ id: string }
```

**Errors:** `400` if body empty

**UI:** `/admin/network` — create template modal

---

#### `PATCH /admin/network/invite-templates/:templateId`

**Auth:** manager, admin

**Business:** Update an existing template body. Placeholders are re-extracted server-side.

**Request:** `UpdateAdminInviteTemplateRequest`

```ts
{ body: string }  // required, non-empty
```

**Response:** `UpdateAdminInviteTemplateResponse`

```ts
{ ok: true }
```

**Errors:** `400` invalid body, `404` template not found

**UI:** `/admin/network` — edit template modal

---

#### `GET /admin/network/closure`

**Auth:** manager, admin

**Business:** *(Planned)* Network closure / genealogy reconciliation report.

**Response (current stub):**

```ts
{ data: []; total: 0; page: 0; pageSize: 50; pageCount: 0 }
```

**UI:** Not implemented. Define final schema when product requirements are ready.

---

### 4.6 Missions

#### `GET /admin/missions/overview`

**Auth:** manager, admin

**Business:** Summary counters for the missions admin page header.

**Response:** `AdminMissionsOverviewResponse`

```ts
{
  missionCount: number;
  activeMissionCount: number;  // missions where status === "active"
  jobCount: number;            // backend jobs linked to missions
}
```

**UI:** `/admin/missions` — overview stat cards

---

#### `GET /admin/missions/list`

**Auth:** manager, admin

**Query params:** `page` (0), `pageSize` (10), `search` (code, title, job name/id)

**Business:** Paginated list of all mission definitions with linked backend job metadata.

**Response:** `AdminMissionsListResponse`

**Row:** `AdminMissionListItem`

```ts
{
  id: string;
  code: string;
  title: string;
  description: string | null;
  missionType: "referral_count" | "purchase" | "registration" | "fund_issue" | "custom";
  rewardAmount: number;        // maps from client MissionDef.reward
  verificationMode: "auto" | "manual";
  status: "active" | "paused" | "draft" | "archived";
  job: {
    jobId: string;
    jobName: string;
    schedule: string;        // cron expression
  };
  createdAt: string;
}
```

**Client alignment:** Based on `MissionDef` + admin job metadata. Frontend normalizes missing `job` via `normalizeAdminMissionList()`.

**UI:** `/admin/missions` — missions table

---

#### `GET /admin/missions/jobs/health`

**Auth:** manager, admin

**Business:** Real-time health snapshot of backend cron/worker jobs that verify and reward missions. Used for ops monitoring.

**Response:** `AdminMissionJobsHealthResponse`

```ts
{
  checkedAt: string;           // ISO 8601
  overallStatus: "healthy" | "degraded" | "down" | "unknown";
  jobs: AdminMissionJobHealthItem[];
}
```

**Job item:**

```ts
{
  missionId: string;
  missionCode: string;
  missionTitle: string;
  jobId: string;
  jobName: string;
  status: "healthy" | "degraded" | "down" | "unknown";
  lastRunAt: string | null;
  lastSuccessAt: string | null;
  nextRunAt: string | null;
  latencyMs: number | null;
  message: string | null;      // i18n key under admin.missions.health.messages
}
```

**Overall status logic:** `down` if any job down → else `degraded` if any degraded → else `healthy` if all healthy → else `unknown`.

**UI:** `/admin/missions` — job health panel

---

#### `GET /admin/missions/completions`

**Auth:** manager, admin

**Query params:** `page` (0), `pageSize` (8 in UI, default 10 in handler)

**Business:** Recent mission completion events across all users (audit / reward tracking).

**Response:** `AdminMissionCompletionsResponse`

**Row:** `AdminMissionCompletionRow`

```ts
{
  id: string;
  completedAt: string;
  userId: string;
  userFullName: string;
  userMobile: string;
  missionId: string;
  missionCode: string;
  missionTitle: string;
  rewardAmount: number;
}
```

**Client alignment:** Related to client `MissionActivity` but admin-facing with user identity fields.

**UI:** `/admin/missions` — completions table

---

#### `PATCH /admin/missions/:missionId/status`

**Auth:** manager, admin

**Business:** Pause or resume a mission definition. Does not affect already-completed user records.

**Request:** `UpdateAdminMissionStatusRequest`

```ts
{ status: "active" | "paused" }
```

**Response:** `UpdateAdminMissionStatusResponse`

```ts
{ ok: true }
```

**Errors:** `400` invalid status, `404` mission not found

**Side effect:** Paused missions should report `degraded` health in jobs/health.

**UI:** `/admin/missions` — pause/resume action per row

---

### 4.7 Sediment (NibMarket profit distribution)

Sediment is the process of converting NibMarket fund profits into TWIN token subset deposits across the MLM network.

#### `GET /admin/sediment/overview`

**Auth:** manager, admin

**Business:** Platform-wide sediment metrics — linked NibMarket assets and TWIN distribution totals.

**Response:** `AdminSedimentOverviewResponse`

```ts
{
  totalAssetValueRial: number;
  linkedUsersCount: number;
  assetRecordsCount: number;
  todaySedimentTwin: number;    // credited TWIN today
  monthSedimentTwin: number;    // credited TWIN this calendar month
  pendingSedimentTwin: number;  // calculated but not yet credited
}
```

**UI:** `/admin/sediment` — overview stat cards

---

#### `GET /admin/sediment/job`

**Auth:** manager, admin

**Business:** Status of the scheduled sediment distribution backend job.

**Response:** `AdminSedimentJobResponse`

```ts
{
  jobId: string;
  jobName: string;
  schedule: string;             // cron, e.g. "0 6 * * *"
  status: "healthy" | "degraded" | "down" | "unknown";
  lastRunAt: string | null;
  lastSuccessAt: string | null;
  nextRunAt: string | null;
  processedAssets: number;
  distributedTwin: number;      // TWIN distributed in last run / today
  message: string | null;
}
```

**UI:** `/admin/sediment` — job status card

---

#### `GET /admin/sediment/assets`

**Auth:** manager, admin

**Query params:** `page` (0), `pageSize` (20), `search` (user name/mobile, fund name/id)

**Business:** NibMarket fund holdings synced per user — input data for sediment calculation.

**Response:** `AdminNibMarketAssetsResponse`

**Row:** `AdminNibMarketAssetRow`

```ts
{
  id: string;
  userId: string;
  fullName: string;
  mobile: string;
  fundId: string;
  fundName: string;
  assetValueRial: number;
  profitRatePercent: number;
  syncedAt: string;
}
```

**UI:** `/admin/sediment` — assets table

---

#### `GET /admin/sediment/deposits`

**Auth:** manager, admin

**Query params:**

| Param | Default | Description |
|-------|---------|-------------|
| `page` | `0` | Page index |
| `pageSize` | `20` | Rows per page |
| `search` | `""` | Beneficiary, source user, fund, externalTxId |
| `status` | `""` | Filter: `calculated`, `credited`, `reversed`, `failed` |

**Business:** Cross-user sediment deposit ledger — TWIN credited to uplines based on downline NibMarket profits.

**Response:** `AdminSedimentDepositsResponse`

**Row:** `AdminSedimentDepositRow`

```ts
{
  id: string;
  processedAt: string;
  beneficiaryUserId: string;
  beneficiaryName: string;
  beneficiaryMobile: string;
  sourceUserName: string;
  level: number;
  baseAmountRial: number;
  ratePercent: number;
  sedimentTwin: number;
  status: SubsetDepositStatus;  // "calculated" | "credited" | "reversed" | "failed"
  fundId: string;
  fundName: string;
  externalTxId: string | null;
}
```

**Client alignment:** Semantically matches client `SubsetDepositTransaction` with admin naming:

| Client field | Admin field |
|--------------|-------------|
| `date` | `processedAt` |
| `amount` | `sedimentTwin` |
| `baseAmount` | `baseAmountRial` |

Backend may unify naming when implementing, but frontend currently expects admin field names above.

**UI:** `/admin/sediment` — deposits table

---

## 5. Complete endpoint index

| Method | Path | Auth | UI wired |
|--------|------|------|----------|
| `POST` | `/admin/auth/login` | public | ✅ |
| `GET` | `/admin/stats` | manager, admin | ✅ |
| `GET` | `/admin/users/demographics` | manager, admin | ✅ |
| `GET` | `/admin/users` | manager, admin | ✅ |
| `GET` | `/admin/users/:userId` | manager, admin | ✅ |
| `PATCH` | `/admin/users/:userId/status` | manager, admin | ✅ |
| `PATCH` | `/admin/users/:userId/role` | admin only | ❌ |
| `GET` | `/admin/twin/overview` | manager, admin | ✅ |
| `GET` | `/admin/twin/allocations` | manager, admin | ✅ |
| `GET` | `/admin/pool/overview` | manager, admin | ✅ |
| `GET` | `/admin/pool/participants` | manager, admin | ✅ |
| `GET` | `/admin/pool/periods` | manager, admin | ✅ |
| `GET` | `/admin/network/invites/overview` | manager, admin | ✅ |
| `GET` | `/admin/network/invites/log` | manager, admin | ✅ |
| `GET` | `/admin/network/invite-templates` | manager, admin | ✅ |
| `POST` | `/admin/network/invite-templates` | manager, admin | ✅ |
| `PATCH` | `/admin/network/invite-templates/:templateId` | manager, admin | ✅ |
| `GET` | `/admin/network/closure` | manager, admin | ❌ stub |
| `GET` | `/admin/missions/overview` | manager, admin | ✅ |
| `GET` | `/admin/missions/list` | manager, admin | ✅ |
| `GET` | `/admin/missions/jobs/health` | manager, admin | ✅ |
| `GET` | `/admin/missions/completions` | manager, admin | ✅ |
| `PATCH` | `/admin/missions/:missionId/status` | manager, admin | ✅ |
| `GET` | `/admin/sediment/overview` | manager, admin | ✅ |
| `GET` | `/admin/sediment/job` | manager, admin | ✅ |
| `GET` | `/admin/sediment/assets` | manager, admin | ✅ |
| `GET` | `/admin/sediment/deposits` | manager, admin | ✅ |

**Total: 28 endpoints** (26 active in UI, 2 planned/stub)

---

## 6. Backend implementation checklist

When implementing each service:

1. **Reuse client DTO field names** where the data is the same entity (wallet, network subset, user identity).
2. **Add admin-only fields** as extensions — do not rename client fields unless documented (sediment deposit naming is a known exception).
3. **Use admin pagination shape** (`data`, `page`, `pageSize`, `pageCount`) — not client `Paginated<T>`.
4. **Return ISO 8601 timestamps** for all date/time fields.
5. **Enforce role checks** at the API layer (not only UI guards).
6. **Keep invite templates as a single source** — changes via admin must reflect in client invite flow.
7. **Compute per-user mission progress** from completion records, not mission definition flags.
8. **Count active missions** by `MissionDef.status === "active"`, not user `completed` flags.

### Suggested backend service grouping

| Service domain | Endpoints |
|----------------|-----------|
| `AdminUserService` | `/admin/stats`, `/admin/users/*` |
| `AdminTwinService` | `/admin/twin/*` |
| `AdminPoolService` | `/admin/pool/*` |
| `AdminNetworkService` | `/admin/network/*` |
| `AdminMissionService` | `/admin/missions/*` |
| `AdminSedimentService` | `/admin/sediment/*` |

### BFF integration modes

| Mode | Behavior |
|------|----------|
| `mock` (default dev) | Local handlers + in-memory fixtures |
| `api` | BFF proxies to external backend at `/api/v2/*` |
| Dev admin auth | `/admin/*` stays local even in `api` mode (`bff-route-handler.ts`) until backend admin auth is ready |

---

## 7. Open items for product/backend alignment

| Item | Recommendation |
|------|----------------|
| Admin authentication | Backend admin user store with username/password; remove dev virtual admin |
| Invite templates | Single API for client + admin; resolved `title`/`body`, not i18n keys |
| `GET /admin/network/closure` | Define schema when network reconciliation feature is scoped |
| `PATCH /admin/users/:userId/role` | Build admin management UI or document as API-only |
| `/admin/reports` | Not scoped — no endpoints yet |
| `AdminStatsResponse` | Add to `src/types/admin.ts` when backend contract is finalized |
| Sediment deposit field names | Consider aliasing to client `SubsetDepositTransaction` fields in backend with BFF mapping |

---

## 8. TypeScript type reference

Import all admin DTOs from:

```ts
import type { ... } from "@/types/admin";
```

Import shared domain types from:

```ts
import type { WalletSummary, NetworkSubset, ... } from "@/types/mlm";
```

When backend is implemented in another language, use this document + `src/types/admin.ts` + `src/types/mlm.ts` as the schema reference.
