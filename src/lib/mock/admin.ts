import {
  ensureMockStore,
  getMockMissions,
  getMockUsers,
  setMockAdminAssignments,
  setMockMissions,
} from "@/lib/mock/store";

export async function getAdminStats() {
  await ensureMockStore();
  const users = [...getMockUsers().values()];
  return {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "active").length,
    activeMissions: getMockMissions().filter((m) => !m.completed).length,
  };
}

export async function listAdminUsers(params: {
  page: number;
  pageSize: number;
  search: string;
  status: string;
}) {
  await ensureMockStore();
  let users = [...getMockUsers().values()];
  if (params.status) {
    users = users.filter((u) => u.status === params.status);
  }
  if (params.search) {
    users = users.filter(
      (u) => u.mobile.includes(params.search) || u.email.includes(params.search),
    );
  }
  const total = users.length;
  const slice = users.slice(params.page * params.pageSize, (params.page + 1) * params.pageSize);
  return {
    data: slice.map((u) => ({
      id: u.id,
      mobile: u.mobile,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      role: u.role,
      status: u.status,
      kycStatus: "none",
      referralCode: u.referralCode,
      createdAt: new Date().toISOString(),
    })),
    total,
    page: params.page,
    pageSize: params.pageSize,
    pageCount: Math.ceil(total / params.pageSize),
  };
}

export async function updateAdminUserStatus(userId: string, status: string) {
  const user = getMockUsers().get(userId);
  if (!user) return false;
  user.status = status as typeof user.status;
  return true;
}

export async function updateAdminUserRole(userId: string, roleCode: string) {
  const user = getMockUsers().get(userId);
  if (!user) return false;
  user.role = roleCode as typeof user.role;
  return true;
}

export async function listAdminMissions() {
  return getMockMissions().map((m) => ({
    id: m.id,
    code: m.code,
    title: m.title,
    description: m.description ?? "",
    missionType: "custom",
    rewardAmount: m.reward,
    criteria: {},
    verificationMode: "auto",
    status: "active",
    startDate: null,
    endDate: null,
    createdAt: new Date().toISOString(),
  }));
}

export async function createAdminMission(body: {
  code: string;
  title: string;
  description?: string;
  missionType: string;
  rewardAmount?: number;
}) {
  const missions = getMockMissions();
  const id = crypto.randomUUID();
  missions.unshift({
    id,
    code: body.code,
    title: body.title,
    description: body.description,
    reward: body.rewardAmount ?? 0,
    missionType: "custom",
    status: "active",
    completed: false,
  });
  setMockMissions([...missions]);
  return id;
}

export async function updateAdminMission(
  missionId: string,
  patch: Partial<{ title: string; status: string }>,
) {
  const missions = getMockMissions();
  const idx = missions.findIndex((m) => m.id === missionId);
  if (idx < 0) return false;
  if (patch.title) missions[idx].title = patch.title;
  setMockMissions([...missions]);
  return true;
}

export async function listAdminAssignments() {
  await ensureMockStore();
  const users = getMockUsers();
  return [...users.values()]
    .filter((u) => u.role === "admin" || u.role === "manager")
    .map((u) => ({
      userId: u.id,
      mobile: u.mobile,
      email: u.email,
      fullName: `${u.firstName} ${u.lastName}`.trim(),
      role: u.role,
      roleName: u.role,
      grantedAt: new Date().toISOString(),
    }));
}

export async function assignAdminRole(userId: string, roleCode: string) {
  const user = getMockUsers().get(userId);
  if (!user) return false;
  user.role = roleCode as typeof user.role;
  return true;
}

export async function revokeAdminRole(userId: string) {
  const user = getMockUsers().get(userId);
  if (!user) return false;
  user.role = "client";
  return true;
}

export async function listNetworkClosure() {
  return { data: [], total: 0, page: 0, pageSize: 50, pageCount: 0 };
}

// reset helper for tests
export function resetMockAdminAssignments() {
  setMockAdminAssignments([]);
}
