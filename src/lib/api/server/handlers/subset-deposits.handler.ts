import { NextResponse } from "next/server";
import { getCurrentUserId, unauthorized } from "@/lib/api/server/session";
import {
  getCommissionLevelRules,
  getSubsetDepositTransactions,
} from "@/lib/mock/repositories/subset-deposits.repository";
import type { SubsetDepositStatusFilter } from "@/types/mlm";

function normalizeStatus(value: string | null): SubsetDepositStatusFilter {
  if (value === "calculated" || value === "credited") return value;
  return "all";
}

export async function subsetDepositTransactionsHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();

  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") ?? "1");
  const status = normalizeStatus(url.searchParams.get("status"));

  return NextResponse.json(await getSubsetDepositTransactions(userId, { page, status }));
}

export async function subsetDepositRulesHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();

  return NextResponse.json(await getCommissionLevelRules());
}
