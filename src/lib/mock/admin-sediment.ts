import { ensureMockStore, getMockUsers } from "./store";
import type {
  AdminNibMarketAssetsResponse,
  AdminSedimentDepositRow,
  AdminSedimentDepositsResponse,
  AdminSedimentJobResponse,
  AdminSedimentOverviewResponse,
} from "@/types/admin";
import type { SubsetDepositStatus } from "@/types/mlm";

function isoHoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

const FUNDS: Record<string, string> = {
  sahami: "صندوق سهامی",
  lazord: "صندوق لازورد",
  atlas: "صندوق اطلس",
};

const NIB_ASSETS: Array<{
  id: string;
  userId: string;
  fundId: string;
  assetValueRial: number;
  profitRatePercent: number;
  syncedAt: string;
}> = [
  {
    id: "na-1",
    userId: "00000000-0000-4000-8000-000000000001",
    fundId: "sahami",
    assetValueRial: 850_000_000,
    profitRatePercent: 24,
    syncedAt: isoHoursAgo(1),
  },
  {
    id: "na-2",
    userId: "00000000-0000-4000-8000-000000000001",
    fundId: "lazord",
    assetValueRial: 320_000_000,
    profitRatePercent: 18,
    syncedAt: isoHoursAgo(1),
  },
  {
    id: "na-3",
    userId: "00000000-0000-4000-8000-000000000002",
    fundId: "sahami",
    assetValueRial: 540_000_000,
    profitRatePercent: 24,
    syncedAt: isoHoursAgo(2),
  },
  {
    id: "na-4",
    userId: "00000000-0000-4000-8000-000000000004",
    fundId: "atlas",
    assetValueRial: 210_000_000,
    profitRatePercent: 21,
    syncedAt: isoHoursAgo(3),
  },
  {
    id: "na-5",
    userId: "00000000-0000-4000-8000-000000000005",
    fundId: "lazord",
    assetValueRial: 175_000_000,
    profitRatePercent: 18,
    syncedAt: isoHoursAgo(4),
  },
  {
    id: "na-6",
    userId: "00000000-0000-4000-8000-000000000002",
    fundId: "atlas",
    assetValueRial: 95_000_000,
    profitRatePercent: 21,
    syncedAt: isoHoursAgo(5),
  },
];

const SEDIMENT_DEPOSITS: Array<{
  id: string;
  processedAt: string;
  beneficiaryUserId: string;
  sourceUserName: string;
  level: number;
  baseAmountRial: number;
  ratePercent: number;
  sedimentTwin: number;
  status: SubsetDepositStatus;
  fundId: string;
  externalTxId: string | null;
}> = [
  {
    id: "sd-a1",
    processedAt: isoHoursAgo(3),
    beneficiaryUserId: "00000000-0000-4000-8000-000000000001",
    sourceUserName: "امیر کاظمی",
    level: 1,
    baseAmountRial: 50_000_000,
    ratePercent: 5,
    sedimentTwin: 42,
    status: "credited",
    fundId: "sahami",
    externalTxId: "NIB-TX-88421",
  },
  {
    id: "sd-a2",
    processedAt: isoHoursAgo(5),
    beneficiaryUserId: "00000000-0000-4000-8000-000000000001",
    sourceUserName: "نگار موسوی",
    level: 1,
    baseAmountRial: 30_000_000,
    ratePercent: 5,
    sedimentTwin: 25,
    status: "credited",
    fundId: "lazord",
    externalTxId: "NIB-TX-88409",
  },
  {
    id: "sd-a3",
    processedAt: isoHoursAgo(8),
    beneficiaryUserId: "00000000-0000-4000-8000-000000000002",
    sourceUserName: "حامد جلیلی",
    level: 1,
    baseAmountRial: 40_000_000,
    ratePercent: 5,
    sedimentTwin: 33,
    status: "credited",
    fundId: "atlas",
    externalTxId: "NIB-TX-88390",
  },
  {
    id: "sd-a4",
    processedAt: isoHoursAgo(12),
    beneficiaryUserId: "00000000-0000-4000-8000-000000000001",
    sourceUserName: "بهرام حاجی هاشمی",
    level: 2,
    baseAmountRial: 20_000_000,
    ratePercent: 3,
    sedimentTwin: 10,
    status: "credited",
    fundId: "sahami",
    externalTxId: "NIB-TX-88355",
  },
  {
    id: "sd-a5",
    processedAt: isoHoursAgo(20),
    beneficiaryUserId: "00000000-0000-4000-8000-000000000004",
    sourceUserName: "پریسا مرادی",
    level: 1,
    baseAmountRial: 15_000_000,
    ratePercent: 5,
    sedimentTwin: 12,
    status: "calculated",
    fundId: "sahami",
    externalTxId: "NIB-TX-88301",
  },
  {
    id: "sd-a6",
    processedAt: isoHoursAgo(26),
    beneficiaryUserId: "00000000-0000-4000-8000-000000000002",
    sourceUserName: "کامران یوسفی",
    level: 2,
    baseAmountRial: 12_000_000,
    ratePercent: 3,
    sedimentTwin: 6,
    status: "credited",
    fundId: "lazord",
    externalTxId: "NIB-TX-88288",
  },
  {
    id: "sd-a7",
    processedAt: isoHoursAgo(30),
    beneficiaryUserId: "00000000-0000-4000-8000-000000000005",
    sourceUserName: "لیلا رستمی",
    level: 1,
    baseAmountRial: 8_000_000,
    ratePercent: 5,
    sedimentTwin: 7,
    status: "failed",
    fundId: "atlas",
    externalTxId: null,
  },
  {
    id: "sd-a8",
    processedAt: isoHoursAgo(48),
    beneficiaryUserId: "00000000-0000-4000-8000-000000000001",
    sourceUserName: "رضا نوری",
    level: 3,
    baseAmountRial: 10_000_000,
    ratePercent: 1,
    sedimentTwin: 2,
    status: "credited",
    fundId: "sahami",
    externalTxId: "NIB-TX-88120",
  },
  {
    id: "sd-a9",
    processedAt: isoHoursAgo(52),
    beneficiaryUserId: "00000000-0000-4000-8000-000000000004",
    sourceUserName: "فریده زینالیان",
    level: 2,
    baseAmountRial: 6_000_000,
    ratePercent: 3,
    sedimentTwin: 3,
    status: "reversed",
    fundId: "lazord",
    externalTxId: "NIB-TX-88099",
  },
  {
    id: "sd-a10",
    processedAt: isoHoursAgo(72),
    beneficiaryUserId: "00000000-0000-4000-8000-000000000002",
    sourceUserName: "امیر کاظمی",
    level: 1,
    baseAmountRial: 25_000_000,
    ratePercent: 5,
    sedimentTwin: 21,
    status: "credited",
    fundId: "sahami",
    externalTxId: "NIB-TX-87950",
  },
];

function userDisplay(userId: string) {
  const user = getMockUsers().get(userId);
  return {
    fullName: user ? `${user.firstName} ${user.lastName}`.trim() : "—",
    mobile: user?.mobile ?? "—",
  };
}

export async function getAdminSedimentOverview(): Promise<AdminSedimentOverviewResponse> {
  await ensureMockStore();
  const users = [...getMockUsers().values()];
  const linkedUsers = users.filter((u) => u.nibMarketLinked);
  const totalAssetValueRial = NIB_ASSETS.reduce((sum, a) => sum + a.assetValueRial, 0);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const monthStart = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

  const credited = SEDIMENT_DEPOSITS.filter((d) => d.status === "credited");
  const todaySedimentTwin = credited
    .filter((d) => new Date(d.processedAt) >= todayStart)
    .reduce((sum, d) => sum + d.sedimentTwin, 0);
  const monthSedimentTwin = credited
    .filter((d) => new Date(d.processedAt) >= monthStart)
    .reduce((sum, d) => sum + d.sedimentTwin, 0);
  const pendingSedimentTwin = SEDIMENT_DEPOSITS.filter((d) => d.status === "calculated").reduce(
    (sum, d) => sum + d.sedimentTwin,
    0,
  );

  return {
    totalAssetValueRial,
    linkedUsersCount: linkedUsers.length || users.filter((u) => u.status === "active").length,
    assetRecordsCount: NIB_ASSETS.length,
    todaySedimentTwin,
    monthSedimentTwin,
    pendingSedimentTwin,
  };
}

export async function getAdminSedimentJob(): Promise<AdminSedimentJobResponse> {
  const now = Date.now();
  const lastRunAt = new Date(now - 6 * 60 * 60 * 1000).toISOString();
  const lastSuccessAt = lastRunAt;
  const nextRunAt = new Date(now + 18 * 60 * 60 * 1000).toISOString();
  const todayCredited = SEDIMENT_DEPOSITS.filter(
    (d) => d.status === "credited" && new Date(d.processedAt).getTime() > now - 24 * 60 * 60 * 1000,
  );

  return {
    jobId: "job-nibmarket-sediment-distribution",
    jobName: "NibMarketSedimentDistributionJob",
    schedule: "0 6 * * *",
    status: "healthy",
    lastRunAt,
    lastSuccessAt,
    nextRunAt,
    processedAssets: NIB_ASSETS.length,
    distributedTwin: todayCredited.reduce((sum, d) => sum + d.sedimentTwin, 0),
    message: null,
  };
}

export async function listAdminNibMarketAssets(params: {
  page: number;
  pageSize: number;
  search: string;
}): Promise<AdminNibMarketAssetsResponse> {
  await ensureMockStore();
  let rows = NIB_ASSETS.map((asset) => {
    const user = userDisplay(asset.userId);
    return {
      id: asset.id,
      userId: asset.userId,
      fullName: user.fullName,
      mobile: user.mobile,
      fundId: asset.fundId,
      fundName: FUNDS[asset.fundId] ?? asset.fundId,
      assetValueRial: asset.assetValueRial,
      profitRatePercent: asset.profitRatePercent,
      syncedAt: asset.syncedAt,
    };
  });

  if (params.search) {
    const q = params.search.trim();
    rows = rows.filter(
      (row) =>
        row.fullName.includes(q) ||
        row.mobile.includes(q) ||
        row.fundName.includes(q) ||
        row.fundId.includes(q),
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

function toDepositRow(entry: (typeof SEDIMENT_DEPOSITS)[number]): AdminSedimentDepositRow {
  const beneficiary = userDisplay(entry.beneficiaryUserId);
  return {
    id: entry.id,
    processedAt: entry.processedAt,
    beneficiaryUserId: entry.beneficiaryUserId,
    beneficiaryName: beneficiary.fullName,
    beneficiaryMobile: beneficiary.mobile,
    sourceUserName: entry.sourceUserName,
    level: entry.level,
    baseAmountRial: entry.baseAmountRial,
    ratePercent: entry.ratePercent,
    sedimentTwin: entry.sedimentTwin,
    status: entry.status,
    fundId: entry.fundId,
    fundName: FUNDS[entry.fundId] ?? entry.fundId,
    externalTxId: entry.externalTxId,
  };
}

export async function listAdminSedimentDeposits(params: {
  page: number;
  pageSize: number;
  search: string;
  status: string;
}): Promise<AdminSedimentDepositsResponse> {
  await ensureMockStore();
  let rows = SEDIMENT_DEPOSITS.map(toDepositRow).sort(
    (a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime(),
  );

  if (params.status) {
    rows = rows.filter((row) => row.status === params.status);
  }

  if (params.search) {
    const q = params.search.trim();
    rows = rows.filter(
      (row) =>
        row.beneficiaryName.includes(q) ||
        row.beneficiaryMobile.includes(q) ||
        row.sourceUserName.includes(q) ||
        row.fundName.includes(q) ||
        (row.externalTxId?.includes(q) ?? false),
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
