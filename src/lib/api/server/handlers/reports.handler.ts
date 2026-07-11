import { NextResponse } from "next/server";
import { getCurrentUserId, unauthorized } from "@/lib/api/server/session";
import {
  getCapitalDepositStats,
  getIncomeReport,
  getSubsetReport,
} from "@/lib/mock/repositories/report.repository";

export async function reportsSubsetsHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();
  return NextResponse.json(await getSubsetReport(userId));
}

export async function reportsIncomeHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();
  return NextResponse.json(await getIncomeReport(userId));
}

export async function reportsCapitalDepositHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();
  return NextResponse.json(await getCapitalDepositStats(userId));
}
