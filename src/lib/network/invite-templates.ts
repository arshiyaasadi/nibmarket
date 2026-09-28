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
  const list: unknown[] = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown }).data)
      ? (raw as { data: unknown[] }).data
      : [];

  const templates: InviteTemplate[] = [];

  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const id = String(row.id ?? "").trim();
    const title = String(row.title ?? "").trim();
    const body = String(row.body ?? "").trim();
    if (!id || !body) continue;
    if (row.isActive === false) continue;

    templates.push({
      id,
      title: title || id,
      body,
      placeholders: Array.isArray(row.placeholders)
        ? row.placeholders.map((p) => String(p))
        : undefined,
      isActive: true,
    });
  }

  return templates;
}
