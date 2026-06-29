import { prisma } from "@/lib/db/prisma";
import { decimalToNumber } from "@/types/mappers";

export async function getCommissionTotals(userId: string) {
  const aggregate = await prisma.commission_entries.aggregate({
    where: { beneficiary_user_id: userId },
    _sum: {
      commission_amount_twin: true,
      commission_amount_fiat: true,
    },
    _count: true,
  });

  return {
    totalEntries: aggregate._count,
    totalTwin: decimalToNumber(aggregate._sum.commission_amount_twin),
    totalFiat: decimalToNumber(aggregate._sum.commission_amount_fiat),
  };
}
