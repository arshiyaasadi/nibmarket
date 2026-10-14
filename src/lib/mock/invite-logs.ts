import type { InviteStatus } from "@/types/mlm";

export interface MockInviteLogEntry {
  id: string;
  sentAt: string;
  inviterUserId: string;
  inviterName: string;
  inviterMobile: string;
  inviteeFirstName: string;
  inviteeLastName: string;
  inviteeMobile: string;
  templateId: string;
  message: string;
  fundId: string;
  status: InviteStatus;
}

const TEMPLATE_META: Record<string, { title: string; body: string; placeholders: string[] }> = {
  formal: {
    title: "رسمی",
    body: "سرکار خانم / جناب آقای {firstName} {lastName}،\nبا سلام و احترام؛\nبدین‌وسیله از شما دعوت می‌شود در باشگاه مشتریان تامین سرمایه نوین عضو شوید.\nبا احترام،\n{inviterName}",
    placeholders: ["{firstName}", "{lastName}", "{inviterName}"],
  },
  friendly: {
    title: "دوستانه",
    body: "{firstName} عزیز،\nسلام؛ خوشحال می‌شوم شما را به باشگاه مشتریان تامین سرمایه نوین دعوت کنم.\n{inviterName}",
    placeholders: ["{firstName}", "{inviterName}"],
  },
  professional: {
    title: "حرفه‌ای",
    body: "جناب آقای / سرکار خانم {firstName} {lastName}،\nسلام و احترام؛\nدعوت می‌شود در باشگاه مشتریان تامین سرمایه نوین ثبت‌نام فرمایید.\n{inviterName}",
    placeholders: ["{firstName}", "{lastName}", "{inviterName}"],
  },
};

let inviteLogs: MockInviteLogEntry[] = [];
let inviteLogsSeeded = false;

function isoDaysAgo(days: number, hour = 10, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function seedInviteLogs() {
  if (inviteLogsSeeded) return;
  inviteLogsSeeded = true;

  inviteLogs = [
    {
      id: "inv-001",
      sentAt: isoDaysAgo(0, 9, 15),
      inviterUserId: "00000000-0000-4000-8000-000000000001",
      inviterName: "کاربر تست",
      inviterMobile: "09123456789",
      inviteeFirstName: "امیر",
      inviteeLastName: "کاظمی",
      inviteeMobile: "09131234567",
      templateId: "formal",
      message: TEMPLATE_META.formal.body,
      fundId: "sahami",
      status: "pending_invite",
    },
    {
      id: "inv-002",
      sentAt: isoDaysAgo(0, 11, 42),
      inviterUserId: "00000000-0000-4000-8000-000000000002",
      inviterName: "سارا احمدی",
      inviterMobile: "09121111111",
      inviteeFirstName: "نگار",
      inviteeLastName: "موسوی",
      inviteeMobile: "09139876543",
      templateId: "friendly",
      message: TEMPLATE_META.friendly.body,
      fundId: "lazord",
      status: "pending_invite",
    },
    {
      id: "inv-003",
      sentAt: isoDaysAgo(0, 14, 5),
      inviterUserId: "00000000-0000-4000-8000-000000000005",
      inviterName: "علی محمدی",
      inviterMobile: "09124444444",
      inviteeFirstName: "حامد",
      inviteeLastName: "جلیلی",
      inviteeMobile: "09135551212",
      templateId: "professional",
      message: TEMPLATE_META.professional.body,
      fundId: "atlas",
      status: "pending_invite",
    },
    {
      id: "inv-004",
      sentAt: isoDaysAgo(1, 16, 20),
      inviterUserId: "00000000-0000-4000-8000-000000000001",
      inviterName: "کاربر تست",
      inviterMobile: "09123456789",
      inviteeFirstName: "پریسا",
      inviteeLastName: "مرادی",
      inviteeMobile: "09127778899",
      templateId: "friendly",
      message: TEMPLATE_META.friendly.body,
      fundId: "sahami",
      status: "active",
    },
    {
      id: "inv-005",
      sentAt: isoDaysAgo(2, 10, 0),
      inviterUserId: "00000000-0000-4000-8000-000000000004",
      inviterName: "مریم حسینی",
      inviterMobile: "09123333333",
      inviteeFirstName: "کامران",
      inviteeLastName: "یوسفی",
      inviteeMobile: "09126667788",
      templateId: "formal",
      message: TEMPLATE_META.formal.body,
      fundId: "lazord",
      status: "pending_verification",
    },
    {
      id: "inv-006",
      sentAt: isoDaysAgo(3, 13, 30),
      inviterUserId: "00000000-0000-4000-8000-000000000002",
      inviterName: "سارا احمدی",
      inviterMobile: "09121111111",
      inviteeFirstName: "لیلا",
      inviteeLastName: "رستمی",
      inviteeMobile: "09128887766",
      templateId: "professional",
      message: TEMPLATE_META.professional.body,
      fundId: "atlas",
      status: "active",
    },
    {
      id: "inv-007",
      sentAt: isoDaysAgo(5, 9, 0),
      inviterUserId: "00000000-0000-4000-8000-000000000001",
      inviterName: "کاربر تست",
      inviterMobile: "09123456789",
      inviteeFirstName: "رضا",
      inviteeLastName: "نوری",
      inviteeMobile: "09124443322",
      templateId: "formal",
      message: TEMPLATE_META.formal.body,
      fundId: "sahami",
      status: "suspended",
    },
  ];
}

export function ensureMockInviteLogs() {
  seedInviteLogs();
}

export function getMockInviteLogs() {
  ensureMockInviteLogs();
  return inviteLogs;
}

export function addMockInviteLog(
  entry: Omit<MockInviteLogEntry, "id" | "sentAt"> & { sentAt?: string },
) {
  ensureMockInviteLogs();
  inviteLogs.unshift({
    ...entry,
    id: crypto.randomUUID(),
    sentAt: entry.sentAt ?? new Date().toISOString(),
  });
}

export function getInviteTemplateMeta(templateId: string) {
  return TEMPLATE_META[templateId] ?? TEMPLATE_META.formal;
}

export function listInviteTemplateDefinitions() {
  return Object.entries(TEMPLATE_META).map(([id, meta]) => ({ id, ...meta }));
}

const PLACEHOLDER_PATTERN = /\{(\w+)\}/g;

export function extractInviteTemplatePlaceholders(body: string): string[] {
  const found = [...body.matchAll(PLACEHOLDER_PATTERN)].map((match) => `{${match[1]}}`);
  return [...new Set(found)];
}

export function updateInviteTemplateBody(templateId: string, body: string): boolean {
  ensureMockInviteLogs();
  const meta = TEMPLATE_META[templateId];
  if (!meta) return false;
  TEMPLATE_META[templateId] = {
    ...meta,
    body,
    placeholders: extractInviteTemplatePlaceholders(body),
  };
  return true;
}

export function createInviteTemplate(body: string): string | null {
  ensureMockInviteLogs();
  const trimmed = body.trim();
  if (!trimmed) return null;

  const id = `tpl-${crypto.randomUUID().slice(0, 8)}`;
  const previewTitle = trimmed.replace(/\n+/g, " ").trim().slice(0, 48);
  TEMPLATE_META[id] = {
    title: previewTitle || "قالب جدید",
    body: trimmed,
    placeholders: extractInviteTemplatePlaceholders(trimmed),
  };
  return id;
}

export function deleteInviteTemplate(templateId: string): boolean {
  ensureMockInviteLogs();
  if (!TEMPLATE_META[templateId]) return false;
  delete TEMPLATE_META[templateId];
  return true;
}

export function isSameLocalDay(isoA: string, isoB: Date) {
  const a = new Date(isoA);
  return (
    a.getFullYear() === isoB.getFullYear() &&
    a.getMonth() === isoB.getMonth() &&
    a.getDate() === isoB.getDate()
  );
}
