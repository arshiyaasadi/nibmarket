# Backend: Marketing Missions (Mehr / mlm-15)

English handoff for club BE. Frontend already ships UI + temporary merge overlay until these are seeded and fields are returned by the live API.

**FE sources of truth**

| What | Path |
|------|------|
| Seed list (codes, titles, rewards) | `src/resources/data/mehr-missions.ts` |
| Categories / recurrence / step order | `src/lib/missions/categories.ts` |
| Type contract | `src/types/mlm.ts` → `MissionDef` |
| User list merge overlay | `mergeMehrUserMissions` in `mehr-missions.ts` |
| Admin list merge overlay | `mergeMehrAdminMissions` in `mehr-missions.ts` |
| Catalog JSON (copy for BE seed) | `docs/missions-catalog.json` |
| Share inbox (primary handoff) | `../novin-club-work/backend-inbox.md` |

**Services / endpoints used by FE**

| Endpoint | FE usage | Change needed |
|----------|----------|---------------|
| `GET /api/v2/missions/sections/promotion` | ماموریت پروموشن (3 cards) | `{ items: MissionDef[] }` for promotion codes |
| `GET /api/v2/missions/sections/onboarding` | شروع کار accordion | `{ items: MissionDef[] }` |
| `GET /api/v2/missions/sections/marketing` | بازاریابی accordion | `{ items: MissionDef[] }` |
| `GET /api/v2/missions/sections/badges` | نشان بازاریابی | `{ items: MarketingBadgeItem[] }` (FE mocks until live) |
| `POST /api/v2/missions/complete` | Course level-1 visit | `{ code }` → complete + reward |
| `GET /api/v2/missions/list` | Legacy / admin / merge fallback | Full Mehr catalog + optional progress/boost fields |
| `GET /api/v2/dashboard/missions` | Prefer same numeric `MissionDef` shape | Align if still `{ reward: string }` |
| `GET /api/v2/missions/activity` | Activity table | Unchanged shape OK |
| `GET /api/v2/admin/missions/list` | Admin table | Same codes |
| `PATCH /api/v2/admin/missions/:id/status` | Pause/resume | Unchanged |

Proxy path: BFF → `backend-api-service.proxyRequestToBackend` → club BE `/api/v2/...`.  
Until section routes exist on BE, BFF serves them locally (merge live list + seed). See inbox.

---

## 1. Categories (FE display grouping)

FE groups by `code` (not by BE category field). Section APIs use these ids:

| `categoryId` | Persian label | Layout | Codes |
|--------------|---------------|--------|-------|
| `promotion` | ماموریت پروموشن | promotion cards | `daily_login`, `new_referral`, `monthly_referrals_3` |
| `onboarding` | شروع کار | staged | `registration`, `identity_verification`, `first_fund_purchase` |
| `marketing` | بازاریابی | staged | `training_level_1`, `first_referral`, `subset_aum_200m`, `subset_aum_500m`, `subset_aum_1_2b` |
| `badges` | نشان‌ها | badge grid | `direct_subsets_10`, `subsets_high_aum_1_5b`, `network_all_funds`, `leader_5x3`, `badge_safir_novin` |

Dashboard widget shows: daily-login week strip + **one next incomplete** from `onboarding` and **one** from `marketing` side by side.

---

## 2. Base `MissionDef` (already expected)

```json
{
  "id": "uuid",
  "code": "registration",
  "title": "ثبت‌نام",
  "description": "ثبت‌نام در سامانه (یک‌بار)",
  "reward": 10,
  "missionType": "registration",
  "status": "active",
  "completed": false,
  "completedAt": null
}
```

| Field | Required | Notes |
|-------|----------|-------|
| `id` | yes | Stable UUID |
| `code` | yes | Snake_case codes in catalog (aliases listed below) |
| `title` | yes | Persian |
| `description` | optional | Shown inline for fund purchase condition |
| `reward` | yes | Number (تنوین), not a formatted string |
| `missionType` | yes | `registration` \| `purchase` \| `referral_count` \| `fund_issue` \| `custom` |
| `status` | yes | User list should only include `active` |
| `completed` | yes | Per current user |
| `completedAt` | optional | ISO when completed |

---

## 3. Optional fields FE already consumes (add when available)

These are **optional** for backward compatibility. When missing, FE falls back to defaults / empty UI.

### Campaign boost (safe when absent)

| Field | Type | When |
|-------|------|------|
| `rewardBoostPercent` | number | Active campaign boost % |
| `boostedReward` | number | Precomputed effective reward |
| `boostEndsAt` | string (ISO) | Optional expiry |
| `doubleBonus` | boolean | Legacy +100% |

### Recurring progress

| Field | Type | Used by |
|-------|------|---------|
| `progressCurrent` | number | Daily / monthly progress |
| `progressTarget` | number | Default: daily `1`, monthly referrals `3` |
| `periodEndsAt` | string (ISO) | End of day / month |

### Daily login week strip

| Field | Type | Notes |
|-------|------|-------|
| `loginClaimedDates` | `string[]` | Local calendar dates `YYYY-MM-DD` claimed this week (Sat–Fri UI) |

If omitted and `completed === true` today, FE only marks **today**.

### Per-event referral card

| Field | Type | Notes |
|-------|------|-------|
| `referralCount` | number | Lifetime / period invite count for display |
| `referralTokensEarned` | number | Tokens earned from that mission so far |

---

## 4. Per-mission data matrix

| code | Extra fields needed | Completion rule (product) |
|------|---------------------|---------------------------|
| `registration` | — | User registered |
| `identity_verification` | — | KYC verified |
| `first_fund_purchase` | `description` = min AUM text | First fund buy, ≥ 10M AUM |
| `training_level_1` | — | Level-1 training done |
| `first_referral` | — | First downline only |
| `subset_aum_200m` / `_500m` / `_1_2b` | optional progress | Network AUM thresholds |
| `daily_login` | `loginClaimedDates`, `progressCurrent/Target` | Only if downline has assets |
| `new_referral` | `referralCount`, `referralTokensEarned` | Each new invite |
| `monthly_referrals_3` | `progressCurrent`, `progressTarget=3`, `periodEndsAt` | 3 invites / calendar month |
| Badge codes | `completed` + `completedAt` | Unlock marketing badges |

**Code aliases FE already accepts** (if BE uses older codes):

| Canonical | Also accepted |
|-----------|---------------|
| `new_referral` | `invite_new` |
| `monthly_referrals_3` | `referral_3`, `direct_subsets_3` |

---

## 5. Temporary FE overlay (remove after BE seed)

`MEHR_MISSIONS_PREVIEW_ENABLED` in `mehr-missions.ts` appends any missing Mehr codes to user + admin lists.

**When club BE has seeded all 16 codes:** tell FE to set `MEHR_MISSIONS_PREVIEW_ENABLED = false` (or remove the merge).

Until then, preview rows use ids `mehr-preview-{code}` and `completed: false`.

---

## 6. Recent FE-only work that needs BE support

Shipped on FE without BE changes yet:

1. **Full Mehr catalog UI** — categories, staged steps, promotion cards, badges section/modal; three section list APIs.
2. **Dashboard missions widget** — daily-login Sat–Fri week + next step from شروع کار + بازاریابی.
3. **Optional progress / login / referral fields** — UI ready; needs API fields in §3.
4. **Boost-safe rendering** — only shows boost when fields present.
5. **Admin list preview merge** — same seed until admin catalog is complete.
6. **Fund purchase condition** — shown from `description` (no tooltip); BE should keep that text on the mission.
7. **Invite copy UI** — FE-only layout (no API change).

---

## 7. Suggested BE checklist

- [ ] Seed all missions from `docs/missions-catalog.json`
- [ ] Ensure `GET /missions/list` returns numeric `reward` + `completed` per user
- [ ] Implement verification jobs for each `missionType` / custom rule
- [ ] Add optional fields in §3 (progressively OK)
- [ ] Confirm `daily_login` eligibility (downline AUM) server-side
- [ ] Notify FE to disable Mehr preview overlay after seed
