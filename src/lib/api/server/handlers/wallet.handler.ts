import { NextResponse } from "next/server";
import { getWalletSummary, getWalletTransactions } from "@/lib/mock/repositories/wallet.repository";
import { getTokenPriceHistory } from "@/lib/token-price/history";
import { getCurrentUserId, unauthorized } from "@/lib/api/server/session";
import type { WalletTxType } from "@/types/mlm";

export async function walletSummaryHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();
  return NextResponse.json(await getWalletSummary(userId));
}

export async function walletTransactionsHandler(req: Request): Promise<Response> {
  const userId = getCurrentUserId(req);
  if (!userId) return unauthorized();

  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") ?? "1");
  const type = (url.searchParams.get("type") ?? "all") as WalletTxType | "all";
  const rrn = url.searchParams.get("rrn") ?? undefined;

  return NextResponse.json(await getWalletTransactions(userId, { page, type, rrn }));
}

export async function tokenPriceHandler(): Promise<Response> {
  return NextResponse.json(getTokenPriceHistory(30));
}
