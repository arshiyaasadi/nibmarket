import { formatDateTime } from "@/lib/utils";
import type {
  LeaderboardEntry,
  MissionActivityStatus,
  MissionDef,
  SubsetDepositStatus,
  SubsetDepositTransaction,
  UserRole,
  WalletTransaction,
  WalletTxType,
} from "@/types/mlm";

type DecimalLike = { toNumber?: () => number; toString: () => string };

export function decimalToNumber(value: DecimalLike | number | string | null | undefined): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return value.toNumber?.() ?? Number(value.toString());
}

export function dateToIso(value: Date | string | null | undefined): string {
  if (!value) return "";
  return value instanceof Date ? value.toISOString() : value;
}

export function getFullName(profile?: { first_name: string | null; last_name: string | null } | null): string {
  const fullName = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();
  return fullName || "کاربر";
}

export function normalizeRole(code?: string | null): UserRole {
  if (code === "manager" || code === "admin") return code;
  return "client";
}

export function toWalletTxType(type: string): WalletTxType {
  const allowed: WalletTxType[] = [
    "mint",
    "commission_reward",
    "mission_reward",
    "transfer_in",
    "transfer_out",
    "lock",
    "unlock",
    "pool_deposit",
    "pool_withdrawal",
    "adjustment",
  ];
  return allowed.includes(type as WalletTxType) ? (type as WalletTxType) : "adjustment";
}

export function toSignedAmount(direction: string, amount: DecimalLike): number {
  const value = decimalToNumber(amount);
  return direction === "debit" ? -value : value;
}

export function mapTransaction(tx: {
  id: string;
  type: string;
  direction: string;
  amount: DecimalLike;
  status: "pending" | "settled" | "failed" | "reversed";
  created_at: Date;
  idempotency_key: string | null;
  external_tx_ref: string | null;
  metadata: unknown;
}): WalletTransaction {
  const metadata = (tx.metadata && typeof tx.metadata === "object" ? tx.metadata : {}) as {
    rrn?: string;
    description?: string;
  };

  return {
    id: tx.id,
    rrn: metadata.rrn ?? tx.external_tx_ref ?? tx.idempotency_key ?? undefined,
    date: formatDateTime(tx.created_at),
    type: toWalletTxType(tx.type),
    description: metadata.description ?? tx.type,
    amount: toSignedAmount(tx.direction, tx.amount),
    status: tx.status,
  };
}

export function mapSubsetDepositTransaction(entry: {
  id: string;
  created_at: Date;
  level: number;
  base_amount: DecimalLike;
  rate_percent: DecimalLike;
  commission_amount_twin: DecimalLike;
  status: SubsetDepositStatus;
  sourceUserName: string;
  externalTxId?: string;
  fundId?: string | null;
}): SubsetDepositTransaction {
  return {
    id: entry.id,
    date: formatDateTime(entry.created_at),
    level: entry.level,
    sourceUserName: entry.sourceUserName,
    description: `رسوب سطح ${entry.level} — ${entry.sourceUserName}`,
    baseAmount: decimalToNumber(entry.base_amount),
    ratePercent: decimalToNumber(entry.rate_percent),
    amount: decimalToNumber(entry.commission_amount_twin),
    status: entry.status,
    externalTxId: entry.externalTxId,
    fundId: entry.fundId ?? undefined,
  };
}

export function mapMission(mission: {
  id: string;
  code: string;
  title: string;
  description: string | null;
  mission_type: MissionDef["missionType"];
  status: MissionDef["status"];
  reward_amount: DecimalLike;
}): MissionDef {
  return {
    id: mission.id,
    code: mission.code,
    title: mission.title,
    description: mission.description ?? undefined,
    missionType: mission.mission_type,
    status: mission.status,
    reward: decimalToNumber(mission.reward_amount),
  };
}

export function mapUserMissionStatus(status: string): MissionActivityStatus {
  const allowed: MissionActivityStatus[] = [
    "in_progress",
    "pending_verification",
    "completed",
    "rejected",
    "expired",
  ];
  return allowed.includes(status as MissionActivityStatus)
    ? (status as MissionActivityStatus)
    : "in_progress";
}

export function mapLeaderboardEntry(
  row: { userId: string; fullName: string; tokens: number },
  index: number,
  currentUserId?: string,
): LeaderboardEntry {
  return {
    rank: index + 1,
    userId: row.userId,
    fullName: row.fullName,
    tokens: row.tokens,
    period: "current",
    isSelf: row.userId === currentUserId,
  };
}
