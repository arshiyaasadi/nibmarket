import bcrypt from "bcryptjs";
import { MOCK_PASSWORD } from "@/config/mock-hints";
import {
  createDefaultMockUser,
  createSeedMockUsers,
  MOCK_INVITED,
  MOCK_MISSIONS,
  MOCK_MISSION_ACTIVITY,
  MOCK_USER_ID,
  type MockUserRecord,
} from "./fixtures";
import type { InvitedPerson, LoginActivity, MissionDef } from "@/types/mlm";

let passwordHashPromise: Promise<string> | null = null;

async function getDefaultPasswordHash() {
  if (!passwordHashPromise) {
    passwordHashPromise = bcrypt.hash(MOCK_PASSWORD, 10);
  }
  return passwordHashPromise;
}

const users = new Map<string, MockUserRecord>();
const loginSessions = new Map<string, LoginActivity[]>();
const pendingInvites: InvitedPerson[] = [];
let missions = [...MOCK_MISSIONS];
let missionActivity = [...MOCK_MISSION_ACTIVITY];
let adminAssignments: { userId: string; roleCode: string; grantedAt: string }[] = [];

export async function ensureMockStore() {
  if (users.size > 0) return;
  const hash = await getDefaultPasswordHash();
  users.set(MOCK_USER_ID, createDefaultMockUser(hash));
  for (const user of createSeedMockUsers(hash)) {
    users.set(user.id, user);
  }
}

export function getMockUsers() {
  return users;
}

export function getMockUser(userId: string) {
  return users.get(userId) ?? null;
}

export function getMockUserByMobile(mobile: string) {
  for (const user of users.values()) {
    if (user.mobile === mobile) return user;
  }
  return null;
}

export function getMockUserByLogin(login: string) {
  for (const user of users.values()) {
    if (user.mobile === login || user.email === login) return user;
  }
  return null;
}

export async function addMockUser(input: {
  mobile: string;
  passwordHash: string;
  referralCode?: string;
}): Promise<MockUserRecord> {
  await ensureMockStore();
  const id = crypto.randomUUID();
  const user: MockUserRecord = {
    id,
    mobile: input.mobile,
    email: `${input.mobile}@nibclub.local`,
    passwordHash: input.passwordHash,
    status: "active",
    referralCode: `NIB${Math.floor(100000 + Math.random() * 900000)}`,
    role: "client",
    firstName: "کاربر",
    lastName: "جدید",
    balance: 0,
    kycStatus: "none",
    gender: "male",
    birthDate: null,
    nationalId: null,
    nibMarketLinked: false,
    createdAt: new Date().toISOString(),
  };
  users.set(id, user);
  return user;
}

export function logMockLoginSession(
  userId: string,
  meta: { ip?: string; userAgent?: string; status?: "success" | "failed" },
) {
  const sessions = loginSessions.get(userId) ?? [];
  sessions.unshift({
    id: crypto.randomUUID(),
    ip: meta.ip ?? "127.0.0.1",
    device: "Web Browser",
    createdAt: new Intl.DateTimeFormat("fa-IR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date()),
    status: meta.status ?? "success",
  });
  loginSessions.set(userId, sessions.slice(0, 10));
}

export function getMockLoginSessions(userId: string) {
  return loginSessions.get(userId) ?? [];
}

export function getMockInvitedRegistered(): InvitedPerson[] {
  return MOCK_INVITED.map((item) => ({ ...item }));
}

export function getMockPendingInvites() {
  return [...pendingInvites];
}

export function addMockPendingInvite(item: InvitedPerson) {
  pendingInvites.unshift(item);
}

export function getMockMissions() {
  return missions;
}

export function setMockMissions(next: MissionDef[]) {
  missions = next;
}

export function getMockMissionActivity() {
  return missionActivity;
}

export function getMockAdminAssignments() {
  return adminAssignments;
}

export function setMockAdminAssignments(next: typeof adminAssignments) {
  adminAssignments = next;
}
