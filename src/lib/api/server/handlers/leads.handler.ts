import { NextResponse } from "next/server";
import type { RegistrationLinkLeadSource } from "@/types/mlm";

const MOBILE_RE = /^09\d{9}$/;
const VALID_SOURCES = new Set<RegistrationLinkLeadSource>(["landing_hero", "landing_join"]);

/**
 * POST /leads/registration-link — public mock until club BE ships.
 * BE must rate-limit (no captcha).
 */
export async function leadsRegistrationLinkHandler(req: Request): Promise<Response> {
  let body: { mobile?: string; source?: string } = {};
  try {
    body = (await req.json()) as { mobile?: string; source?: string };
  } catch {
    return NextResponse.json({ message: "invalid_body" }, { status: 400 });
  }

  const mobile = String(body.mobile ?? "")
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/\D/g, "");
  const source = String(body.source ?? "") as RegistrationLinkLeadSource;

  if (!MOBILE_RE.test(mobile)) {
    return NextResponse.json({ message: "invalid_mobile" }, { status: 400 });
  }
  if (!VALID_SOURCES.has(source)) {
    return NextResponse.json({ message: "invalid_source" }, { status: 400 });
  }

  return NextResponse.json({ ok: true as const });
}
