# Features Pattern

هر feature از دو فایل تشکیل می‌شود:

```
src/features/{feature}/
├── service.ts   ← API calls با apiClient
└── queries.ts   ← React Query hooks
```

---

## الگوی service.ts

```ts
// src/features/dashboard/service.ts
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { WalletSummary } from "@/types/mlm";

export const DashboardService = {
  getWallet: (): Promise<WalletSummary> =>
    apiClient.get(ENDPOINTS.DASHBOARD.WALLET),

  getRewards: (): Promise<TokenSummary[]> =>
    apiClient.get(ENDPOINTS.DASHBOARD.REWARDS),
};
```

## الگوی queries.ts

```ts
// src/features/dashboard/queries.ts
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

## Features موجود

| Feature | Query Hooks | Service Methods |
|---------|-------------|-----------------|
| **dashboard** | `useDashboardWallet`، `useDashboardRewards`، `useDashboardLeaderboard`، `useDashboardMissions` | getWallet، getRewards، getLeaderboard، getMissions |
| **capital** | `useCapitalStats`، `useCapitalFunds` | getStats، getFunds |
| **leaderboard** | `useLeaderboardPool`، `useLeaderboardCurrentMonth`، `useLeaderboardHonors`، `useLeaderboardMissions` | getPoolBalance، getCurrentMonth، getLastMonth، getMySubsets، getHonors، getMissions |
| **network** | `useNetworkSubsets`، `useNetworkReferrer`، `useSendInvite` | getSubsets، getReferrer، sendInvite، submitReferrer |
| **notifications** | `useNotifications`، `useLoginActivity` | getList، getActivity |
| **reports** | `useReportsWallet`، `useReportsIncome`، `useReportsSubsets` | getWallet، getIncome، getSubsets |

---

## Mutation با invalidation

```ts
export function useSendInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendInviteRequest) =>
      NetworkService.sendInvite(payload),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ["network"] }),
    onError: (err) =>
      handleApiError(err),
  });
}
```

---

## اضافه کردن Feature جدید

چک‌لیست برای feature جدید (`wallet` به‌عنوان مثال):

```
☐ src/types/mlm.ts              — type‌های جدید
☐ src/lib/api/endpoints.ts      — ENDPOINTS.WALLET.*
☐ src/lib/api/mock/handlers/    — wallet.mock.ts
☐ src/lib/api/mock/index.ts     — اضافه به ALL_HANDLERS
☐ src/features/wallet/service.ts— WalletService
☐ src/features/wallet/queries.ts— useWallet...
☐ src/resources/messages/fa/   — wallet.json
☐ src/resources/messages/fa/index.ts — import و export
```

---

## استفاده در Page

```tsx
// src/app/(panel)/dashboard/DashboardContent.tsx
"use client";
import { useDashboardWallet } from "@/features/dashboard/queries";
import { SpinnerPage, StatCard } from "@/components/ui";
import { useTranslations } from "next-intl";

export function DashboardContent() {
  const t = useTranslations("dashboard");
  const { data: wallet, isLoading } = useDashboardWallet();

  if (isLoading) return <SpinnerPage />;

  return (
    <div className="flex flex-col gap-org">
      <StatCard title={t("wallet.total")} value={wallet?.totalTokens ?? 0} />
    </div>
  );
}
```
