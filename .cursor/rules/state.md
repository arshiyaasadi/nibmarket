# State Management Rules

## تقسیم‌بندی state

| نوع | ابزار | موقعیت |
|-----|-------|---------|
| Server state (API data) | `useQuery` / `useMutation` | `features/*/queries.ts` |
| Client state (UI) | Zustand slices | `store/slices/` |
| Local state | `useState` | داخل component |

**هرگز** server state را در Zustand ذخیره نکنید.

## Zustand Slices

```
store/slices/auth.slice.ts   ← token، role، userId، fullName
store/slices/ui.slice.ts     ← sidebarOpen، activeModal
store/hooks/use-auth.ts      ← useIsAuthenticated، useAuthActions، useCanAccess
store/hooks/use-ui.ts        ← useSidebarOpen، useActiveModal، useUiActions
```

همیشه selector hook استفاده کنید — نه کل store:

```ts
// ✅ درست — فقط re-render می‌کند اگر token تغییر کند
const isAuth = useIsAuthenticated();

// ❌ اشتباه — هر تغییری در store re-render می‌دهد
const { token } = useAuthSlice();
```

## Query Hooks

موقعیت query hooks: **`features/{feature}/queries.ts`** — نه در `store/hooks/`

```ts
// src/features/dashboard/queries.ts
export function useDashboardWallet() {
  return useQuery({
    queryKey: ["dashboard", "wallet"],
    queryFn: () => DashboardService.getWallet(),
    staleTime: 60_000,          // ← حداقل 60 ثانیه برای data های پرکاربرد
  });
}
```

### staleTime پیشنهادی

| نوع داده | staleTime |
|----------|-----------|
| داده‌های real-time (notifications) | 30_000 |
| داده‌های dashboard، گزارش‌ها | 60_000 |
| leaderboard، شبکه | 120_000 |
| داده‌های ثابت (funds، missions) | 300_000 |

## Mutation

```ts
export function useSendInvite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => NetworkService.sendInvite(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["network"] }),
    onError: (err) => handleApiError(err),
  });
}
```

## QueryKey Convention

```ts
["feature", "sub-resource"]          // list
["feature", "sub-resource", id]      // single item
["feature", "sub-resource", filters] // filtered list
```
