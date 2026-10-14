# System Messages — API Handoff Document

**Feature:** Admin system-message send (single / group / all) + client inbox display  
**Task:** `mlm-04` (architecture + API contract handoff)  
**Audience:** Backend team (review, adjust, implement) and Club frontend (implement after backend sign-off)  
**Language:** English  
**Status:** Draft for backend review — not yet merged into `api-contract.md`

---

## 1. Overview & scope

### 1.1 Purpose

Admins and managers need to send system messages to:

- a single user,
- a reusable notification audience group, or
- all users,

optionally over **in-app (system)** and/or **SMS** channels, immediately or on a **schedule**.

Clients need an inbox:

- header bell showing the **latest 3** notifications,
- dedicated page `/dashboard/notifications` for the full list,
- **read / unread** state with mark-as-read.

### 1.2 Domain split

| Concept | Owner | Notes |
|---------|--------|--------|
| **Notification group** | Admin | Audience list for this feature only (v1). Backend may broaden later. |
| **System message campaign** | Admin | One send/schedule action + history row. Soft-deletable; **not editable** after create. |
| **User notification** | Client inbox | Delivery row per user when the system channel is used. Extends the existing `Notification` model (`type: "system"` for admin-sent messages). |

This feature **extends** the existing client notifications domain. It does **not** invent a parallel client product name.

Existing `/admin/notifications` (admin mobile preference / personal notifications UI) stays **separate** from send + campaign history.

### 1.3 Base URL

All paths below are under the BFF prefix:

```
/api/v2/...
```

Frontend `apiClient` prepends `/api/v2`. Backend implements the path **after** that prefix.

### 1.4 Out of scope (v1 frontend)

- SMS delivery status UI (queued / sent / failed per recipient)
- Separate SMS body vs system body (same `title`/`body` for both channels)
- Editing a campaign after create
- Recipient-count preview on confirm
- Changing glass-rail sidebar layout beyond nesting links under Users

---

## 2. Roles & auth

| Role | Access |
|------|--------|
| `admin` | Full access to groups + campaigns + user search |
| `manager` | Same as admin for this feature |
| `client` | Client notification endpoints only; **403/401** on `/admin/*` |

Auth follows the existing club contract (access JWT via `Authorization: Bearer` and/or httpOnly cookie). See `docs/api-contract.md` §1.1–1.2.

**Error envelope** (same as global contract):

```json
{
  "error": "snake_case_error_code",
  "message": "Human readable description"
}
```

---

## 3. Concepts

### 3.1 Notification group

Reusable named set of user IDs used only as a campaign audience (v1).

- **No member cap** on the frontend.
- **Title uniqueness** proposed as required; backend may relax (see §9).
- Member IDs are the same user UUIDs returned by `GET /admin/users`.
- Create / edit (title + members) / delete with two-step UI confirm. Cascade rules on delete are **backend-owned**.

### 3.2 System message campaign

One admin send or schedule operation.

| Field idea | Meaning |
|------------|---------|
| `audienceType` | `user` \| `group` \| `all` |
| `channels.system` | Deliver into client notification inbox |
| `channels.sms` | Deliver via SMS (backend validates mobile / provider) |
| `scheduledAt` | `null` → send ASAP; ISO-8601 UTC → schedule |
| `status` | `scheduled` \| `sent` \| `deleted` |

**Lifecycle**

1. Admin creates campaign (`POST`) → `scheduled` or `sent`.
2. At send time, backend materializes per-user notifications (if `channels.system`) and/or SMS (if `channels.sms`).
3. Admin may **soft-delete** (`DELETE`) → `status: "deleted"`. Clients no longer see related inbox rows. Admin history **still lists** the campaign as deleted.
4. **No PATCH** for content after create.

### 3.3 Client notification (inbox row)

Existing shape in `src/types/mlm.ts`:

```ts
type NotificationType = "system" | "network" | "promotion";

interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string; // ISO-8601
  isRead: boolean;
}
```

Admin-sent campaigns that use the system channel should create (or expose) rows with `type: "system"`. Soft-deleted campaigns must **not** appear in client list or bell.

### 3.4 Flow (high level)

```
Admin wizard
  → (optional) CRUD notification groups
  → POST /admin/system-messages
       → immediate or scheduler
            → user_notifications (system channel)
            → SMS provider (sms channel)
Client bell / page
  → GET /notifications
  → PATCH /notifications/:id/read
```

---

## 4. UX flows (for backend context)

### 4.1 Admin navigation

- Under **Users**, expandable sub-items:
  - User list → `/admin/users`
  - Send message → `/admin/users/messages`
- Sidebar glass rail behavior must not break; only nest under the existing Users item.

### 4.2 Send wizard (one page, stepwise)

1. Choose mode: **single** | **group** | **all**
2. Audience:
   - Single: lazy search users by **name or mobile** → select one
   - Group: pick from list / search groups; shortcut **Create group** opens a **modal**
   - All: no audience picker
3. Message: required `title` + `body` (max 1000 chars, live counter)
4. Confirm:
   - Preview recipient(s) / group / “all users”
   - Body preview (truncated + expand full text)
   - Channel toggles: system (default on) and SMS — at least one must be on
   - Optional **schedule**: Jalali calendar date + time → convert to UTC for API

### 4.3 Group modal

- Title field
- Lazy user search (name + mobile), click to add chip, chips removable
- Submit creates/updates group
- Delete: two-step confirmation

### 4.4 Admin history

Same page section: list campaigns (`scheduled` / `sent` / `deleted`). Soft-delete from here; no edit.

### 4.5 Client

- Bell: latest **3** notifications; “View all” → `/dashboard/notifications`
- Full page: paginated inbox
- Mark as read when the user opens/clicks an item (FE); API must support explicit mark-read

---

## 5. Data models

### 5.1 `NotificationGroup`

```ts
interface NotificationGroup {
  id: string;                 // UUID
  title: string;              // proposed unique
  memberIds: string[];        // user UUIDs
  memberCount: number;        // convenience for list UI
  createdAt: string;          // ISO-8601
  updatedAt: string;          // ISO-8601
}

/** Detail may optionally expand members for edit modal */
interface NotificationGroupDetail extends NotificationGroup {
  members: Array<{
    id: string;
    firstName: string;
    lastName: string;
    mobile: string;
  }>;
}
```

### 5.2 `SystemMessageCampaign`

```ts
type CampaignAudienceType = "user" | "group" | "all";
type CampaignStatus = "scheduled" | "sent" | "deleted";

interface CampaignChannels {
  system: boolean;
  sms: boolean;
}

interface SystemMessageCampaign {
  id: string;
  title: string;
  body: string;
  audienceType: CampaignAudienceType;
  /** Present when audienceType === "user" */
  userId?: string | null;
  /** Present when audienceType === "group" */
  groupId?: string | null;
  /** Display helpers for history / preview */
  audienceLabel?: string;     // e.g. user full name, group title, or "All users"
  channels: CampaignChannels;
  status: CampaignStatus;
  scheduledAt: string | null; // ISO-8601 UTC; null if immediate
  sentAt: string | null;      // set when delivery job runs
  deletedAt: string | null;
  createdBy: {
    id: string;
    fullName?: string;
  };
  createdAt: string;
}
```

### 5.3 Create campaign request

```ts
interface CreateSystemMessageRequest {
  title: string;              // max 120
  body: string;               // max 1000
  audienceType: CampaignAudienceType;
  userId?: string;            // required if audienceType === "user"
  groupId?: string;           // required if audienceType === "group"
  channels: CampaignChannels; // at least one true
  scheduledAt?: string | null; // ISO-8601 UTC; omit/null = immediate
}
```

### 5.4 Client `Notification`

Unchanged fields; pagination query params extended (see §6.1).

---

## 6. Endpoints

### 6.1 Client — extend existing notifications

Current mock: `GET /notifications`, `GET /notifications/activity`  
Service: `src/features/notifications/service.ts`

#### `GET /notifications`

> Paginated inbox for the authenticated client.

**Auth:** Required — any authenticated panel role that can access the client panel.

**Query parameters:**

| Param | Type | Default | Notes |
|-------|------|---------|--------|
| `page` | number | `1` | 1-based (client Pattern B) **or** align with existing BFF if it already uses `page`/`limit` |
| `limit` | number | `20` | Bell uses `limit=3` |
| `type` | `NotificationType` | — | Optional filter; admin-sent rows are `system` |

**Response `200`:** Prefer existing client paginated shape used by the BFF today:

```json
{
  "items": [
    {
      "id": "uuid",
      "type": "system",
      "title": "Welcome",
      "body": "Your account is ready.",
      "createdAt": "2026-08-16T08:30:00.000Z",
      "isRead": false
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

**Rules**

- Exclude notifications belonging to soft-deleted campaigns.
- Order: **newest first** (`createdAt` DESC).
- Bell: `GET /notifications?limit=3` (page 1).

#### `PATCH /notifications/:id/read`

> Mark one notification as read.

**Auth:** Required — owner of the notification only.

**Response `200`:**

```json
{
  "id": "uuid",
  "isRead": true
}
```

**Errors:** `404 not_found` if missing or not owned; `401 unauthorized`.

#### `POST /notifications/read-all` (optional)

> Mark all of the current user’s inbox items as read.

**Auth:** Required

**Response `200`:**

```json
{ "ok": true, "updated": 12 }
```

Frontend may ship without this initially; include if cheap on backend.

#### Unread badge (optional)

Either:

- derive from `GET /notifications?limit=3` / list (`isRead: false`), or
- add `GET /notifications/unread-count` → `{ "count": number }`

Propose deriving from list for v1 unless backend prefers a dedicated count endpoint.

---

### 6.2 Reuse — admin user search (no new endpoint)

#### `GET /admin/users`

Already documented in `docs/api-contract.md` / `docs/admin-backend-api-spec.md`.

**Auth:** `admin` or `manager`

**Query:** `search` (mobile, email, name), `page` (0-based), `pageSize`, optional `status`

**Use in this feature**

- Lazy search for **single recipient**
- Lazy search when **adding group members**

Response user `id` is the UUID passed as `userId` / `memberIds`.

Example:

```
GET /api/v2/admin/users?search=0912&page=0&pageSize=20
```

---

### 6.3 Admin — notification groups (new)

Base path: `/admin/notification-groups`  
**Auth:** `admin` or `manager`

#### `GET /admin/notification-groups`

| Param | Type | Default | Notes |
|-------|------|---------|--------|
| `page` | number | `0` | 0-based admin pagination |
| `pageSize` | number | `20` | |
| `search` | string | `""` | Search on group `title` |

**Response `200`:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "VIP Tehran",
      "memberIds": ["uuid-1", "uuid-2"],
      "memberCount": 2,
      "createdAt": "2026-10-01T10:00:00.000Z",
      "updatedAt": "2026-10-02T12:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 0,
  "pageSize": 20,
  "pageCount": 1
}
```

`memberIds` may be omitted on list if `memberCount` is enough; detail endpoint must return members for edit.

#### `POST /admin/notification-groups`

**Request:**

```json
{
  "title": "VIP Tehran",
  "memberIds": ["uuid-1", "uuid-2"]
}
```

| Field | Required | Rules |
|-------|----------|--------|
| `title` | yes | non-empty; max length TBD by backend (FE assumes ≤ 120); **propose unique** |
| `memberIds` | yes | array of user UUIDs; may be empty only if backend allows — FE will require ≥ 1 member |

**Response `201`:** `NotificationGroup` or `NotificationGroupDetail`

**Errors:** `409 conflict` if title unique and already exists; `400` invalid members.

#### `GET /admin/notification-groups/:id`

**Response `200`:** `NotificationGroupDetail` (includes `members` for edit modal).

#### `PATCH /admin/notification-groups/:id`

**Request** (all fields optional, at least one required):

```json
{
  "title": "VIP Tehran Updated",
  "memberIds": ["uuid-1", "uuid-3"]
}
```

- `memberIds` if present **replaces** the full member set (not patch-merge), unless backend prefers add/remove ops — FE will send the full list from the modal.

**Response `200`:** updated group detail.

#### `DELETE /admin/notification-groups/:id`

**Response `200`:** `{ "ok": true }`

Cascade (what happens to past campaigns referencing the group) is **backend decision**; FE only removes the group from UI after success. See §9.

---

### 6.4 Admin — system message campaigns (new)

Base path: `/admin/system-messages`  
**Auth:** `admin` or `manager`

#### `GET /admin/system-messages`

Campaign history for the send page.

| Param | Type | Default | Notes |
|-------|------|---------|--------|
| `page` | number | `0` | 0-based |
| `pageSize` | number | `20` | |
| `status` | `CampaignStatus \| ""` | `""` | Filter |
| `search` | string | `""` | Optional search on title/body |

**Response `200`:**

```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Maintenance window",
      "body": "Full text up to 1000 chars…",
      "audienceType": "group",
      "userId": null,
      "groupId": "group-uuid",
      "audienceLabel": "VIP Tehran",
      "channels": { "system": true, "sms": true },
      "status": "sent",
      "scheduledAt": null,
      "sentAt": "2026-10-12T08:00:00.000Z",
      "deletedAt": null,
      "createdBy": { "id": "admin-uuid", "fullName": "Admin User" },
      "createdAt": "2026-10-12T07:55:00.000Z"
    }
  ],
  "total": 10,
  "page": 0,
  "pageSize": 20,
  "pageCount": 1
}
```

Include soft-deleted rows so admins can see “sent and deleted”.

#### `POST /admin/system-messages`

Create immediate send or schedule.

**Request:**

```json
{
  "title": "Maintenance window",
  "body": "Services will be unavailable from 02:00 to 04:00.",
  "audienceType": "user",
  "userId": "user-uuid",
  "channels": { "system": true, "sms": false },
  "scheduledAt": null
}
```

**Audience variants**

| `audienceType` | Required fields | Ignored fields |
|----------------|-----------------|----------------|
| `user` | `userId` | `groupId` |
| `group` | `groupId` | `userId` |
| `all` | — | `userId`, `groupId` |

**Schedule**

| `scheduledAt` | Behavior |
|---------------|----------|
| `null` / omitted | Process ASAP → status `sent` when done (or `scheduled` briefly if async — backend may clarify) |
| future ISO-8601 UTC | Persist as `scheduled`; job runs at time |

**Response `201`:** full `SystemMessageCampaign`

**Channel / SMS notes for backend (FE does not special-case)**

- FE always sends `userId` / `groupId` / `all`; backend checks mobile presence and SMS eligibility.
- If SMS cannot be delivered for some recipients, backend decides partial success vs reject; FE shows generic success/error from API.

#### `DELETE /admin/system-messages/:id`

Soft delete.

**Behavior**

- Set `status` to `deleted`, set `deletedAt`.
- If still `scheduled`, cancel the job.
- Hide related rows from client `GET /notifications`.
- Row remains in admin `GET /admin/system-messages`.

**Response `200`:**

```json
{
  "id": "uuid",
  "status": "deleted",
  "deletedAt": "2026-10-12T09:00:00.000Z"
}
```

**No** `PATCH /admin/system-messages/:id` for content edits in v1.

---

## 7. Validation & error codes

### 7.1 Field validation (proposed)

| Field | Rule |
|-------|------|
| `title` (campaign) | required, trimmed, max **120** |
| `body` | required, trimmed, max **1000** |
| `channels` | object; `system` and `sms` booleans; **at least one** `true` |
| `audienceType` | enum `user` \| `group` \| `all` |
| `userId` / `groupId` | UUID; required per audience table above; must exist |
| `scheduledAt` | `null` or ISO-8601 UTC; if set, must be in the **future** (backend clock) |
| Group `title` | required; propose unique |
| Group `memberIds` | array of existing user UUIDs; FE requires ≥ 1 |

### 7.2 Error codes

| HTTP | `error` | When |
|------|---------|------|
| 400 | `bad_request` | Missing fields, empty body, no channel selected, invalid audience combo, past `scheduledAt` |
| 401 | `unauthorized` | Missing/invalid token |
| 403 | `forbidden` | Authenticated but not admin/manager (admin routes) |
| 404 | `not_found` | Unknown group, campaign, notification, or user |
| 409 | `conflict` | Duplicate group title (if uniqueness enforced) |
| 500 | `internal_server_error` | Unexpected failure (incl. SMS provider if treated as hard fail) |

---

## 8. Scheduling & timezone

| Layer | Convention |
|-------|------------|
| Admin UI | Persian (**Jalali**) date + time picker |
| API | **ISO-8601 UTC** only (`scheduledAt`, `sentAt`, `createdAt`, `deletedAt`, notification `createdAt`) |
| Display | FE formats UTC timestamps with existing Jalali helpers (`formatJalaliDateTime` in `src/lib/utils.ts`) |

Backend must not require Jalali strings. FE converts local Jalali selection → UTC before `POST`.

---

## 9. Open points for backend

Please review and return decisions (or an amended doc). Frontend will apply your changes.

1. **Group title uniqueness** — FE proposes unique titles + `409 conflict`. Confirm or allow duplicates.
2. **Audience `all` eligibility** — all users including suspended/pending/closed, or only `active`? FE sends `audienceType: "all"` only.
3. **SMS provider & partial failure** — reject whole campaign vs partial send when some mobiles missing.
4. **Same body for SMS** — v1 FE sends one `body` (max 1000). Confirm truncation/segment rules for SMS.
5. **Group delete cascade** — orphan campaigns keep `groupId` + label snapshot? block delete if referenced? FE only needs a clear error or success.
6. **Immediate send status** — sync `sent` in `201` vs async `scheduled`/`processing`? If async, suggest a status value FE should display.
7. **Notification materialization** — one DB row per user per campaign? link `campaignId` on notification (not required by FE v1 UI)?
8. **Pagination shape** — confirm client `items/total/page/limit` vs admin `data/total/page/pageSize/pageCount` as above.
9. **Optional endpoints** — `POST /notifications/read-all`, `GET /notifications/unread-count`: implement or skip for v1?

---

## 10. Frontend implementation notes (after approval)

Do **not** implement until this contract is signed off (with backend amendments applied).

| Area | Plan |
|------|------|
| Routes | `/admin/users/messages`; client `/dashboard/notifications` |
| Nav | Nested links under Users in `AdminSidebar` without changing rail width/animation |
| Wizard | Single page stepwise + group modal + history + soft delete confirm |
| Client bell | Add to client `PanelHeader` (today only admin header has an empty bell) |
| Services | Extend `NotificationsService`; add admin groups + system-messages services |
| Reuse | `GET /admin/users?search=` for all user pickers |
| i18n | FA copy for wizard, channels, schedule, history statuses |
| Mocks | BFF handlers until real backend is ready; then remove client mocks (`mlm-04-d`) |

---

## 11. Endpoint checklist (summary)

| Method | Path | New? | Role |
|--------|------|------|------|
| `GET` | `/notifications` | Extend (pagination/`limit`) | client |
| `PATCH` | `/notifications/:id/read` | **New** | client |
| `POST` | `/notifications/read-all` | Optional | client |
| `GET` | `/admin/users` | **Reuse** | admin, manager |
| `GET` | `/admin/notification-groups` | **New** | admin, manager |
| `POST` | `/admin/notification-groups` | **New** | admin, manager |
| `GET` | `/admin/notification-groups/:id` | **New** | admin, manager |
| `PATCH` | `/admin/notification-groups/:id` | **New** | admin, manager |
| `DELETE` | `/admin/notification-groups/:id` | **New** | admin, manager |
| `GET` | `/admin/system-messages` | **New** | admin, manager |
| `POST` | `/admin/system-messages` | **New** | admin, manager |
| `DELETE` | `/admin/system-messages/:id` | **New** | admin, manager |

---

## 12. Related codebase references

| Concern | Location |
|---------|----------|
| Existing notification types | `src/types/mlm.ts` |
| Client notifications service | `src/features/notifications/service.ts` |
| Mock handlers | `src/lib/api/server/handlers/notifications.handler.ts` |
| Route registry | `src/lib/api/server/route-registry.ts` |
| Endpoints map | `src/lib/api/endpoints.ts` |
| Admin users API | `docs/api-contract.md`, `docs/admin-backend-api-spec.md` |
| Admin sidebar | `src/components/organisms/admin/AdminSidebar.tsx` |
| Client notifications page (placeholder) | `src/app/(panel)/dashboard/notifications/page.tsx` |
| Task tracker | `novin-club-work/tasks.json` → `mlm-04` |

---

*End of handoff draft. Please return an annotated copy with accepted paths, field renames, and answers to §9.*
