import { prisma } from "@/lib/db/prisma";
import {
  decimalToNumber,
  getFullName,
  mapSubsetDepositTransaction,
} from "@/types/mappers";
import type {
  CommissionLevelRule,
  SubsetDeposits,
  SubsetDepositStatusFilter,
  SubsetDepositTransactionPage,
} from "@/types/mlm";

const ACTIVE_STATUSES: ("calculated" | "credited")[] = ["calculated", "credited"];
const PAGE_SIZE = 10;

function dayStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function monthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function getSubsetDeposits(userId: string): Promise<SubsetDeposits> {
  const now = new Date();
  const todayStart = dayStart(now);
  const thisMonthStart = monthStart(now);

  const [activeSubsets, entries] = await Promise.all([
    prisma.network_closure.count({
      where: { ancestor_id: userId, depth: { gt: 0 } },
    }),
    prisma.commission_entries.findMany({
      where: {
        beneficiary_user_id: userId,
        status: { in: ACTIVE_STATUSES },
      },
      select: {
        commission_amount_twin: true,
        created_at: true,
        status: true,
      },
    }),
  ]);

  const total = entries.reduce((sum, entry) => sum + decimalToNumber(entry.commission_amount_twin), 0);
  const today = entries
    .filter((entry) => entry.created_at >= todayStart)
    .reduce((sum, entry) => sum + decimalToNumber(entry.commission_amount_twin), 0);
  const thisMonth = entries
    .filter((entry) => entry.created_at >= thisMonthStart)
    .reduce((sum, entry) => sum + decimalToNumber(entry.commission_amount_twin), 0);
  const pendingAmount = entries
    .filter((entry) => entry.status === "calculated")
    .reduce((sum, entry) => sum + decimalToNumber(entry.commission_amount_twin), 0);

  return {
    today,
    thisMonth,
    total,
    activeSubsets,
    pendingAmount,
  };
}

export async function getSubsetDepositTransactions(
  userId: string,
  params: { page?: number; status?: SubsetDepositStatusFilter },
): Promise<SubsetDepositTransactionPage> {
  const page = Math.max(params.page ?? 1, 1);
  const status = params.status ?? "all";
  const where = {
    beneficiary_user_id: userId,
    status: status === "all" ? { in: ACTIVE_STATUSES } : status,
  };

  const [total, entries] = await Promise.all([
    prisma.commission_entries.count({ where }),
    prisma.commission_entries.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
  ]);

  const sourceUserIds = [...new Set(entries.map((entry) => entry.source_user_id))];
  const sedimentSourceIds = [...new Set(entries.map((entry) => entry.sediment_source_id))];

  const [profiles, sedimentSources] = await Promise.all([
    sourceUserIds.length > 0
      ? prisma.user_profiles.findMany({ where: { user_id: { in: sourceUserIds } } })
      : [],
    sedimentSourceIds.length > 0
      ? prisma.sediment_sources.findMany({ where: { id: { in: sedimentSourceIds } } })
      : [],
  ]);

  const profileByUserId = new Map(profiles.map((profile) => [profile.user_id, profile]));
  const sedimentById = new Map(sedimentSources.map((source) => [source.id, source]));
  const marketTxIds = [
    ...new Set(sedimentSources.map((source) => source.nib_market_transaction_id)),
  ];
  const marketTransactions = marketTxIds.length > 0
    ? await prisma.nib_market_transactions.findMany({ where: { id: { in: marketTxIds } } })
    : [];
  const marketTxById = new Map(marketTransactions.map((tx) => [tx.id, tx]));

  return {
    items: entries.map((entry) => {
      const sediment = sedimentById.get(entry.sediment_source_id);
      const marketTx = sediment ? marketTxById.get(sediment.nib_market_transaction_id) : undefined;

      return mapSubsetDepositTransaction({
        ...entry,
        sourceUserName: getFullName(profileByUserId.get(entry.source_user_id)),
        externalTxId: marketTx?.external_tx_id,
        fundId: marketTx?.fund_id,
      });
    }),
    hasMore: page * PAGE_SIZE < total,
    total,
  };
}

export async function getCommissionLevelRules(): Promise<CommissionLevelRule[]> {
  const rules = await prisma.commission_rules.findMany({
    where: { active: true },
    orderBy: { level: "asc" },
    select: {
      level: true,
      rate_percent: true,
      name: true,
    },
  });

  return rules.map((rule) => ({
    level: rule.level,
    ratePercent: decimalToNumber(rule.rate_percent),
    name: rule.name,
  }));
}
