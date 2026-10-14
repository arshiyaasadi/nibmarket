import type {
  AdminInviteLogResponse,
  AdminInviteLogRow,
  AdminInviteOverviewResponse,
  AdminInviteTemplatesResponse,
} from "@/types/admin";
import {
  ensureMockInviteLogs,
  getInviteTemplateMeta,
  getMockInviteLogs,
  isSameLocalDay,
  listInviteTemplateDefinitions,
  createInviteTemplate,
  deleteInviteTemplate,
  updateInviteTemplateBody,
} from "@/lib/mock/invite-logs";

function toLogRow(entry: ReturnType<typeof getMockInviteLogs>[number]): AdminInviteLogRow {
  const template = getInviteTemplateMeta(entry.templateId);
  return {
    id: entry.id,
    sentAt: entry.sentAt,
    inviterUserId: entry.inviterUserId,
    inviterName: entry.inviterName,
    inviterMobile: entry.inviterMobile,
    inviteeFullName: `${entry.inviteeFirstName} ${entry.inviteeLastName}`.trim(),
    inviteeMobile: entry.inviteeMobile,
    templateId: entry.templateId,
    templateTitle: template.title,
    messagePreview: entry.message.replace(/\n/g, " ").slice(0, 120),
    fundId: entry.fundId,
    status: entry.status,
  };
}

export async function getAdminInviteOverview(): Promise<AdminInviteOverviewResponse> {
  ensureMockInviteLogs();
  const now = new Date();
  const logs = getMockInviteLogs();
  return {
    todayCount: logs.filter((log) => isSameLocalDay(log.sentAt, now)).length,
    totalCount: logs.length,
  };
}

export async function listAdminInviteLogs(params: {
  page: number;
  pageSize: number;
  search: string;
}): Promise<AdminInviteLogResponse> {
  ensureMockInviteLogs();
  let rows = getMockInviteLogs()
    .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
    .map(toLogRow);

  if (params.search) {
    const q = params.search.trim();
    rows = rows.filter(
      (row) =>
        row.inviterName.includes(q) ||
        row.inviterMobile.includes(q) ||
        row.inviteeFullName.includes(q) ||
        row.inviteeMobile.includes(q) ||
        row.templateTitle.includes(q),
    );
  }

  const total = rows.length;
  const slice = rows.slice(params.page * params.pageSize, (params.page + 1) * params.pageSize);

  return {
    data: slice,
    total,
    page: params.page,
    pageSize: params.pageSize,
    pageCount: Math.ceil(total / params.pageSize) || 1,
  };
}

export async function listAdminInviteTemplates(): Promise<AdminInviteTemplatesResponse> {
  ensureMockInviteLogs();

  return {
    data: listInviteTemplateDefinitions().map((tpl) => ({
      id: tpl.id,
      title: tpl.title,
      body: tpl.body,
      placeholders: tpl.placeholders,
      isActive: true,
    })),
  };
}

export async function updateAdminInviteTemplate(
  templateId: string,
  body: string,
): Promise<boolean> {
  return updateInviteTemplateBody(templateId, body);
}

export async function createAdminInviteTemplate(body: string): Promise<string | null> {
  return createInviteTemplate(body);
}

export async function deleteAdminInviteTemplate(templateId: string): Promise<boolean> {
  return deleteInviteTemplate(templateId);
}
