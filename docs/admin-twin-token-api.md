# Admin «توکن تنوین» — API contract (club BE)

**Version:** 2026-11-14c (develop)  
**Base:** `/api/v2` · **Auth:** admin / manager  

FE mock BFF matches these shapes. Repo copy: `novin-club/docs/admin-twin-token-api.md`.  
Inbox: `novin-club-work/backend-inbox.md` packet **K**.

Internal id: `twin`. UI brand: **تنوین**.

---

## Surfaces

| Route | Uses |
|-------|------|
| `/admin/twin` | Price (toman), composition pie (current stock), period filter (Jalali), source bar chart, transactions table |
| `/admin/twin/treasury` | Composition pie + **add-only** treasury inflows |
| `/admin/twin/price` | Spot price history + **POST** new price (Toman) |

---

## Endpoints FE uses

### 1) `GET /admin/twin/sources`

**Single catalog** for every Twin transaction source. Codes are free-form strings (e.g. `daily_login`).

```json
{
  "items": [
    { "code": "daily_login", "label": "مأموریت ورود روزانه", "kind": "mission" },
    { "code": "commission", "label": "کمیسیون شبکه", "kind": "commission" },
    { "code": "registration", "label": "ثبت‌نام", "kind": "registration" }
  ]
}
```

| Field | Rule |
|-------|------|
| `code` | Stable string (snake_case) |
| `label` | FA display |
| `kind` | Optional: `mission` \| `commission` \| `registration` \| `pool` \| `treasury` \| `other` |

---

### 2) `GET /admin/twin/overview`

Current **stock** + period-scoped **source breakdown**.

**Query (Jalali, optional):** `year`, `month` — omit both for **all-time** breakdown.

```json
{
  "tokenPriceRial": 50000,
  "tokenPriceToman": 5000,
  "tokenPriceChangePercent24h": 0.71,
  "totalTokens": 63670,
  "allocatedTokens": 13670,
  "unallocatedTokens": 50000,
  "totalFrozenTokens": 1093,
  "frozenPercent": 8.0,
  "totalAvailableTokens": 12577,
  "period": { "year": null, "month": null },
  "sourceBreakdown": [
    { "source": "daily_login", "totalTokens": 3100 }
  ]
}
```

| Field | Rule |
|-------|------|
| `tokenPriceToman` / `tokenPriceRial` | Latest spot (admin registers **toman**) |
| Stock fields | **Always current** (`allocated + unallocated = total`; frozen ⊆ allocated) |
| `period` | Echo of Jalali filter; both null = all-time |
| `sourceBreakdown[].source` | Catalog `code` from `/sources` |

---

### 3) `GET /admin/twin/transactions`

Paginated ledger. Query: `page`, `pageSize`, `search` (mobile), `source`, optional Jalali `year`/`month`.

Row: `id`, `userId`, `fullName`, `mobile`, `amount`, `source`, `createdAt`, `note?`.

**Removed:** `GET /admin/twin/allocations`.

---

### 4) `GET` / `POST /admin/twin/supply-adjustments`

Treasury **inflows** (add-only). POST body: `{ amount > 0, effectiveDate, note? }` → `{ ok, entry, overview }`.

---

### 5) `GET` / `POST /admin/twin/token-prices`

Spot **price history** (Toman).

**GET** query: `page`, `pageSize`  
Row: `id`, `priceToman`, `changedAt`, `createdByName`, `createdByUserId?`, `note?`

**POST** body: `{ "priceToman": 5000, "note?": "…" }`  
Response: `{ "ok": true, "entry": {…}, "overview": {…} }`  
`priceToman ≤ 0` → `400`

---

## Acceptance

- [x] `/sources` catalog; codes are strings  
- [x] `/overview` includes `tokenPriceToman` + `tokenPriceRial`; period scopes breakdown  
- [x] `/transactions` replaces allocations  
- [x] Supply POST add-only  
- [x] Token-prices GET/POST (Toman)  

## FE pointers

- `ENDPOINTS.ADMIN.TWIN.*` — `OVERVIEW`, `SOURCES`, `TRANSACTIONS`, `SUPPLY_ADJUSTMENTS`, `TOKEN_PRICES`  
- Types: `AdminTwinOverviewResponse`, `AdminTwinTokenPrice*`  
- UI: `/admin/twin`, `/admin/twin/treasury`, `/admin/twin/price`  
