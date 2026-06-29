import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { decimalToNumber, getFullName, normalizeRole } from "@/types/mappers";
import type { LoginActivity, UserRole } from "@/types/mlm";
import { attachReferrer, createVipCodesForUser } from "./network.repository";
import { completeMissionByCode } from "./mission.repository";

function parseDeviceLabel(userAgent: string): string {
  if (/iPhone|iPad/i.test(userAgent)) return "iOS";
  if (/Android/i.test(userAgent)) return "Android";
  if (/Windows/i.test(userAgent)) return "Windows";
  if (/Mac OS X/i.test(userAgent)) return "macOS";
  if (/Linux/i.test(userAgent)) return "Linux";
  if (/Mobile/i.test(userAgent)) return "Mobile Browser";
  return "Web Browser";
}

function formatSessionDate(value: Date): string {
  return new Intl.DateTimeFormat("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export async function logLoginSession(
  userId: string,
  meta: { ip?: string; userAgent?: string; status?: "success" | "failed" },
) {
  const userAgent = meta.userAgent ?? "Unknown";
  await prisma.event_log.create({
    data: {
      event_id: randomUUID(),
      event_type: "USER_LOGIN",
      aggregate_type: "users",
      aggregate_id: userId,
      payload: {
        ip: meta.ip ?? null,
        device: parseDeviceLabel(userAgent),
        userAgent,
        status: meta.status ?? "success",
      },
      actor_type: "user",
      actor_id: userId,
      occurred_at: new Date(),
    },
  });
}

export async function getRecentLoginSessions(userId: string, limit = 10): Promise<LoginActivity[]> {
  const rows = await prisma.event_log.findMany({
    where: {
      aggregate_type: "users",
      aggregate_id: userId,
      event_type: "USER_LOGIN",
    },
    orderBy: { occurred_at: "desc" },
    take: limit,
  });

  return rows.map((row) => {
    const payload = (row.payload && typeof row.payload === "object" ? row.payload : {}) as {
      ip?: string;
      device?: string;
      status?: "success" | "failed";
    };
    return {
      id: row.event_id,
      ip: payload.ip ?? "—",
      device: payload.device ?? "Web Browser",
      createdAt: formatSessionDate(row.occurred_at),
      status: payload.status ?? "success",
    };
  });
}

export async function getUserProfileDetails(userId: string) {
  const [user, profile, nibLink, recentSessions] = await Promise.all([
    findUserById(userId),
    getUserProfile(userId),
    prisma.external_account_links.findFirst({
      where: { user_id: userId, platform: "NIB_MARKET", status: "active" },
      select: { id: true },
    }),
    getRecentLoginSessions(userId),
  ]);

  if (!user) return null;

  const social = (profile?.social_links && typeof profile.social_links === "object"
    ? profile.social_links
    : {}) as { national_id?: string; birth_date?: string };

  return {
    fullName: getFullName(profile),
    mobile: user.mobile,
    email: user.email,
    birthDate: social.birth_date ?? null,
    nationalId: social.national_id ?? null,
    nibMarketLinked: !!nibLink,
    recentSessions,
  };
}

type TransactionClient = Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$use" | "$extends">;

export async function findUserByLogin(login: string) {
  return prisma.users.findFirst({
    where: {
      deleted_at: null,
      OR: [{ mobile: login }, { email: login }],
    },
  });
}

export async function mobileExists(mobile: string) {
  const user = await prisma.users.findFirst({
    where: { mobile, deleted_at: null },
    select: { id: true, status: true },
  });
  return user;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function findUserById(userId: string) {
  if (!UUID_RE.test(userId)) return null;

  return prisma.users.findFirst({
    where: { id: userId, deleted_at: null },
  });
}

export async function getUserProfile(userId: string) {
  return prisma.user_profiles.findUnique({
    where: { user_id: userId },
  });
}

export async function getUserRole(userId: string): Promise<UserRole> {
  const assignment = await prisma.user_roles.findFirst({
    where: { user_id: userId },
    orderBy: { granted_at: "desc" },
  });

  if (!assignment) return "client";

  const role = await prisma.roles.findUnique({
    where: { id: assignment.role_id },
    select: { code: true },
  });

  return normalizeRole(role?.code);
}

export async function getUserWallet(userId: string) {
  return prisma.wallets.findFirst({
    where: {
      owner_type: "USER",
      owner_id: userId,
      status: "active",
    },
  });
}

export async function getUserWalletBalance(userId: string) {
  const wallet = await getUserWallet(userId);
  if (!wallet) return null;

  const balance = await prisma.wallet_balances.findUnique({
    where: { wallet_id: wallet.id },
  });

  return { wallet, balance };
}

export async function buildAuthPayload(userId: string, token: string, refreshToken: string) {
  const user = await findUserById(userId);
  if (!user) return null;

  const [profile, role, walletBalance, recentSessions] = await Promise.all([
    getUserProfile(user.id),
    getUserRole(user.id),
    getUserWalletBalance(user.id),
    getRecentLoginSessions(user.id),
  ]);

  return {
    token,
    refreshToken,
    role,
    userId: user.id,
    fullName: getFullName(profile),
    mobile: user.mobile,
    email: user.email,
    inviteCode: user.referral_code,
    referralCode: user.referral_code,
    balance: decimalToNumber(walletBalance?.balance?.total),
    recentSessions,
  };
}

async function getClientRoleId() {
  const role = await prisma.roles.findUnique({
    where: { code: "client" },
    select: { id: true },
  });
  return role?.id ?? null;
}

async function getRoleIdByCode(code: UserRole) {
  const role = await prisma.roles.findUnique({
    where: { code },
    select: { id: true },
  });
  return role?.id ?? null;
}

async function generateReferralCode(tx: Pick<typeof prisma, "users"> = prisma): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = `NIB${Math.floor(100000 + Math.random() * 900000)}`;
    const exists = await tx.users.findUnique({
      where: { referral_code: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  return `NIB${Date.now().toString().slice(-9)}`.slice(0, 12);
}

export async function createUserWithWallet(input: {
  mobile: string;
  passwordHash: string;
  referralCode?: string;
}) {
  const [clientRoleId, referralCode] = await Promise.all([
    getClientRoleId(),
    generateReferralCode(),
  ]);

  return prisma.$transaction(async (tx: TransactionClient) => {
    const user = await tx.users.create({
      data: {
        referral_code: referralCode,
        email: `${input.mobile}@nibclub.local`,
        mobile: input.mobile,
        password_hash: input.passwordHash,
        status: "active",
        kyc_status: "none",
        mobile_verified_at: new Date(),
      },
    });

    await tx.user_profiles.create({
      data: {
        user_id: user.id,
        first_name: "کاربر",
        last_name: "جدید",
      },
    });

    if (clientRoleId) {
      await tx.user_roles.create({
        data: {
          user_id: user.id,
          role_id: clientRoleId,
          granted_by: null,
        },
      });
    }

    const wallet = await tx.wallets.create({
      data: {
        owner_type: "USER",
        owner_id: user.id,
        currency: "TWIN",
        status: "active",
      },
    });

    await tx.wallet_balances.create({
      data: {
        wallet_id: wallet.id,
        available: 0,
        locked: 0,
        pending: 0,
        total: 0,
        version: 0,
      },
    });

    await tx.network_closure.createMany({
      data: [{ ancestor_id: user.id, descendant_id: user.id, depth: 0 }],
      skipDuplicates: true,
    });

    if (input.referralCode?.trim()) {
      const result = await attachReferrer(tx, user.id, input.referralCode);
      if (!result.success) {
        throw new Error("INVALID_REFERRAL_CODE");
      }
    }

    await createVipCodesForUser(tx, user.id);

    await completeMissionByCode(tx, user.id, "registration");

    return user;
  }, { maxWait: 10_000, timeout: 15_000 });
}

export async function findOrCreateNibMarketUser(input: {
  externalUserId: string;
  role: UserRole;
  mobile?: string | null;
  email?: string | null;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  metadata?: Prisma.InputJsonObject;
}) {
  const externalUserId = input.externalUserId.trim();
  if (!externalUserId) throw new Error("SSO_EXTERNAL_USER_ID_REQUIRED");

  const existingLink = await prisma.external_account_links.findUnique({
    where: {
      platform_external_user_id: {
        platform: "NIB_MARKET",
        external_user_id: externalUserId,
      },
    },
    select: { user_id: true },
  });
  if (existingLink) return existingLink.user_id;

  const mobile = input.mobile?.trim() || `sso-${externalUserId}`;
  const email = input.email?.trim() || `${mobile}@nibmarket.local`;
  const matchedUser = await prisma.users.findFirst({
    where: {
      deleted_at: null,
      OR: [
        ...(input.mobile ? [{ mobile: input.mobile.trim() }] : []),
        ...(input.email ? [{ email: input.email.trim() }] : []),
      ],
    },
    select: { id: true },
  });

  const nameParts = (input.fullName ?? "").trim().split(/\s+/).filter(Boolean);
  const firstName = input.firstName?.trim() || nameParts[0] || "کاربر";
  const lastName = input.lastName?.trim() || nameParts.slice(1).join(" ") || "نیب‌مارکت";

  const roleId = await getRoleIdByCode(input.role);
  const passwordHash = await bcrypt.hash(randomUUID(), 12);

  return prisma.$transaction(async (tx: TransactionClient) => {
    const userId = matchedUser?.id ?? (await tx.users.create({
      data: {
        referral_code: await generateReferralCode(tx),
        email,
        mobile,
        password_hash: passwordHash,
        status: "active",
        kyc_status: "none",
        mobile_verified_at: input.mobile ? new Date() : null,
        email_verified_at: input.email ? new Date() : null,
      },
      select: { id: true },
    })).id;

    if (!matchedUser) {
      await tx.user_profiles.create({
        data: {
          user_id: userId,
          first_name: firstName,
          last_name: lastName,
        },
      });

      const wallet = await tx.wallets.create({
        data: {
          owner_type: "USER",
          owner_id: userId,
          currency: "TWIN",
          status: "active",
        },
      });

      await tx.wallet_balances.create({
        data: {
          wallet_id: wallet.id,
          available: 0,
          locked: 0,
          pending: 0,
          total: 0,
          version: 0,
        },
      });

      await tx.network_closure.createMany({
        data: [{ ancestor_id: userId, descendant_id: userId, depth: 0 }],
        skipDuplicates: true,
      });

      await createVipCodesForUser(tx, userId);
      await completeMissionByCode(tx, userId, "registration");
    }

    if (roleId) {
      await tx.user_roles.upsert({
        where: { user_id_role_id: { user_id: userId, role_id: roleId } },
        create: { user_id: userId, role_id: roleId, granted_by: null },
        update: {},
      });
    }

    await tx.external_account_links.upsert({
      where: {
        user_id_platform: {
          user_id: userId,
          platform: "NIB_MARKET",
        },
      },
      create: {
        user_id: userId,
        platform: "NIB_MARKET",
        external_user_id: externalUserId,
        external_email: input.email?.trim() || null,
        status: "active",
        metadata: input.metadata ?? {},
      },
      update: {
        user_id: userId,
        external_email: input.email?.trim() || null,
        status: "active",
        metadata: input.metadata ?? {},
      },
    });

    return userId;
  }, { maxWait: 10_000, timeout: 15_000 });
}

export async function updatePassword(mobile: string, passwordHash: string) {
  const user = await findUserByLogin(mobile);
  if (!user) return null;
  return prisma.users.update({
    where: { id: user.id },
    data: { password_hash: passwordHash },
  });
}
