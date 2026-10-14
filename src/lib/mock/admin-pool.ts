import type {
  AdminPoolOverviewResponse,
  AdminPoolParticipantRow,
  AdminPoolParticipantsResponse,
  AdminPoolPeriodRow,
  AdminPoolPeriodsResponse,
  AdminPoolTransactionRow,
  AdminPoolTransactionStatus,
  AdminPoolTransactionTypeFilter,
  AdminPoolTransactionsResponse,
} from "@/types/admin";
import { jalaliPartsFromDate } from "@/lib/datetime/jalali";

const TOTAL_POOL = 50_000;

const MOCK_POOL_PARTICIPANTS: Omit<
  AdminPoolParticipantRow,
  "rank" | "sharePercent" | "estimatedReward"
>[] = [
  { userId: "u2", fullName: "علی رضایی", mobile: "09121111111", tokens: 9800, subsetCount: 42 },
  { userId: "u3", fullName: "مریم احمدی", mobile: "09122222222", tokens: 7600, subsetCount: 31 },
  { userId: "u4", fullName: "حسین کریمی", mobile: "09123333333", tokens: 6400, subsetCount: 28 },
  { userId: "u5", fullName: "سارا محمدی", mobile: "09124444444", tokens: 5200, subsetCount: 19 },
  { userId: "u6", fullName: "رضا نوری", mobile: "09125555555", tokens: 4100, subsetCount: 15 },
  { userId: "u7", fullName: "نیلوفر حسینی", mobile: "09126666666", tokens: 3300, subsetCount: 12 },
  { userId: "u8", fullName: "امیر صادقی", mobile: "09127777777", tokens: 2700, subsetCount: 9 },
  { userId: "u9", fullName: "فاطمه اکبری", mobile: "09128888888", tokens: 2100, subsetCount: 7 },
  { userId: "u10", fullName: "کاربر تست", mobile: "09123456789", tokens: 1250, subsetCount: 4 },
];

const MOCK_POOL_PERIODS: AdminPoolPeriodRow[] = [
  {
    id: "period-1404-11",
    title: "آبان ۱۴۰۴",
    startDate: "2025-11-01T00:00:00.000Z",
    endDate: "2025-11-30T23:59:59.999Z",
    totalPool: 42_000,
    winnerName: "علی رضایی",
    participantCount: 118,
    distributedAmount: 42_000,
  },
  {
    id: "period-1404-10",
    title: "مهر ۱۴۰۴",
    startDate: "2025-10-01T00:00:00.000Z",
    endDate: "2025-10-31T23:59:59.999Z",
    totalPool: 38_500,
    winnerName: "مریم احمدی",
    participantCount: 104,
    distributedAmount: 38_500,
  },
  {
    id: "period-1404-09",
    title: "شهریور ۱۴۰۴",
    startDate: "2025-09-01T00:00:00.000Z",
    endDate: "2025-09-30T23:59:59.999Z",
    totalPool: 35_200,
    winnerName: "حسین کریمی",
    participantCount: 96,
    distributedAmount: 35_200,
  },
];

function getCurrentPeriodDates() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return { startDate, endDate };
}

function enrichParticipant(
  row: (typeof MOCK_POOL_PARTICIPANTS)[number],
  rank: number,
  topWinners: number,
  totalPool: number,
): AdminPoolParticipantRow {
  const sharePercent = totalPool > 0 ? Number(((row.tokens / totalPool) * 100).toFixed(2)) : 0;
  const winnerPool = totalPool * 0.7;
  const estimatedReward =
    rank <= topWinners ? Math.floor((row.tokens / totalPool) * winnerPool) : 0;

  return {
    ...row,
    rank,
    sharePercent,
    estimatedReward,
  };
}

export async function getAdminPoolOverview(): Promise<AdminPoolOverviewResponse> {
  const { startDate, endDate } = getCurrentPeriodDates();
  const dailyChange = 1_250;
  const dailyChangePercent =
    TOTAL_POOL > 0 ? Number(((dailyChange / TOTAL_POOL) * 100).toFixed(2)) : 0;

  return {
    totalPool: TOTAL_POOL,
    dailyChange,
    dailyChangePercent,
    participantCount: MOCK_POOL_PARTICIPANTS.length,
    topWinners: 5,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    contextTitle: "current",
    distributedThisPeriod: 12_400,
    pendingDistribution: TOTAL_POOL - 12_400,
  };
}

export async function listAdminPoolParticipants(params: {
  page: number;
  pageSize: number;
  search: string;
}): Promise<AdminPoolParticipantsResponse> {
  const overview = await getAdminPoolOverview();
  let rows = [...MOCK_POOL_PARTICIPANTS]
    .sort((a, b) => b.tokens - a.tokens)
    .map((row, index) =>
      enrichParticipant(row, index + 1, overview.topWinners, overview.totalPool),
    );

  if (params.search) {
    const q = params.search.trim();
    rows = rows.filter(
      (row) => row.fullName.includes(q) || row.mobile.includes(q) || row.userId.includes(q),
    );
  }

  const total = rows.length;
  const slice = rows.slice(params.page * params.pageSize, (params.page + 1) * params.pageSize);

  return {
    data: slice,
    total,
    page: params.page,
    pageSize: params.pageSize,
    pageCount: Math.ceil(total / params.pageSize) || 1,
  };
}

export async function listAdminPoolPeriods(params: {
  page: number;
  pageSize: number;
  search: string;
}): Promise<AdminPoolPeriodsResponse> {
  let rows = [...MOCK_POOL_PERIODS];

  if (params.search) {
    const q = params.search.trim();
    rows = rows.filter(
      (row) => row.title.includes(q) || row.winnerName.includes(q) || row.id.includes(q),
    );
  }

  const total = rows.length;
  const slice = rows.slice(params.page * params.pageSize, (params.page + 1) * params.pageSize);

  return {
    data: slice,
    total,
    page: params.page,
    pageSize: params.pageSize,
    pageCount: Math.ceil(total / params.pageSize) || 1,
  };
}

const TYPE_TO_STATUS: Record<
  Exclude<AdminPoolTransactionTypeFilter, "">,
  AdminPoolTransactionStatus
> = {
  burn: "burned",
  payout: "allocated",
  inflow: "deposited",
};

const MOCK_POOL_TRANSACTIONS: AdminPoolTransactionRow[] = [
  {
    id: "ptx-1",
    status: "deposited",
    amount: 2_500,
    userId: "u2",
    userName: "علی رضایی",
    userMobile: "09121111111",
    periodTitle: "آذر ۱۴۰۵",
    description: "واریز سهم رقابت به استخر",
    createdAt: "2026-11-28T10:15:00.000Z",
  },
  {
    id: "ptx-2",
    status: "burned",
    amount: 800,
    userId: "u3",
    userName: "مریم احمدی",
    userMobile: "09122222222",
    periodTitle: "آذر ۱۴۰۵",
    description: "سوزاندن تنوین برای ورود به استخر",
    createdAt: "2026-11-27T14:40:00.000Z",
  },
  {
    id: "ptx-3",
    status: "allocated",
    amount: 5_200,
    userId: "u2",
    userName: "علی رضایی",
    userMobile: "09121111111",
    periodTitle: "آبان ۱۴۰۴",
    description: "تخصیص پاداش برندگان دوره",
    createdAt: "2025-11-30T18:00:00.000Z",
  },
  {
    id: "ptx-4",
    status: "deposited",
    amount: 1_100,
    userId: "u5",
    userName: "سارا محمدی",
    userMobile: "09124444444",
    periodTitle: "آذر ۱۴۰۵",
    description: "واریز خودکار از مأموریت",
    createdAt: "2026-11-20T09:05:00.000Z",
  },
  {
    id: "ptx-5",
    status: "burned",
    amount: 350,
    userId: "u6",
    userName: "رضا نوری",
    userMobile: "09125555555",
    periodTitle: "آذر ۱۴۰۵",
    description: "سوزاندن کارمزد استخر",
    createdAt: "2026-11-18T11:22:00.000Z",
  },
  {
    id: "ptx-6",
    status: "allocated",
    amount: 3_100,
    userId: "u3",
    userName: "مریم احمدی",
    userMobile: "09122222222",
    periodTitle: "مهر ۱۴۰۴",
    description: "تخصیص پاداش رتبه ۲",
    createdAt: "2025-10-31T17:30:00.000Z",
  },
];

export async function listAdminPoolTransactions(params: {
  page: number;
  pageSize: number;
  search: string;
  type: AdminPoolTransactionTypeFilter;
  year?: number;
  month?: number;
}): Promise<AdminPoolTransactionsResponse> {
  let rows = [...MOCK_POOL_TRANSACTIONS];

  if (params.type) {
    const status = TYPE_TO_STATUS[params.type];
    rows = rows.filter((row) => row.status === status);
  }

  if (params.year != null || params.month != null) {
    rows = rows.filter((row) => {
      const parts = jalaliPartsFromDate(new Date(row.createdAt));
      if (params.year != null && parts.year !== params.year) return false;
      if (params.month != null && parts.month !== params.month) return false;
      return true;
    });
  }

  if (params.search) {
    const q = params.search.trim();
    rows = rows.filter(
      (row) =>
        row.userName.includes(q) ||
        row.userMobile.includes(q) ||
        row.description.includes(q) ||
        row.periodTitle.includes(q),
    );
  }

  const summary = {
    totalInflow: rows.filter((r) => r.status === "deposited").reduce((s, r) => s + r.amount, 0),
    totalBurned: rows.filter((r) => r.status === "burned").reduce((s, r) => s + r.amount, 0),
    totalAllocated: rows.filter((r) => r.status === "allocated").reduce((s, r) => s + r.amount, 0),
  };

  const total = rows.length;
  const slice = rows.slice(params.page * params.pageSize, (params.page + 1) * params.pageSize);

  return {
    data: slice,
    summary,
    total,
    page: params.page,
    pageSize: params.pageSize,
    pageCount: Math.ceil(total / params.pageSize) || 1,
  };
}
