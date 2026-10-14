import { ensureMockStore, getMockUsers } from "@/lib/mock/store";
import type {
  AdminPaginatedResponse,
  CreateNotificationGroupRequest,
  CreateSystemMessageRequest,
  NotificationGroup,
  NotificationGroupDetail,
  NotificationGroupMember,
  SystemMessageCampaign,
  UpdateNotificationGroupRequest,
} from "@/types/admin";
import type { Notification } from "@/types/mlm";

function nowIso() {
  return new Date().toISOString();
}

function uuid() {
  return crypto.randomUUID();
}

const groups: NotificationGroup[] = [
  {
    id: "mock-group-1",
    title: "کاربران نمونه تهران",
    memberIds: [],
    memberCount: 0,
    createdAt: "2026-09-01T10:00:00.000Z",
    updatedAt: "2026-09-01T10:00:00.000Z",
  },
];

const campaigns: SystemMessageCampaign[] = [
  {
    id: "mock-campaign-1",
    title: "خوش‌آمدگویی",
    body: "به باشگاه مشتریان نوین خوش آمدید. از امکانات پنل خود استفاده کنید.",
    audienceType: "all",
    userId: null,
    userIds: [],
    groupId: null,
    audienceLabel: "همه کاربران",
    channels: { system: true, sms: false },
    status: "sent",
    scheduledAt: null,
    sentAt: "2026-09-10T08:00:00.000Z",
    deletedAt: null,
    createdBy: { id: "admin-mock", fullName: "مدیر سیستم" },
    createdAt: "2026-09-10T07:55:00.000Z",
  },
];

/** In-memory client inbox; seeded + updated when campaigns send via system channel. */
let clientNotifications: Notification[] = [
  {
    id: "mock-notification-1",
    type: "system",
    title: "به نیب کلاب خوش آمدید",
    body: "حساب کاربری شما آماده استفاده است.",
    createdAt: "2026-08-16T08:30:00.000Z",
    isRead: false,
  },
  {
    id: "mock-notification-2",
    type: "network",
    title: "عضو جدید شبکه",
    body: "یک کاربر جدید با کد دعوت شما ثبت‌نام کرد.",
    createdAt: "2026-08-15T12:00:00.000Z",
    isRead: true,
  },
  {
    id: "mock-notification-3",
    type: "promotion",
    title: "ماموریت جدید",
    body: "ماموریت هفتگی جدید برای شما فعال شد.",
    createdAt: "2026-08-14T09:15:00.000Z",
    isRead: true,
  },
];

const deletedCampaignIds = new Set<string>();

async function hydrateGroupMembers() {
  await ensureMockStore();
  const users = [...getMockUsers().values()];
  if (groups[0] && groups[0].memberIds.length === 0 && users.length > 0) {
    const ids = users.slice(0, Math.min(3, users.length)).map((u) => u.id);
    groups[0].memberIds = ids;
    groups[0].memberCount = ids.length;
  }
}

function memberFromUserId(id: string): NotificationGroupMember | null {
  const user = getMockUsers().get(id);
  if (!user) return null;
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    mobile: user.mobile,
  };
}

function toDetail(group: NotificationGroup): NotificationGroupDetail {
  return {
    ...group,
    members: group.memberIds
      .map(memberFromUserId)
      .filter((m): m is NotificationGroupMember => m != null),
  };
}

function paginateAdmin<T>(items: T[], page: number, pageSize: number): AdminPaginatedResponse<T> {
  const total = items.length;
  const data = items.slice(page * pageSize, (page + 1) * pageSize);
  return {
    data,
    total,
    page,
    pageSize,
    pageCount: Math.ceil(total / pageSize) || 1,
  };
}

export async function listNotificationGroups(params: {
  page: number;
  pageSize: number;
  search: string;
}): Promise<AdminPaginatedResponse<NotificationGroup>> {
  await hydrateGroupMembers();
  let items = [...groups].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  if (params.search.trim()) {
    const q = params.search.trim();
    items = items.filter((g) => g.title.includes(q));
  }
  return paginateAdmin(items, params.page, params.pageSize);
}

export async function getNotificationGroup(id: string): Promise<NotificationGroupDetail | null> {
  await hydrateGroupMembers();
  const group = groups.find((g) => g.id === id);
  return group ? toDetail(group) : null;
}

export async function createNotificationGroup(
  body: CreateNotificationGroupRequest,
): Promise<
  { ok: true; group: NotificationGroupDetail } | { ok: false; error: string; status: number }
> {
  await hydrateGroupMembers();
  const title = body.title?.trim() ?? "";
  if (!title) return { ok: false, error: "title required", status: 400 };
  if (groups.some((g) => g.title === title)) {
    return { ok: false, error: "conflict", status: 409 };
  }
  const memberIds = Array.isArray(body.memberIds) ? [...new Set(body.memberIds)] : [];
  if (memberIds.length === 0) return { ok: false, error: "memberIds required", status: 400 };
  for (const id of memberIds) {
    if (!getMockUsers().has(id)) return { ok: false, error: "invalid member", status: 400 };
  }
  const ts = nowIso();
  const group: NotificationGroup = {
    id: uuid(),
    title,
    memberIds,
    memberCount: memberIds.length,
    createdAt: ts,
    updatedAt: ts,
  };
  groups.unshift(group);
  return { ok: true, group: toDetail(group) };
}

export async function updateNotificationGroup(
  id: string,
  body: UpdateNotificationGroupRequest,
): Promise<
  { ok: true; group: NotificationGroupDetail } | { ok: false; error: string; status: number }
> {
  await hydrateGroupMembers();
  const group = groups.find((g) => g.id === id);
  if (!group) return { ok: false, error: "not_found", status: 404 };
  if (body.title !== undefined) {
    const title = body.title.trim();
    if (!title) return { ok: false, error: "title required", status: 400 };
    if (groups.some((g) => g.id !== id && g.title === title)) {
      return { ok: false, error: "conflict", status: 409 };
    }
    group.title = title;
  }
  if (body.memberIds !== undefined) {
    const memberIds = [...new Set(body.memberIds)];
    if (memberIds.length === 0) return { ok: false, error: "memberIds required", status: 400 };
    for (const mid of memberIds) {
      if (!getMockUsers().has(mid)) return { ok: false, error: "invalid member", status: 400 };
    }
    group.memberIds = memberIds;
    group.memberCount = memberIds.length;
  }
  group.updatedAt = nowIso();
  return { ok: true, group: toDetail(group) };
}

export async function deleteNotificationGroup(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const idx = groups.findIndex((g) => g.id === id);
  if (idx < 0) return { ok: false, error: "not_found", status: 404 };
  groups.splice(idx, 1);
  return { ok: true };
}

function resolveAudienceLabel(req: CreateSystemMessageRequest):
  | {
      label: string;
      userId: string | null;
      userIds: string[];
      groupId: string | null;
    }
  | { error: string } {
  if (req.audienceType === "user") {
    const ids = [
      ...new Set([
        ...(Array.isArray(req.userIds) ? req.userIds : []),
        ...(req.userId ? [req.userId] : []),
      ]),
    ];
    if (ids.length === 0) return { error: "userIds required" };
    const labels: string[] = [];
    for (const id of ids) {
      const user = getMockUsers().get(id);
      if (!user) return { error: "user not found" };
      labels.push(`${user.firstName} ${user.lastName}`.trim() || user.mobile);
    }
    return {
      label:
        labels.length === 1
          ? labels[0]
          : `${labels.slice(0, 2).join("، ")}${labels.length > 2 ? ` و ${labels.length - 2} نفر دیگر` : ""}`,
      userId: ids[0],
      userIds: ids,
      groupId: null,
    };
  }
  if (req.audienceType === "group") {
    if (!req.groupId) return { error: "groupId required" };
    const group = groups.find((g) => g.id === req.groupId);
    if (!group) return { error: "group not found" };
    return { label: group.title, userId: null, userIds: [], groupId: group.id };
  }
  if (req.audienceType === "all") {
    return { label: "همه کاربران", userId: null, userIds: [], groupId: null };
  }
  return { error: "invalid audienceType" };
}

function deliverSystemNotification(campaign: SystemMessageCampaign) {
  if (!campaign.channels.system) return;
  if (campaign.status === "deleted") return;
  clientNotifications.unshift({
    id: uuid(),
    type: "system",
    title: campaign.title,
    body: campaign.body,
    createdAt: campaign.sentAt ?? nowIso(),
    isRead: false,
  });
}

export async function listSystemMessages(params: {
  page: number;
  pageSize: number;
  status: string;
  search: string;
}): Promise<AdminPaginatedResponse<SystemMessageCampaign>> {
  await hydrateGroupMembers();
  let items = [...campaigns].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  if (params.status) {
    items = items.filter((c) => c.status === params.status);
  }
  if (params.search.trim()) {
    const q = params.search.trim();
    items = items.filter((c) => c.title.includes(q) || c.body.includes(q));
  }
  return paginateAdmin(items, params.page, params.pageSize);
}

export async function createSystemMessage(
  body: CreateSystemMessageRequest,
): Promise<
  { ok: true; campaign: SystemMessageCampaign } | { ok: false; error: string; status: number }
> {
  await hydrateGroupMembers();
  const title = body.title?.trim() ?? "";
  const text = body.body?.trim() ?? "";
  if (!title) return { ok: false, error: "title required", status: 400 };
  if (title.length > 120) return { ok: false, error: "title too long", status: 400 };
  if (!text) return { ok: false, error: "body required", status: 400 };
  if (text.length > 1000) return { ok: false, error: "body too long", status: 400 };
  if (!body.channels?.system && !body.channels?.sms) {
    return { ok: false, error: "at least one channel required", status: 400 };
  }

  const audience = resolveAudienceLabel(body);
  if ("error" in audience) return { ok: false, error: audience.error, status: 400 };

  const scheduledAt = body.scheduledAt ?? null;
  if (scheduledAt) {
    const t = Date.parse(scheduledAt);
    if (Number.isNaN(t)) return { ok: false, error: "invalid scheduledAt", status: 400 };
    if (t <= Date.now()) return { ok: false, error: "scheduledAt must be future", status: 400 };
  }

  const ts = nowIso();
  const isScheduled = Boolean(scheduledAt);
  const campaign: SystemMessageCampaign = {
    id: uuid(),
    title,
    body: text,
    audienceType: body.audienceType,
    userId: audience.userId,
    userIds: audience.userIds,
    groupId: audience.groupId,
    audienceLabel: audience.label,
    channels: {
      system: Boolean(body.channels.system),
      sms: Boolean(body.channels.sms),
    },
    status: isScheduled ? "scheduled" : "sent",
    scheduledAt,
    sentAt: isScheduled ? null : ts,
    deletedAt: null,
    createdBy: { id: "admin-mock", fullName: "مدیر سیستم" },
    createdAt: ts,
  };

  campaigns.unshift(campaign);
  if (!isScheduled) {
    deliverSystemNotification(campaign);
  }

  return { ok: true, campaign };
}

export async function softDeleteSystemMessage(
  id: string,
): Promise<
  { ok: true; campaign: SystemMessageCampaign } | { ok: false; error: string; status: number }
> {
  const campaign = campaigns.find((c) => c.id === id);
  if (!campaign) return { ok: false, error: "not_found", status: 404 };
  if (campaign.status === "deleted") return { ok: true, campaign };
  campaign.status = "deleted";
  campaign.deletedAt = nowIso();
  deletedCampaignIds.add(campaign.id);
  // Hide matching system notifications by title+body from the mock inbox
  clientNotifications = clientNotifications.filter(
    (n) => !(n.type === "system" && n.title === campaign.title && n.body === campaign.body),
  );
  return { ok: true, campaign };
}

/** Promote due scheduled campaigns (mock scheduler tick). */
export async function flushDueScheduledCampaigns() {
  const now = Date.now();
  for (const campaign of campaigns) {
    if (campaign.status !== "scheduled" || !campaign.scheduledAt) continue;
    if (Date.parse(campaign.scheduledAt) <= now) {
      campaign.status = "sent";
      campaign.sentAt = nowIso();
      deliverSystemNotification(campaign);
    }
  }
}

export async function listClientNotifications(params: {
  page: number;
  limit: number;
  type?: string | null;
}): Promise<{ items: Notification[]; total: number; page: number; limit: number }> {
  await flushDueScheduledCampaigns();
  let items = [...clientNotifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  if (params.type) {
    items = items.filter((n) => n.type === params.type);
  }
  const total = items.length;
  const start = Math.max(0, (params.page - 1) * params.limit);
  return {
    items: items.slice(start, start + params.limit),
    total,
    page: params.page,
    limit: params.limit,
  };
}

export async function markNotificationRead(
  id: string,
): Promise<{ ok: true; id: string; isRead: true } | { ok: false; error: string; status: number }> {
  const item = clientNotifications.find((n) => n.id === id);
  if (!item) return { ok: false, error: "not_found", status: 404 };
  item.isRead = true;
  return { ok: true, id: item.id, isRead: true };
}

export async function markAllNotificationsRead(): Promise<{ ok: true; updated: number }> {
  let updated = 0;
  for (const n of clientNotifications) {
    if (!n.isRead) {
      n.isRead = true;
      updated++;
    }
  }
  return { ok: true, updated };
}
