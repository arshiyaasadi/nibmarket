import type { NetworkSubset } from "@/types/mlm";
import { displayPersonName } from "@/lib/person-name";

function unwrapPayload(raw: unknown): unknown {
  if (raw && typeof raw === "object" && "data" in raw) {
    const inner = (raw as { data?: unknown }).data;
    if (inner != null) return inner;
  }
  return raw;
}

function ensureArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? value : [];
}

function toString(value: unknown, fallback = ""): string {
  if (value == null) return fallback;
  return String(value);
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function countDirectSubsets(rows: Record<string, unknown>[]): Map<string, number> {
  const counts = new Map<string, number>();

  for (const item of rows) {
    const parentId = toString(item.directParentUserId, "");
    if (!parentId || parentId === "0") continue;
    counts.set(parentId, (counts.get(parentId) ?? 0) + 1);
  }

  return counts;
}

function normalizeParentId(value: unknown): string | undefined {
  if (value == null) return undefined;
  const id = String(value).trim();
  if (!id || id === "0") return undefined;
  return id;
}

/** Normalize GET /network/subsets payload → flat rows for tree building. */
export function mapNetworkSubsets(raw: unknown): NetworkSubset[] {
  const payload = unwrapPayload(raw);

  let rawRows: Record<string, unknown>[];
  if (Array.isArray(payload)) {
    rawRows = payload as Record<string, unknown>[];
  } else if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    rawRows = ensureArray(o.rows ?? o.items ?? o.subsets);
  } else {
    return [];
  }

  if (rawRows.length === 0) return [];

  const childCounts = countDirectSubsets(rawRows);

  return rawRows.map((item, index) => {
    const id = toString(item.id, String(index + 1));
    const firstName = toString(item.firstName, "");
    const lastName = toString(item.lastName, "");
    const fullName = displayPersonName({
      firstName,
      lastName,
      fullName: toString(item.fullName ?? item.name, ""),
      fallback: "-",
    });

    return {
      id,
      firstName,
      lastName,
      fullName,
      level: toNumber(item.upperLevel ?? item.level, 0),
      joinDate: toString(item.creationDate ?? item.joinDate ?? item.membershipDate, ""),
      subMembersCount: toNumber(
        item.subMembersCount ?? item.subordinates,
        childCounts.get(id) ?? 0,
      ),
      leaderboardRank:
        item.leaderboardRank != null || item.rank != null
          ? toNumber(item.leaderboardRank ?? item.rank, 0)
          : undefined,
      directParentUserId: normalizeParentId(
        item.directParentUserId ?? item.parentUserId ?? item.parentId,
      ),
    };
  });
}
