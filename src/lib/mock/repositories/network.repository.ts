import { formatDateTime } from "@/lib/utils";
import { buildMockNetworkTree, MOCK_INVITED, MOCK_USER_ID } from "@/lib/mock/fixtures";
import {
  addMockPendingInvite,
  ensureMockStore,
  getMockInvitedRegistered,
  getMockPendingInvites,
  getMockUser,
} from "@/lib/mock/store";
import { addMockInviteLog, getInviteTemplateMeta } from "@/lib/mock/invite-logs";
import type {
  InvitedPerson,
  InviteQuota,
  NetworkSubset,
  NetworkTreeNode,
  SendInviteRequest,
  SendInviteResponse,
} from "@/types/mlm";

export async function attachReferrer(
  _tx: unknown,
  _userId: string,
  _referralCode: string,
): Promise<{ success: boolean; message?: string; referrerId?: string }> {
  return { success: true, referrerId: "mock-referrer" };
}

export async function createVipCodesForUser(_tx: unknown, _userId: string) {
  return;
}

const MOCK_SUBSET_PARENTS: Record<string, string | undefined> = {
  "11": MOCK_USER_ID,
  "1": MOCK_USER_ID,
  "dce83b0f-6474-f111-aa00-005056944021": "11",
  "dde83b0f-6474-f111-aa00-005056944021": "dce83b0f-6474-f111-aa00-005056944021",
  "dbe83b0f-6474-f111-aa00-005056944021": "dce83b0f-6474-f111-aa00-005056944021",
};

export async function getNetworkSubsets(_userId: string): Promise<NetworkSubset[]> {
  return MOCK_INVITED.map((item) => ({
    id: item.id,
    firstName: item.firstName,
    lastName: item.lastName,
    fullName: item.fullName,
    level: item.level ?? 1,
    joinDate: formatDateTime(item.joinDate),
    subMembersCount: item.subMembersCount ?? 0,
    directParentUserId: MOCK_SUBSET_PARENTS[item.id],
  }));
}

export async function getNetworkTree(_userId: string): Promise<NetworkTreeNode> {
  return buildMockNetworkTree();
}

export async function getNetworkInvited(
  _userId: string,
  params: { status?: string; q?: string },
): Promise<InvitedPerson[]> {
  await ensureMockStore();
  const q = params.q?.trim() ?? "";
  const filter = params.status ?? "all";

  const pendingItems = getMockPendingInvites();
  const registeredItems = getMockInvitedRegistered().map((item) => ({
    ...item,
    joinDate: item.joinDate ? formatDateTime(item.joinDate) : undefined,
  }));

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

  const filtered = items.filter(
    (user) => !q || user.fullName.includes(q) || user.mobile.includes(q),
  );

  return filtered.sort((a, b) => (a.level ?? 99) - (b.level ?? 99));
}

export async function getInviteQuota(_userId: string): Promise<InviteQuota> {
  return { limit: 5, used: 0, remaining: 5 };
}

export async function sendInviteLetter(
  userId: string,
  payload: SendInviteRequest,
): Promise<SendInviteResponse> {
  await ensureMockStore();
  const inviter = getMockUser(userId);
  const templateId = payload.templateId ?? "formal";
  const template = getInviteTemplateMeta(templateId);

  addMockPendingInvite({
    id: crypto.randomUUID(),
    firstName: payload.firstName.trim(),
    lastName: payload.lastName.trim(),
    fullName: `${payload.firstName} ${payload.lastName}`.trim(),
    mobile: payload.mobile.trim(),
    status: "pending_invite",
    joinDate: formatDateTime(new Date()),
    inviteType: "vip",
  });

  addMockInviteLog({
    inviterUserId: userId,
    inviterName: inviter ? `${inviter.firstName} ${inviter.lastName}`.trim() : "کاربر",
    inviterMobile: inviter?.mobile ?? "",
    inviteeFirstName: payload.firstName.trim(),
    inviteeLastName: payload.lastName.trim(),
    inviteeMobile: payload.mobile.trim(),
    templateId,
    message: payload.message ?? template.body,
    fundId: payload.fundId,
    status: "pending_invite",
  });

  return { success: true, remaining: 4 };
}

export async function submitReferrer(
  _userId: string,
  _referralCode: string,
): Promise<{ success: boolean; message?: string }> {
  return { success: true };
}

async function reconcileInviteLetters(_userId: string, _direct: unknown[]) {
  return;
}

export { reconcileInviteLetters };
