# Admin «توکن تنوین» — API contract (club BE)

**Version:** 2026-11-14b (develop)  
**Base:** `/api/v2` · **Auth:** admin / manager  

FE mock BFF matches these shapes. Repo copy: `novin-club/docs/admin-twin-token-api.md`.  
Inbox: `novin-club-work/backend-inbox.md` packet **K**.

Internal id: `twin`. UI brand: **تنوین**.

---

## Surfaces

| Route | Uses |
|-------|------|
| `/admin/twin` | Price, composition pie (current stock), period filter (Jalali year/month), source bar chart, transactions table |
| `/admin/twin/treasury` | Composition pie + **add-only** treasury inflows |
| `/admin/twin/price` | Coming soon — **no BE** |

---

## Endpoints FE uses

### 1) `GET /admin/twin/sources`

**Single catalog** for every Twin transaction source the admin UI needs: **all missions, goals**, and any other BE-defined source types (commission, registration, pool, treasury, system, …).

FE uses this for:

- Transaction filter dropdown  
- Labels on the source bar chart and table  

Do **not** hardcode codes on FE.

```json
{
  "items": [
    { "code": "mission_daily_login", "label": "مأموریت ورود روزانه", "kind": "mission" },
    { "code": "goal_deposit", "label": "هدف واریز", "kind": "goal" },
    { "code": "commission_reward", "label": "کمیسیون شبکه", "kind": "commission" }
  ]
}
```

| Field | Rule |
|-------|------|
| `code` | Stable string (snake_case recommended) |
| `label` | FA display |
| `kind` | Optional: `mission` \| `goal` \| `commission` \| `registration` \| `pool` \| `treasury` \| `system` \| `other` |

---

### 2) `GET /admin/twin/overview`

Current **stock** + period-scoped **source breakdown** for charts.

**Query (Jalali, optional):**

| Param | Meaning |
|-------|---------|
| `year` | Jalali year; omit with `month` for **all-time** breakdown |
| `month` | `1`–`12`; omit for whole year when `year` set |

```json
{
  "tokenPriceRial": 25524,
  "tokenPriceChangePercent24h": 0.71,
  "totalTokens": 63670,
  "allocatedTokens": 13670,
  "unallocatedTokens": 50000,
  "totalFrozenTokens": 1093,
  "frozenPercent": 8.0,
  "totalAvailableTokens": 12577,
  "period": { "year": null, "month": null },
  "sourceBreakdown": [
    { "source": "mission_daily_login", "totalTokens": 3100 },
    { "source": "goal_deposit", "totalTokens": 1800 }
  ]
}
```

| Field | Rule |
|-------|------|
| Stock fields | **Always current** balances (`allocated + unallocated = total`; frozen ⊆ allocated) |
| `period` | Echo of applied Jalali filter; both null = all-time breakdown |
| `sourceBreakdown[].source` | Must be a `code` from `/sources` |
| `sourceBreakdown[].totalTokens` | Sum of **transactions** in the period (not wallet stock) |

**FE charts:**

- Composition pie → stock fields (not period-scaled)  
- Source bar → `sourceBreakdown` + labels from `/sources`  

---

### 3) `GET /admin/twin/transactions`

Paginated **Twin ledger** (not “user allocations”).

**Query:**

| Param | Meaning |
|-------|---------|
| `page`, `pageSize` | 0-based pagination |
| `search` | Prefer **mobile** match |
| `source` | Exact catalog `code` |
| `year`, `month` | Optional Jalali period (same as overview); omit = all time |

```json
{
  "data": [
    {
      "id": "tx-uuid",
      "userId": "user-uuid",
      "fullName": "…",
      "mobile": "09…",
      "amount": 120,
      "source": "mission_daily_login",
      "createdAt": "2026-11-14T12:00:00.000Z",
      "note": null
    }
  ],
  "total": 1,
  "page": 0,
  "pageSize": 20,
  "pageCount": 1
}
```

FE row action: navigate to `/admin/users/{userId}`.

**Removed:** `GET /admin/twin/allocations` (old holdings list).

---

### 4) `GET /admin/twin/supply-adjustments`

Treasury **inflows** log («ورودی‌های خزانه»). Query: `page`, `pageSize`.

Row: `id`, `amount` (> 0), `approxValueRial`, `effectiveDate`, `createdAt`, `createdByName`, `createdByUserId?`, `note?`.

---

### 5) `POST /admin/twin/supply-adjustments`

**Add-only** to unallocated (`amount` must be `> 0`). Reject `≤ 0` with `400`.

Request: `{ "amount": 1000, "effectiveDate": "1403/08/24", "note?": "…" }`  
Response: `{ "ok": true, "entry": {…}, "overview": {…} }` (overview may omit period or use all-time).

---

## Out of scope

| Item | Note |
|------|------|
| Price history API | `/admin/twin/price` is FE shell only |
| Dig auto CD / unrelated deploy | See deploy docs |
| Hardcoded FE source enums | Forbidden — catalog only |
| Negative treasury adjustments | Not allowed |

---

## Acceptance

- [ ] `/sources` returns full mission + goal (+ other) catalog  
- [ ] `/overview?year=&month=` scopes `sourceBreakdown`; stock always current  
- [ ] `/transactions` filters by mobile, source, optional period; rows include `userId`  
- [ ] Supply POST add-only; inflows list works  
- [ ] FE sends period query params even before BE period filter is live  

## FE pointers

- `ENDPOINTS.ADMIN.TWIN.OVERVIEW` \| `SOURCES` \| `TRANSACTIONS` \| `SUPPLY_ADJUSTMENTS`  
- Types: `AdminTwinOverviewResponse`, `AdminTwinSourcesResponse`, `AdminTwinTransaction*`  
- Period UI: Jalali year/month selects on Twin overview (empty = all time)  
