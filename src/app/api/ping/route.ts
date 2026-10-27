import { NextResponse } from "next/server";
import { getPingPayload } from "@/lib/ops/ping-status";

export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(getPingPayload(), {
    headers: { "Cache-Control": "no-store" },
  });
}
