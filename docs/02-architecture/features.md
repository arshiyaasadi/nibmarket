# Features pattern

Each domain feature lives under `src/features/{name}/`:

```
src/features/{feature}/
├── service.ts   ← apiClient + ENDPOINTS (no hardcoded paths)
└── queries.ts   ← React Query hooks
```

## service.ts

```ts
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { WalletSummary } from "@/types/mlm";

export const DashboardService = {
  getWallet: (): Promise<WalletSummary> =>
    apiClient.get(ENDPOINTS.DASHBOARD.WALLET),
};
```

## queries.ts

```ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "./service";

export function useDashboardWallet() {
  return useQuery({
    queryKey: ["dashboard", "wallet"],
    queryFn: () => DashboardService.getWallet(),
    staleTime: 60_000,
  });
}
```

## Current features

| Feature folder | Role |
|----------------|------|
| `dashboard` | Home widgets, rewards, referral, missions list helpers |
| `missions` | Section lists (promotion / onboarding / marketing), badges, activity, complete |
| `leads` | Landing registration-link (`POST /leads/registration-link`) |
| `network` | Subsets, tree, invite, quota (`canInvite`), templates |
| `leaderboard` | Pool, history, boards, honors |
| `wallet` | Summary, transactions, token price |
| `subset-deposits` | Commission summary + transactions |
| `reports` | Income / subsets / capital |
| `capital` | Funds |
| `notifications` | Inbox + login activity |
| `admin-system-messages` | Admin system messages |
| (admin pages) | Often call admin endpoints via local feature or page services — types in `admin.ts` |

## Adding a feature

1. Add DTOs in `src/types/mlm.ts` or `admin.ts` (JSDoc).
2. Add paths in `src/lib/api/endpoints.ts`.
3. Register BFF handler in `route-registry.ts` (and `LOCAL_ONLY` if BE is not ready).
4. Mock repository under `src/lib/mock/` when UI-dev needs data.
5. `features/{name}/service.ts` + `queries.ts`.
6. Messages under `src/resources/messages/fa/`.
7. If club BE must change: update `novin-club-work/backend-inbox.md` in the same PR.
