function asNonEmptyString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return null;
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    const text = asNonEmptyString(value);
    if (text) return text;
  }
  return null;
}

function fromErrorsArray(errors: unknown): string | null {
  if (!Array.isArray(errors)) return null;

  const messages = errors
    .map((entry) => {
      if (typeof entry === "string") return entry.trim();
      if (entry && typeof entry === "object") {
        const record = entry as Record<string, unknown>;
        return firstString(record.message, record.error, record.detail, record.title);
      }
      return null;
    })
    .filter((value): value is string => Boolean(value));

  return messages.length > 0 ? messages.join(" · ") : null;
}

/** Extract a user-visible message from a backend/BFF JSON error payload. */
export function extractApiErrorMessage(data: unknown, fallback?: string): string {
  if (typeof data === "string") {
    const trimmed = data.trim();
    if (trimmed) return trimmed;
  }

  if (Array.isArray(data)) {
    return fromErrorsArray(data) ?? fallback ?? "Request failed";
  }

  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    const nested =
      record.data && typeof record.data === "object"
        ? (record.data as Record<string, unknown>)
        : null;

    return (
      firstString(
        record.message,
        record.error,
        record.detail,
        record.title,
        record.description,
        nested?.message,
        nested?.error,
        nested?.detail,
      ) ??
      fromErrorsArray(record.errors) ??
      fallback ??
      "Request failed"
    );
  }

  return fallback ?? "Request failed";
}

export async function readApiErrorMessage(res: Response, fallback?: string): Promise<string> {
  const body = await res
    .clone()
    .json()
    .catch(() => null);
  return extractApiErrorMessage(body, fallback ?? `${res.status} ${res.statusText}`);
}
