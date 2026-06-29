import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import { formatDateTime } from "@/lib/utils";
import { getFullName } from "@/types/mappers";
import type { InvitedPerson, NetworkSubset, NetworkTreeNode, ReferrerInfo, InviteQuota, SendInviteRequest, SendInviteResponse, VipInviteCode } from "@/types/mlm";

const VIP_INVITE_WEEKLY_LIMIT = 5;

function weekStartDate(): Date {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
}

export async function getInviteQuota(userId: string): Promise<InviteQuota> {
  const used = await prisma.invite_letters.count({
    where: { referrer_id: userId, created_at: { gte: weekStartDate() } },
  });
  return {
    limit: VIP_INVITE_WEEKLY_LIMIT,
    used,
    remaining: Math.max(0, VIP_INVITE_WEEKLY_LIMIT - used),
  };
}

export async function sendInviteLetter(
  userId: string,
  payload: SendInviteRequest,
): Promise<SendInviteResponse> {
  const quota = await getInviteQuota(userId);
  if (quota.remaining <= 0) {
    return { success: false, remaining: 0, message: "LIMIT" };
  }

  const mobile = payload.mobile.trim();
  const duplicate = await prisma.invite_letters.findFirst({
    where: {
      referrer_id: userId,
      mobile,
      status: "pending",
    },
  });
  if (duplicate) {
    return { success: false, remaining: quota.remaining, message: "DUPLICATE" };
  }

  await prisma.invite_letters.create({
    data: {
      referrer_id: userId,
      first_name: payload.firstName.trim(),
      last_name: payload.lastName.trim(),
      mobile,
      fund_id: payload.fundId,
      status: "pending",
    },
  });

  return { success: true, remaining: quota.remaining - 1 };
}

async function getProfileMap(userIds: string[]) {
  const profiles = await prisma.user_profiles.findMany({
    where: { user_id: { in: userIds } },
  });
  return new Map(profiles.map((profile) => [profile.user_id, profile]));
}

async function getDirectChildren(parentId: string) {
  return prisma.users.findMany({
    where: { referrer_id: parentId, deleted_at: null },
    orderBy: { created_at: "asc" },
  });
}

async function resolveInviteLetterForRegistration(
  tx: TxClient,
  referrerId: string,
  userId: string,
): Promise<boolean> {
  const user = await tx.users.findUnique({
    where: { id: userId },
    select: { mobile: true },
  });
  if (!user?.mobile) return false;

  const letter = await tx.invite_letters.findFirst({
    where: {
      referrer_id: referrerId,
      mobile: user.mobile,
      status: "pending",
    },
  });
  if (!letter) return false;

  await tx.invite_letters.update({
    where: { id: letter.id },
    data: { status: "registered", referred_user_id: userId },
  });
  return true;
}

async function reconcileInviteLetters(
  referrerId: string,
  direct: { id: string; mobile: string }[],
): Promise<void> {
  await Promise.all(
    direct.map(async (user) => {
      const { count } = await prisma.invite_letters.updateMany({
        where: {
          referrer_id: referrerId,
          mobile: user.mobile,
          status: "pending",
        },
        data: { status: "registered", referred_user_id: user.id },
      });

      if (count > 0) {
        await prisma.referrals.updateMany({
          where: { referred_user_id: user.id, referrer_id: referrerId },
          data: { invite_type: "vip" },
        });
      }
    }),
  );
}

type TxClient = Prisma.TransactionClient;

export async function createVipCodesForUser(tx: TxClient, userId: string): Promise<void> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I confusion
  const codes: string[] = [];
  const attempts = new Set<string>();
  while (codes.length < 5) {
    let code = "VIP";
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
    if (!attempts.has(code)) {
      attempts.add(code);
      // check uniqueness in DB
      const existing = await tx.vip_invite_codes.findFirst({ where: { code } });
      if (!existing) codes.push(code);
    }
  }
  await tx.vip_invite_codes.createMany({
    data: codes.map(code => ({ owner_id: userId, code })),
  });
}

export async function getVipCodes(userId: string): Promise<VipInviteCode[]> {
  const codes = await prisma.vip_invite_codes.findMany({
    where: { owner_id: userId },
    orderBy: { created_at: "asc" },
  });

  // Get mobile of users who used them
  const usedByIds = codes.filter(c => c.used_by).map(c => c.used_by!);
  const usedByUsers = usedByIds.length > 0
    ? await prisma.users.findMany({ where: { id: { in: usedByIds } }, select: { id: true, mobile: true } })
    : [];
  const mobileMap = new Map(usedByUsers.map(u => [u.id, u.mobile]));

  return codes.map(c => ({
    code: c.code,
    usedBy: c.used_by ? (mobileMap.get(c.used_by) ?? null) : null,
    usedAt: c.used_at ? formatDateTime(c.used_at) : null,
  }));
}

export async function attachReferrer(
  tx: TxClient,
  userId: string,
  referralCode: string,
) {
  const code = referralCode.trim().toUpperCase();
  if (!code) return { success: true, referrerId: null };

  let referrerId: string;
  let inviteType: "regular" | "vip" = "regular";

  if (code.startsWith("VIP")) {
    // VIP invite code flow
    const vipCode = await tx.vip_invite_codes.findFirst({
      where: { code, used_by: null },
    });
    if (!vipCode || vipCode.owner_id === userId) {
      return { success: false, referrerId: null, message: "Invalid referral code" };
    }
    // Mark as used
    await tx.vip_invite_codes.update({
      where: { id: vipCode.id },
      data: { used_by: userId, used_at: new Date() },
    });
    referrerId = vipCode.owner_id;
    inviteType = "vip";
  } else {
    // Regular referral code flow
    const referrer = await tx.users.findFirst({
      where: {
        referral_code: code,
        status: "active",
        deleted_at: null,
        NOT: { id: userId },
      },
    });
    if (!referrer) {
      return { success: false, referrerId: null, message: "Invalid referral code" };
    }
    referrerId = referrer.id;
  }

  await tx.users.update({
    where: { id: userId },
    data: { referrer_id: referrerId },
  });

  await tx.referrals.upsert({
    where: { referred_user_id: userId },
    create: {
      referrer_id: referrerId,
      referred_user_id: userId,
      referral_code_used: code,
      source: "registration",
      invite_type: inviteType,
    },
    update: {
      referrer_id: referrerId,
      referral_code_used: code,
      source: "registration",
      invite_type: inviteType,
    },
  });

  const ancestors = await tx.network_closure.findMany({
    where: { descendant_id: referrerId },
  });

  await tx.network_closure.createMany({
    data: [
      { ancestor_id: userId, descendant_id: userId, depth: 0 },
      ...ancestors.map((ancestor) => ({
        ancestor_id: ancestor.ancestor_id,
        descendant_id: userId,
        depth: ancestor.depth + 1,
      })),
      { ancestor_id: referrerId, descendant_id: userId, depth: 1 },
    ],
    skipDuplicates: true,
  });

  const hadVipLetter = await resolveInviteLetterForRegistration(tx, referrerId, userId);
  if (hadVipLetter && inviteType === "regular") {
    await tx.referrals.update({
      where: { referred_user_id: userId },
      data: { invite_type: "vip" },
    });
  }

  return { success: true, referrerId };
}

export async function getNetworkSubsets(userId: string): Promise<NetworkSubset[]> {
  const closures = await prisma.network_closure.findMany({
    where: {
      ancestor_id: userId,
      depth: { gt: 0 },
    },
    orderBy: [{ depth: "asc" }, { created_at: "asc" }],
  });
  const userIds = closures.map((row) => row.descendant_id);
  if (userIds.length === 0) return [];

  const [users, profiles, childCounts] = await Promise.all([
    prisma.users.findMany({ where: { id: { in: userIds }, deleted_at: null } }),
    getProfileMap(userIds),
    prisma.referrals.groupBy({
      by: ["referrer_id"],
      where: { referrer_id: { in: userIds } },
      _count: { referred_user_id: true },
    }),
  ]);

  const userById = new Map(users.map((user) => [user.id, user]));
  const countByUser = new Map(childCounts.map((row) => [row.referrer_id, row._count.referred_user_id]));

  const items: NetworkSubset[] = [];
  closures.forEach((closure) => {
      const user = userById.get(closure.descendant_id);
      if (!user) return;
      const profile = profiles.get(user.id);
      items.push({
        id: user.id,
        firstName: profile?.first_name ?? "",
        lastName: profile?.last_name ?? "",
        fullName: getFullName(profile),
        level: closure.depth,
        joinDate: formatDateTime(user.created_at),
        subMembersCount: countByUser.get(user.id) ?? 0,
        directParentUserId: user.referrer_id ?? undefined,
      });
    });

  return items;
}

export async function getNetworkInvited(
  userId: string,
  params: { status?: string; q?: string },
): Promise<InvitedPerson[]> {
  const q = params.q?.trim() ?? "";
  const filter = params.status ?? "all";

  const [pendingLetters, direct] = await Promise.all([
    prisma.invite_letters.findMany({
      where: { referrer_id: userId, status: "pending" },
      orderBy: { created_at: "desc" },
    }),
    getDirectChildren(userId),
  ]);

  await reconcileInviteLetters(userId, direct);

  const registeredMobiles = new Set(direct.map((user) => user.mobile));
  const activePendingLetters = pendingLetters.filter(
    (letter) => !registeredMobiles.has(letter.mobile),
  );

  const userIds = direct.map((user) => user.id);
  const profiles = await getProfileMap(userIds);

  const referralRecords = await prisma.referrals.findMany({
    where: { referred_user_id: { in: userIds } },
    select: { referred_user_id: true, invite_type: true },
  });
  const inviteTypeMap = new Map(referralRecords.map(r => [r.referred_user_id, r.invite_type as "regular" | "vip"]));

  const childCounts = userIds.length > 0
    ? await prisma.referrals.groupBy({
        by: ["referrer_id"],
        where: { referrer_id: { in: userIds } },
        _count: { referred_user_id: true },
      })
    : [];
  const countByUser = new Map(childCounts.map((row) => [row.referrer_id, row._count.referred_user_id]));

  const pendingItems: InvitedPerson[] = activePendingLetters.map((letter) => ({
    id: letter.id,
    firstName: letter.first_name,
    lastName: letter.last_name,
    fullName: `${letter.first_name} ${letter.last_name}`.trim(),
    mobile: letter.mobile,
    status: "pending_invite",
    joinDate: formatDateTime(letter.created_at),
    inviteType: "vip",
  }));

  const registeredItems: InvitedPerson[] = direct.map((user) => {
    const profile = profiles.get(user.id);
    return {
      id: user.id,
      firstName: profile?.first_name ?? "",
      lastName: profile?.last_name ?? "",
      fullName: getFullName(profile),
      mobile: user.mobile,
      status: user.status as InvitedPerson["status"],
      joinDate: formatDateTime(user.created_at),
      level: 1,
      subMembersCount: countByUser.get(user.id) ?? 0,
      inviteType: inviteTypeMap.get(user.id) ?? "regular",
    };
  });

  let items: InvitedPerson[];
  if (filter === "pending") {
    items = pendingItems;
  } else if (filter === "registered") {
    items = registeredItems;
  } else if (filter === "all" || !filter) {
    items = [...pendingItems, ...registeredItems];
  } else {
    items = registeredItems.filter((user) => user.status === filter);
  }

  return items.filter((user) => !q || user.fullName.includes(q) || user.mobile.includes(q));
}

export async function getReferrerInfo(userId: string): Promise<ReferrerInfo | null> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
  });
  if (!user?.referrer_id) return null;

  const referrer = await prisma.users.findUnique({
    where: { id: user.referrer_id },
  });
  if (!referrer) return null;

  const [profile, closure, referralRecord] = await Promise.all([
    prisma.user_profiles.findUnique({ where: { user_id: referrer.id } }),
    prisma.network_closure.findFirst({
      where: { ancestor_id: referrer.id, descendant_id: userId },
      select: { depth: true },
    }),
    prisma.referrals.findFirst({
      where: { referred_user_id: userId },
      select: { invite_type: true },
    }),
  ]);

  return {
    id: referrer.id,
    fullName: getFullName(profile),
    level: closure?.depth ?? 1,
    inviteCode: referrer.referral_code,
    inviteType: (referralRecord?.invite_type as "regular" | "vip") ?? "regular",
  };
}

export async function getNetworkTree(userId: string): Promise<NetworkTreeNode> {
  const descendants = await prisma.network_closure.findMany({
    where: { ancestor_id: userId },
  });
  const userIds = descendants.map((row) => row.descendant_id);
  const [users, profiles] = await Promise.all([
    prisma.users.findMany({ where: { id: { in: userIds }, deleted_at: null } }),
    getProfileMap(userIds),
  ]);

  const nodes = new Map<string, NetworkTreeNode>();
  users.forEach((user) => {
    const depth = descendants.find((row) => row.descendant_id === user.id)?.depth ?? 0;
    nodes.set(user.id, {
      id: user.id,
      fullName: getFullName(profiles.get(user.id)),
      level: depth,
      isSelf: user.id === userId,
      children: [],
    });
  });

  users.forEach((user) => {
    if (!user.referrer_id || user.id === userId) return;
    const parent = nodes.get(user.referrer_id);
    const child = nodes.get(user.id);
    if (parent && child) parent.children?.push(child);
  });

  return nodes.get(userId) ?? {
    id: userId,
    fullName: "کاربر",
    level: 0,
    isSelf: true,
    children: [],
  };
}

export async function submitReferrer(userId: string, referralCode: string) {
  const code = referralCode.trim().toUpperCase();
  if (!code) return { success: false, message: "REFERRAL_CODE_REQUIRED" };

  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) return { success: false, message: "USER_NOT_FOUND" };
  if (user.referrer_id) return { success: false, message: "ALREADY_HAS_REFERRER" };

  const directChildren = await prisma.users.count({
    where: { referrer_id: userId, deleted_at: null },
  });
  if (directChildren > 0) return { success: false, message: "HAS_SUBSETS" };

  const referrer = await prisma.users.findUnique({
    where: { referral_code: code },
  });
  if (!referrer || referrer.id === userId) {
    return { success: false, message: "INVALID_REFERRAL_CODE" };
  }

  const result = await prisma.$transaction((tx) => attachReferrer(tx, userId, code));
  if (!result.success) return { success: false, message: result.message ?? "INVALID_REFERRAL_CODE" };

  return { success: true };
}
