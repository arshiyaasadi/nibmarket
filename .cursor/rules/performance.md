# Performance Rules

## Code Splitting

```ts
// سنگین‌ترها را dynamic import کنید:
const NetworkTree = dynamic(() => import("@/components/NetworkTree"), { ssr: false });
const ReportChart = dynamic(() => import("@/components/ReportChart"), { ssr: false });
```

موارد الزامی برای `dynamic()`:
- chart components
- tree view (شبکه MLM)
- modal‌های سنگین با محتوای خاص
- هر component بالای ~50KB

## تصاویر

```tsx
// ✅ درست
import Image from "next/image";
<Image src="/logo.png" alt="Nib Club" width={120} height={40} />

// ❌ اشتباه
<img src="/logo.png" alt="..." />
```

`next.config.mjs`:
```js
images: { formats: ["image/avif", "image/webp"] }
```

## Memoization

```tsx
// List items در جداول بزرگ
const MemoizedRow = React.memo(TableRow);

// Sort/filter روی آرایه‌های بزرگ
const sorted = useMemo(() => [...items].sort(...), [items]);
```

**نکته:** React.memo و useMemo را بی‌دلیل اضافه نکنید — فقط وقتی profiling نشان داد.

## Server vs Client Components

```
Server Component (default):
  ✓ صفحاتی که فقط داده نمایش می‌دهند
  ✓ layout ها و wrapper ها
  ✗ نه برای onClick، useState، useEffect

Client Component ("use client"):
  ✓ فرم‌ها، interactive widgets
  ✓ هر جا که state یا event handler دارد
```

## React Query — staleTime

داده‌های پرکاربرد باید `staleTime` حداقل `60_000` داشته باشند تا request تکراری نزنند:

```ts
useQuery({ staleTime: 60_000 })   // dashboard، reports
useQuery({ staleTime: 300_000 })  // funds، missions (تغییر نمی‌کنند)
```

## Icon Library

```js
// next.config.mjs — از tree-shaking بهتر مطمئن می‌شود
experimental: {
  optimizePackageImports: ["lucide-react"],
}
```

## Bundle Size

- از barrel imports بی‌رویه جلوگیری کنید — از path مستقیم import کنید
- `tailwind.config.ts` content فقط `src/**/*.{ts,tsx}` — نه تمام پروژه
