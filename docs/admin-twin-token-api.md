# Admin «توکن تنوین» — API contract for club BE

**Version:** 2026-11-14 (develop)  
**Base path:** `/api/v2`  
**Auth:** admin / manager  

Share this file with club backend. FE mock BFF implements the same shapes; API mode proxies these routes.

Related: `novin-club-work/backend-inbox.md` packet **K** · types `novin-club/src/types/admin.ts` · paths `ENDPOINTS.ADMIN.TWIN.*`

---

## Business summary (what the admin product does)

Display name in UI: **تنوین**. Internal route/API id remains `twin`.

| Admin surface | Route | Job |
|---------------|-------|-----|
| Overview | `/admin/twin` | Instant price, composition pie (allocated / frozen / unallocated), source bar chart, user allocations table (search + source filter). Shortcut / low-treasury alert → treasury. |
| Treasury | `/admin/twin/treasury` | Same composition pie + **add-only** supply form + **ورودی‌های خزانه** (inflows log). |
| Price detail | `/admin/twin/price` | Coming soon shell only — **no BE** yet. |

**Sidebar:** «توکن تنوین» branch → «نمای کلی» + «خزانه».

### Domain rules

1. **Supply split:** `totalTokens = allocatedTokens + unallocatedTokens`.
2. **Allocated** = tokens held by users (includes frozen).
3. **Unallocated** = treasury / not yet assigned to users.
4. **Frozen** ⊆ allocated (transfer/sale lock). `totalAvailableTokens = allocated − frozen`.
5. **Treasury can only increase.** Admin POST adds positive tokens to unallocated. No decrease / burn / negative adjustment via this API.
6. **Allocation sources** are a BE-owned catalog (`GET /sources`). FE does not hardcode the filter list.
7. **Low-treasury alert (FE-only today):** when `unallocatedTokens / totalTokens < 15%`, overview shows an alert shortcut to `/admin/twin/treasury`. Otherwise shows «مدیریت خزانه». Optional later: BE threshold or `treasuryAlert` flag on overview.

---

## Endpoints

### 1) `GET /admin/twin/overview` — extend

Dashboard totals for overview + treasury composition card.

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
  "sourceBreakdown": [
    { "source": "pool_deposit", "totalTokens": 4200 },
    { "source": "mission_reward", "totalTokens": 3100 }
  ]
}
```

| Field | Rule |
|-------|------|
| `totalTokens` | `allocatedTokens + unallocatedTokens` |
| `allocatedTokens` | Sum of user-held tokens (**includes** frozen) |
| `unallocatedTokens` | Treasury / not assigned to users |
| `totalFrozenTokens` | Subset of allocated |
| `frozenPercent` | `frozen / allocated * 100` (0 if allocated = 0) |
| `totalAvailableTokens` | Allocated minus frozen |
| `sourceBreakdown[].source` | Code from the sources catalog |
| `sourceBreakdown[].totalTokens` | Sum attributed to that source |

**Pie mapping (FE):** liquid allocated = `allocated − frozen`; segments = liquid / frozen / unallocated (zeros omitted).

---

### 2) `GET /admin/twin/sources` — new

Catalog for the allocations **source filter** (and labels on charts/tables).

```json
{
  "items": [
    { "code": "mission_reward", "label": "پاداش مأموریت" },
    { "code": "commission_reward", "label": "کمیسیون شبکه" },
    { "code": "registration", "label": "ثبت‌نام" },
    { "code": "adjustment", "label": "تعدیل سیستمی" },
    { "code": "mint", "label": "صدور" },
    { "code": "pool_deposit", "label": "استخر" }
  ]
}
```

| Field | Rule |
|-------|------|
| `items[].code` | Stable snake_case; same space as `sourceBreakdown` / allocations `source` query |
| `items[].label` | FA display string for admin UI |

Known codes today: `mission_reward` \| `commission_reward` \| `registration` \| `adjustment` \| `mint` \| `pool_deposit`.

Adding a code here shows it in the filter; overview bars still need ledger attribution for that source.

---

### 3) `GET /admin/twin/allocations` — extend query

User holdings / allocation ledger (paginated).

| Query | Meaning |
|-------|---------|
| `page`, `pageSize` | Pagination (0-based page) |
| `search` | Prefer **mobile** match (name optional) |
| `source` | Optional exact source `code` from `/sources` |

```json
{
  "data": [
    {
      "id": "row-uuid",
      "userId": "user-uuid",
      "fullName": "…",
      "mobile": "09…",
      "totalTokens": 1200,
      "availableTokens": 1000,
      "frozenTokens": 200,
      "frozenPercent": 16.7,
      "primarySource": "mission_reward",
      "lastAllocationAt": "2026-11-14T12:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 0,
  "pageSize": 20,
  "pageCount": 1
}
```

---

### 4) `GET /admin/twin/supply-adjustments` — new (ورودی‌های خزانه)

Internal **inflows** log (not a general change log — amounts are always positive inflows).

Query: `page`, `pageSize`

```json
{
  "data": [
    {
      "id": "uuid",
      "amount": 1000,
      "approxValueRial": 25524000,
      "effectiveDate": "1403/08/24",
      "createdAt": "2026-11-14T15:30:00.000Z",
      "createdByName": "علی رضایی",
      "createdByUserId": "admin-uuid",
      "note": "optional"
    }
  ],
  "total": 1,
  "page": 0,
  "pageSize": 10,
  "pageCount": 1
}
```

| Field | Rule |
|-------|------|
| `amount` | Always **> 0** (inflow) |
| `approxValueRial` | Snapshot `amount * tokenPriceRial` at write time |
| `effectiveDate` | Jalali `YYYY/MM/DD` or ISO date — FE sends Jalali |
| `createdByName` | Required for admin audit UI |

---

### 5) `POST /admin/twin/supply-adjustments` — new (**add only**)

Increase **unallocated** treasury balance. **Negative amounts are not allowed.**

Request:

```json
{
  "amount": 1000,
  "effectiveDate": "1403/08/24",
  "note": "optional"
}
```

| Rule | Detail |
|------|--------|
| `amount` | Must be a **positive** number (`> 0`). Reject `≤ 0` → `400` |
| `effectiveDate` | Required |
| Effect | `unallocatedTokens += amount` (and `totalTokens` rises accordingly) |
| Snapshot | Persist `approxValueRial = amount * tokenPriceRial` and actor `createdByName` |

Response:

```json
{
  "ok": true,
  "entry": { /* same as inflows log row */ },
  "overview": { /* full overview DTO after change */ }
}
```

> Earlier drafts allowed negative adjustments + `409 INSUFFICIENT_UNALLOCATED`. **That path is cancelled.** Treasury UI/API is add-only.

---

## FE ↔ BE map

| FE | Consumes |
|----|----------|
| Overview price card | `overview.tokenPriceRial`, `tokenPriceChangePercent24h` |
| Composition pie + stats | `allocatedTokens`, `unallocatedTokens`, `totalFrozenTokens` |
| Treasury share % + alert | FE: `unallocated / total * 100`; alert if `< 15` (`TWIN_TREASURY_LOW_SHARE_PERCENT`) |
| Source bar chart | `overview.sourceBreakdown` + labels from `/sources` (or i18n fallback) |
| Allocations filter | `GET /sources` → options; `GET /allocations?source=` |
| Treasury form | `POST /supply-adjustments` (`amount > 0`) |
| ورودی‌های خزانه table | `GET /supply-adjustments` |

---

## Not needed / out of scope for this page

| Item | Note |
|------|------|
| Decrease / negative supply adjustment | Product: treasury **add only** |
| Separate price-history API | `/admin/twin/price` is FE coming-soon only |
| Standalone totalTokens-only card | Overview still returns `totalTokens`; UI leads with allocated / unallocated |
| BE low-treasury threshold field | Optional later; FE threshold is enough for now |
| Changing allocations row identity | Keep current row DTO |

---

## Acceptance (club BE)

- [ ] Overview returns allocated / unallocated / frozen + `sourceBreakdown` with invariants above
- [ ] `GET /admin/twin/sources` returns catalog; codes align with breakdown + allocations filter
- [ ] Allocations support `search` (mobile) + `source`
- [ ] `POST /supply-adjustments` accepts **only** `amount > 0`; persists inflow + `createdByName` + `approxValueRial`
- [ ] `GET /supply-adjustments` lists inflows for «ورودی‌های خزانه»

---

## FE pointers

- Types: `AdminTwinOverviewResponse`, `AdminTwinSourcesResponse`, `AdminTwinSupplyAdjustment*`
- Paths: `ENDPOINTS.ADMIN.TWIN.OVERVIEW` \| `SOURCES` \| `ALLOCATIONS` \| `SUPPLY_ADJUSTMENTS`
- Routes: `ROUTES.ADMIN.TWIN` \| `TWIN_TREASURY` \| `TWIN_PRICE`
- Alert helper: `novin-club/src/lib/admin/twin-treasury.ts`
- UI: `TwinPageContent`, `TreasuryPageContent`, `TwinCompositionCard`
- Inbox: `novin-club-work/backend-inbox.md` packet **K**
- Repo copy (develop): `novin-club/docs/admin-twin-token-api.md`
