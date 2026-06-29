# Types

منبع دیتابیس: `../shared/types/` و `shared/database/schema.sql`

منبع DTO فرانت: `src/types/mlm.ts`

قانون: DB entity و API DTO یکی نیستند. داده‌ها از Prisma row به DTOهای UI-friendly در `src/types/mappers.ts` تبدیل می‌شوند.

---

## Domain Types (mlm.ts)

### Auth

```ts
type UserRole = "client" | "manager" | "admin"

interface User {
  id: string;
  mobile: string;
  email: string;
  firstName: string; lastName: string; fullName: string;
  role: UserRole;
  balance: number;    // TWIN tokens
  level: number;
  referralCode: string;
  inviteCode: string;
}
```

### Wallet / Token

```ts
interface WalletSummary {
  totalTokens: number;
  frozenTokens: number;
  availableTokens: number;
  pendingTokens: number;
}

interface WalletTransaction {
  id: string; date: string; type: TokenTxType;
  description: string; amount: number;
  status: TxStatus;
}

interface TokenSummary {
  title: string; stats: string; trendNumber: string;
  trend: "positive" | "negative"; color: string; icon: string;
}
```

### Network

```ts
interface NetworkSubset {
  id: string; firstName: string; lastName: string; fullName: string;
  level: number; joinDate: string; subMembersCount: number;
  leaderboardRank?: number; directParentUserId?: number;
}

interface ReferrerInfo { id: string; fullName: string; level: number; inviteCode: string; }

interface SendInviteRequest {
  firstName: string; lastName: string; mobile: string;
  fundId: string; message?: string;
}
```

### Leaderboard

```ts
interface LeaderboardEntry {
  rank: number; userId: string; fullName: string;
  tokens: number; period: string; isSelf?: boolean;
}

interface PoolBalance { totalPool: number; userShare: number; sharePercent: number; }

interface HonorItem { id: number; title: string; description: string; achievedAt: string; }

interface Mission {
  id: number; code: string; title: string;
  completed: boolean; reward: string;
}
```

### Capital / Funds

```ts
interface Fund {
  id: number; name: string;
  minAmount: number; maxAmount: number;
  returnRate: number; term: number;
}

interface CapitalDepositStats {
  totalDeposited: number; activeDeposits: number;
  totalReturn: number; pendingReturn: number;
}
```

### Notifications

```ts
type NotificationType = "system" | "network" | "promotion"

interface Notification {
  id: number; type: NotificationType; title: string;
  body: string; createdAt: string; isRead: boolean;
}

interface LoginActivity {
  id: number; ip: string; device: string; location?: string;
  createdAt: string; status: "success" | "failed";
}
```

### Reports

```ts
interface IncomeTransaction {
  id: number; year: number; month: number;
  type: "mission" | "referral" | "retention";
  amount: number; description: string;
}
```

### Utility

```ts
interface Paginated<T> { items: T[]; total: number; page: number; limit: number; }
```

---

## API Types (api.ts)

```ts
class ApiException extends Error {
  constructor(public statusCode: number, message: string) { ... }
}

interface ApiError { error: string; message?: string; statusCode?: number; }
interface ApiSuccess<T> { data: T; message?: string; }
type ApiResult<T> = ApiSuccess<T> | ApiError;
```

---

## قوانین

- هر entity دیتابیس → `shared/types/entities`
- هر DTO مورد نیاز UI → `src/types/mlm.ts`
- هر تبدیل Prisma → UI → `src/types/mappers.ts`
- هر input عددی/موبایل/OTP/search قبل از validation یا ارسال به API باید با `src/lib/normalization/digits.ts` نرمال شود تا اعداد فارسی/عربی به انگلیسی تبدیل شوند
- هرگز type را داخل feature یا component تعریف نکنید (اگر shared باشد)
- `UserRole` سه مقدار دارد: `client | manager | admin`
- `id`ها در فرانت `string` هستند چون دیتابیس UUID دارد
