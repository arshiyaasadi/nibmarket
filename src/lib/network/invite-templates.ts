/**
 * Mock VIP invite message templates.
 *
 * TODO(backend-invite-templates): Replace with GET /network/invite-templates
 * once the backend exposes curated invite message templates (id, title, body
 * with placeholders for invitee first/last name and inviter name).
 */

export type InviteTemplate = {
  id: string;
  titleKey: string;
  bodyKey: string;
};

export const MOCK_INVITE_TEMPLATES: InviteTemplate[] = [
  { id: "formal", titleKey: "inviteTemplateFormalTitle", bodyKey: "inviteTemplateFormalBody" },
  {
    id: "friendly",
    titleKey: "inviteTemplateFriendlyTitle",
    bodyKey: "inviteTemplateFriendlyBody",
  },
  {
    id: "professional",
    titleKey: "inviteTemplateProfessionalTitle",
    bodyKey: "inviteTemplateProfessionalBody",
  },
];

export function fillInviteTemplate(
  template: string,
  vars: { firstName: string; lastName: string; inviterName: string },
): string {
  return template
    .replaceAll("{firstName}", vars.firstName)
    .replaceAll("{lastName}", vars.lastName)
    .replaceAll("{inviterName}", vars.inviterName);
}
