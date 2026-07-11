import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import type { LoginActivity, UserRole } from "@/types/mlm";
import {
  addMockUser,
  ensureMockStore,
  getMockLoginSessions,
  getMockUser,
  getMockUserByLogin,
  getMockUserByMobile,
  logMockLoginSession,
} from "@/lib/mock/store";

export async function logLoginSession(
  userId: string,
  meta: { ip?: string; userAgent?: string; status?: "success" | "failed" },
) {
  logMockLoginSession(userId, meta);
}

export async function getRecentLoginSessions(userId: string, limit = 10): Promise<LoginActivity[]> {
  return getMockLoginSessions(userId).slice(0, limit);
}

export async function getUserProfileDetails(userId: string) {
  await ensureMockStore();
  const user = getMockUser(userId);
  if (!user) return null;

  return {
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    mobile: user.mobile,
    email: user.email,
    birthDate: null,
    nationalId: null,
    nibMarketLinked: false,
    recentSessions: getMockLoginSessions(userId),
  };
}

export async function findUserByLogin(login: string) {
  await ensureMockStore();
  const user = getMockUserByLogin(login);
  if (!user) return null;
  return {
    id: user.id,
    mobile: user.mobile,
    email: user.email,
    password_hash: user.passwordHash,
    status: user.status,
    referral_code: user.referralCode,
    referrer_id: null,
    deleted_at: null,
  };
}

export async function mobileExists(mobile: string) {
  await ensureMockStore();
  const user = getMockUserByMobile(mobile);
  return user ? { id: user.id, status: user.status } : null;
}

export async function findUserById(userId: string) {
  await ensureMockStore();
  const user = getMockUser(userId);
  if (!user) return null;
  return {
    id: user.id,
    mobile: user.mobile,
    email: user.email,
    password_hash: user.passwordHash,
    status: user.status,
    referral_code: user.referralCode,
    referrer_id: null,
    deleted_at: null,
  };
}

export async function getUserProfile(userId: string) {
  const user = getMockUser(userId);
  if (!user) return null;
  return {
    user_id: user.id,
    first_name: user.firstName,
    last_name: user.lastName,
    social_links: {},
  };
}

export async function getUserRole(userId: string): Promise<UserRole> {
  return getMockUser(userId)?.role ?? "client";
}

export async function getUserWalletBalance(userId: string) {
  const user = getMockUser(userId);
  if (!user) return null;
  return {
    wallet: { id: `wallet-${userId}` },
    balance: {
      total: user.balance,
      available: user.balance,
      locked: 0,
      pending: 0,
    },
  };
}

export async function buildAuthPayload(userId: string, token: string, refreshToken: string) {
  await ensureMockStore();
  const user = getMockUser(userId);
  if (!user) return null;

  return {
    token,
    refreshToken,
    role: user.role,
    userId: user.id,
    fullName: `${user.firstName} ${user.lastName}`.trim(),
    mobile: user.mobile,
    email: user.email,
    inviteCode: user.referralCode,
    referralCode: user.referralCode,
    balance: user.balance,
    recentSessions: getMockLoginSessions(userId),
  };
}

export async function createUserWithWallet(input: {
  mobile: string;
  passwordHash: string;
  referralCode?: string;
}) {
  return addMockUser(input);
}

export async function findOrCreateNibMarketUser(input: {
  externalUserId: string;
  role: UserRole;
  mobile?: string | null;
  email?: string | null;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await ensureMockStore();
  const mobile = input.mobile?.trim() || `sso-${input.externalUserId}`;
  const existing = getMockUserByMobile(mobile);
  if (existing) return existing.id;

  const nameParts = (input.fullName ?? "").trim().split(/\s+/).filter(Boolean);
  const user = await addMockUser({
    mobile,
    passwordHash: await bcrypt.hash(randomUUID(), 12),
  });
  user.role = input.role;
  user.firstName = input.firstName?.trim() || nameParts[0] || "کاربر";
  user.lastName = input.lastName?.trim() || nameParts.slice(1).join(" ") || "نیب‌مارکت";
  return user.id;
}

export async function updatePassword(mobile: string, passwordHash: string) {
  const user = getMockUserByMobile(mobile);
  if (!user) return null;
  user.passwordHash = passwordHash;
  return user;
}
