import type { InvitedPerson, InviteStatus } from "@/types/mlm";
import { formatDisplayDate, isIsoDateString } from "@/lib/utils";

type InvitedFilter = InviteStatus | "all" | "pending" | "registered";

export function normalizeInvitedList(
  items: InvitedPerson[],
  params: { status?: InvitedFilter; q?: string },
): InvitedPerson[] {
  const q = params.q?.trim() ?? "";
  const filter = params.status ?? "all";

  let result = [...items];

  if (filter === "pending") {
    result = result.filter(
      (item) => item.status === "pending_invite" || item.status === "pending_verification",
    );
  } else if (filter === "registered") {
    result = result.filter((item) => item.status !== "pending_invite");
  } else if (filter !== "all") {
    result = result.filter((item) => item.status === filter);
  }

  if (q) {
    result = result.filter((item) => item.fullName.includes(q) || item.mobile.includes(q));
  }

  return result
    .sort((a, b) => (a.level ?? 99) - (b.level ?? 99))
    .map((item) => ({
      ...item,
      joinDate:
        item.joinDate && isIsoDateString(item.joinDate)
          ? formatDisplayDate(item.joinDate)
          : item.joinDate,
    }));
}
