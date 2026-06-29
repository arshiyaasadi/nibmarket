import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import { formatDateTime } from "@/lib/utils";
import { decimalToNumber, mapMission, mapUserMissionStatus } from "@/types/mappers";
import type { Mission, MissionActivityPage, MissionActivityStatus, MissionDef } from "@/types/mlm";

type TxClient = Prisma.TransactionClient;

function isMissionActive(mission: {
  status: string;
  start_at: Date | null;
  end_at: Date | null;
}): boolean {
  if (mission.status !== "active") return false;
  const now = new Date();
  if (mission.start_at && mission.start_at > now) return false;
  if (mission.end_at && mission.end_at < now) return false;
  return true;
}

export async function completeMissionByCode(
  tx: TxClient,
  userId: string,
  code: string,
): Promise<{ completed: boolean; reward: number }> {
  const mission = await tx.missions.findFirst({
    where: { code, deleted_at: null },
  });
  if (!mission || !isMissionActive(mission)) {
    return { completed: false, reward: 0 };
  }

  const existing = await tx.user_missions.findFirst({
    where: { user_id: userId, mission_id: mission.id, status: "completed" },
  });
  if (existing) {
    return { completed: false, reward: 0 };
  }

  const idempotencyKey = `mission:${code}:${userId}`;
  const priorTx = await tx.token_transactions.findUnique({
    where: { idempotency_key: idempotencyKey },
  });
  if (priorTx) {
    return { completed: false, reward: 0 };
  }

  const wallet = await tx.wallets.findFirst({
    where: { owner_type: "USER", owner_id: userId, status: "active" },
  });
  if (!wallet) {
    return { completed: false, reward: 0 };
  }

  const balance = await tx.wallet_balances.findUnique({
    where: { wallet_id: wallet.id },
  });
  if (!balance) {
    return { completed: false, reward: 0 };
  }

  const reward = decimalToNumber(mission.reward_amount);
  const balanceAfter = decimalToNumber(balance.total) + reward;
  const rrn = `MSN${Date.now().toString().slice(-8)}`;
  const now = new Date();

  const rewardTx = await tx.token_transactions.create({
    data: {
      wallet_id: wallet.id,
      type: "mission_reward",
      direction: "credit",
      balance_bucket: "available",
      amount: mission.reward_amount,
      balance_after: balanceAfter,
      status: "settled",
      reference_type: "MISSION",
      reference_id: mission.id,
      idempotency_key: idempotencyKey,
      metadata: {
        rrn,
        description: `پاداش ماموریت ${mission.title}`,
        mission_code: code,
      },
      settled_at: now,
    },
  });

  await tx.wallet_balances.update({
    where: { wallet_id: wallet.id },
    data: {
      available: { increment: mission.reward_amount },
      total: { increment: mission.reward_amount },
      version: { increment: 1 },
    },
  });

  const progress = { done: 1, target: 1 };
  const userMission = await tx.user_missions.findFirst({
    where: { user_id: userId, mission_id: mission.id },
  });

  if (userMission) {
    await tx.user_missions.update({
      where: { id: userMission.id },
      data: {
        status: "completed",
        progress,
        completion_count: { increment: 1 },
        completed_at: now,
        reward_transaction_id: rewardTx.id,
      },
    });
  } else {
    await tx.user_missions.create({
      data: {
        user_id: userId,
        mission_id: mission.id,
        status: "completed",
        progress,
        completion_count: 1,
        completed_at: now,
        reward_transaction_id: rewardTx.id,
      },
    });
  }

  return { completed: true, reward };
}

/** Idempotent backfill for users registered before auto-mission wiring. */
export async function completeRegistrationMissionIfNeeded(userId: string): Promise<void> {
  await prisma.$transaction((tx) => completeMissionByCode(tx, userId, "registration"));
}

export async function getMissionsList(userId: string): Promise<MissionDef[]> {
  const [missions, userMissions] = await Promise.all([
    prisma.missions.findMany({
      where: { deleted_at: null },
      orderBy: [{ priority: "desc" }, { created_at: "asc" }],
    }),
    prisma.user_missions.findMany({
      where: { user_id: userId },
      select: { mission_id: true, status: true, completed_at: true },
    }),
  ]);

  const statusByMission = new Map(userMissions.map((row) => [row.mission_id, row]));

  return missions.map((mission) => {
    const dto = mapMission(mission);
    const progress = statusByMission.get(mission.id);
    return {
      ...dto,
      completed: progress?.status === "completed",
      completedAt: progress?.completed_at ? formatDateTime(progress.completed_at) : undefined,
    };
  });
}

export async function getDashboardMissions(userId: string): Promise<Mission[]> {
  const list = await getMissionsList(userId);
  return list.slice(0, 5).map((mission) => ({
    id: mission.id,
    code: mission.code,
    title: mission.title,
    completed: mission.completed ?? false,
    reward: `${mission.reward} توکن`,
  }));
}

export async function getMissionActivity(
  userId: string,
  params: { page?: number; status?: MissionActivityStatus | "all" },
): Promise<MissionActivityPage> {
  const page = Math.max(params.page ?? 1, 1);
  const limit = 10;
  const where = {
    user_id: userId,
    ...(params.status && params.status !== "all" ? { status: params.status } : {}),
  };

  const [total, userMissions] = await Promise.all([
    prisma.user_missions.count({ where }),
    prisma.user_missions.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  const missionIds = userMissions.map((item) => item.mission_id);
  const [missions, rewardTxs] = await Promise.all([
    prisma.missions.findMany({ where: { id: { in: missionIds } } }),
    prisma.token_transactions.findMany({
      where: {
        id: {
          in: userMissions
            .map((item) => item.reward_transaction_id)
            .filter((id): id is string => !!id),
        },
      },
    }),
  ]);

  const missionById = new Map(missions.map((mission) => [mission.id, mission]));
  const txById = new Map(rewardTxs.map((tx) => [tx.id, tx]));

  return {
    items: userMissions.map((item) => {
      const mission = missionById.get(item.mission_id);
      const tx = item.reward_transaction_id ? txById.get(item.reward_transaction_id) : null;
      const metadata = (tx?.metadata && typeof tx.metadata === "object" ? tx.metadata : {}) as { rrn?: string };
      return {
        id: item.id,
        missionId: item.mission_id,
        title: mission?.title ?? "ماموریت",
        date: formatDateTime(item.completed_at ?? item.created_at),
        status: mapUserMissionStatus(item.status),
        reward: decimalToNumber(mission?.reward_amount),
        rrn: metadata.rrn ?? tx?.idempotency_key ?? undefined,
      };
    }),
    hasMore: page * limit < total,
    total,
  };
}
