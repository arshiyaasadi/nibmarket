"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { Coins } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { ROUTES } from "@/config/routes";
import { Button } from "@/components/atoms/Button";
import { TwinCompositionCard } from "@/components/organisms/admin/twin/TwinCompositionCard";
import { JalaliDatePicker } from "@/components/molecules/JalaliDatePicker";
import { DataTable } from "@/components/ui/DataTable";
import { formatDisplayDate } from "@/lib/utils";
import type {
  AdminTwinOverviewResponse,
  AdminTwinSupplyAdjustmentRequest,
  AdminTwinSupplyAdjustmentRow,
  AdminTwinSupplyAdjustmentsResponse,
} from "@/types/admin";

function pn(value: number) {
  return value.toLocaleString("fa-IR");
}

export default function TreasuryPageContent() {
  const t = useTranslations("admin.twin");
  const qc = useQueryClient();
  const [logPagination, setLogPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [amountInput, setAmountInput] = useState("");
  const [effectiveDate, setEffectiveDate] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: overview, isLoading: overviewLoading } = useQuery<AdminTwinOverviewResponse>({
    queryKey: ["admin", "twin", "overview"],
    queryFn: () => apiClient.get(ENDPOINTS.ADMIN.TWIN.OVERVIEW),
  });

  const { data: supplyLog, isLoading: supplyLogLoading } =
    useQuery<AdminTwinSupplyAdjustmentsResponse>({
      queryKey: ["admin", "twin", "supply-adjustments", logPagination],
      queryFn: () =>
        apiClient.get(
          `${ENDPOINTS.ADMIN.TWIN.SUPPLY_ADJUSTMENTS}?page=${logPagination.pageIndex}&pageSize=${logPagination.pageSize}`,
        ),
    });

  const supplyMutation = useMutation({
    mutationFn: (payload: AdminTwinSupplyAdjustmentRequest) =>
      apiClient.post(ENDPOINTS.ADMIN.TWIN.SUPPLY_ADJUSTMENTS, payload),
    onSuccess: () => {
      setAmountInput("");
      setNote("");
      setFormError(null);
      void qc.invalidateQueries({ queryKey: ["admin", "twin"] });
    },
    onError: () => {
      setFormError(t("supplyError"));
    },
  });

  const amountNumber = Number(amountInput.replace(/,/g, ""));
  const approxValue =
    Number.isFinite(amountNumber) && overview
      ? Math.round(amountNumber * overview.tokenPriceRial)
      : null;

  const logColumns: ColumnDef<AdminTwinSupplyAdjustmentRow, unknown>[] = [
    {
      accessorKey: "effectiveDate",
      header: t("supplyColumns.date"),
      cell: ({ getValue }) => (
        <span className="text-xs tabular-nums" dir="ltr">
          {String(getValue())}
        </span>
      ),
    },
    {
      accessorKey: "amount",
      header: t("supplyColumns.amount"),
      cell: ({ getValue }) => (
        <span className="text-green-700 tabular-nums">
          {Number(getValue()).toLocaleString("fa-IR")}
        </span>
      ),
    },
    {
      accessorKey: "approxValueRial",
      header: t("supplyColumns.value"),
      cell: ({ getValue }) => (
        <span className="tabular-nums">
          {Number(getValue()).toLocaleString("fa-IR")} {t("rialUnit")}
        </span>
      ),
    },
    {
      accessorKey: "createdByName",
      header: t("supplyColumns.admin"),
      cell: ({ getValue }) => <span className="text-sm">{String(getValue())}</span>,
    },
    {
      accessorKey: "note",
      header: t("supplyColumns.note"),
      cell: ({ getValue }) => (
        <span className="text-muted text-xs">{String(getValue() ?? "—")}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: t("supplyColumns.createdAt"),
      cell: ({ getValue }) => (
        <span className="text-muted text-xs">{formatDisplayDate(String(getValue()))}</span>
      ),
    },
  ];

  function submitSupply() {
    setFormError(null);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      setFormError(t("supplyAmountInvalid"));
      return;
    }
    if (!effectiveDate) {
      setFormError(t("supplyDateRequired"));
      return;
    }
    supplyMutation.mutate({
      amount: amountNumber,
      effectiveDate,
      note: note.trim() || undefined,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-foreground text-xl font-bold">{t("treasuryTitle")}</h1>
          <p className="text-muted mt-1 text-xs">{t("treasurySubtitle")}</p>
        </div>
        <Link
          href={ROUTES.ADMIN.TWIN}
          className="border-border text-muted hover:text-foreground inline-flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-medium transition-colors"
        >
          {t("backToTwin")}
        </Link>
      </div>

      <TwinCompositionCard overview={overview} isLoading={overviewLoading} />

      <section className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-5">
        <div>
          <h2 className="text-foreground text-sm font-semibold">{t("supplyTitle")}</h2>
          <p className="text-muted mt-0.5 text-xs">{t("supplySubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <label className="text-muted mb-1.5 block text-xs">{t("supplyAmount")}</label>
            <input
              type="number"
              min={1}
              step={1}
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder={t("supplyAmountPlaceholder")}
              className="border-border bg-surface-2 text-foreground w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
              dir="ltr"
            />
          </div>
          <div>
            <JalaliDatePicker
              label={t("supplyDate")}
              value={effectiveDate}
              onChange={setEffectiveDate}
              placeholder={t("supplyDatePlaceholder")}
            />
          </div>
          <div>
            <label className="text-muted mb-1.5 block text-xs">{t("supplyApprox")}</label>
            <p className="border-border bg-surface-2 text-foreground rounded-xl border px-3 py-2.5 text-sm tabular-nums">
              {approxValue === null ? "—" : `${pn(approxValue)} ${t("rialUnit")}`}
            </p>
          </div>
        </div>

        <div>
          <label className="text-muted mb-1.5 block text-xs">{t("supplyNote")}</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t("supplyNotePlaceholder")}
            className="border-border bg-surface-2 text-foreground w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
          />
        </div>

        {formError && <p className="text-xs text-red-600">{formError}</p>}

        <div>
          <Button
            variant="primary"
            size="sm"
            loading={supplyMutation.isPending}
            startIcon={<Coins size={14} />}
            onClick={submitSupply}
          >
            {t("supplySubmit")}
          </Button>
        </div>
      </section>

      <div>
        <div className="mb-4">
          <h2 className="text-foreground text-sm font-semibold">{t("supplyLogTitle")}</h2>
          <p className="text-muted mt-0.5 text-xs">{t("supplyLogSubtitle")}</p>
        </div>
        <DataTable
          data={supplyLog?.data ?? []}
          columns={logColumns}
          pageCount={supplyLog?.pageCount}
          total={supplyLog?.total}
          pagination={logPagination}
          onPaginationChange={setLogPagination}
          isLoading={supplyLogLoading}
          emptyMessage={t("supplyLogEmpty")}
        />
      </div>
    </div>
  );
}
