/**
 * VIP invite message templates from GET /network/invite-templates.
 * Preview substitutes {firstName}, {lastName}, {inviterName} client-side.
 */

export type InviteTemplate = {
  id: string;
  title: string;
  body: string;
  placeholders?: string[];
  isActive?: boolean;
};

export function fillInviteTemplate(
  template: string,
  vars: { firstName: string; lastName: string; inviterName: string },
): string {
  return template
    .replaceAll("{firstName}", vars.firstName)
    .replaceAll("{lastName}", vars.lastName)
    .replaceAll("{inviterName}", vars.inviterName);
}

/** Normalize API payload (raw array or `{ data: [...] }`). */
export function normalizeInviteTemplates(raw: unknown): InviteTemplate[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data)
      ? (raw as { data: unknown[] }).data
      : [];

  return list
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const id = String(row.id ?? "").trim();
      const title = String(row.title ?? "").trim();
      const body = String(row.body ?? "").trim();
      if (!id || !body) return null;
      const isActive = row.isActive !== false;
      const placeholders = Array.isArray(row.placeholders)
        ? row.placeholders.map((p) => String(p))
        : undefined;
      return {
        id,
        title: title || id,
        body,
        placeholders,
        isActive,
      } satisfies InviteTemplate;
    })
    .filter((tpl): tpl is InviteTemplate => tpl != null && tpl.isActive !== false);
}
