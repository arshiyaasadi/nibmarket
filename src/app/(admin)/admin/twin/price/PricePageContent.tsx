"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { type ColumnDef, type PaginationState } from "@tanstack/react-table";
import { ArrowRight, BadgeDollarSign } from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { ROUTES } from "@/config/routes";
import { Button } from "@/components/atoms/Button";
import { DataTable } from "@/components/ui/DataTable";
import { formatDisplayDate } from "@/lib/utils";
import type {
  AdminTwinOverviewResponse,
  AdminTwinTokenPriceRequest,
  AdminTwinTokenPriceRow,
  AdminTwinTokenPricesResponse,
} from "@/types/admin";

function pn(value: number) {
  return value.toLocaleString("fa-IR");
}

export default function PricePageContent() {
  const t = useTranslations("admin.twin");
  const qc = useQueryClient();
  const [logPagination, setLogPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [priceInput, setPriceInput] = useState("");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: overview, isLoading: overviewLoading } = useQuery<AdminTwinOverviewResponse>({
    queryKey: ["admin", "twin", "overview"],
    queryFn: () => apiClient.get(ENDPOINTS.ADMIN.TWIN.OVERVIEW),
  });

  const { data: priceLog, isLoading: priceLogLoading } = useQuery<AdminTwinTokenPricesResponse>({
    queryKey: ["admin", "twin", "token-prices", logPagination],
    queryFn: () =>
      apiClient.get(
        `${ENDPOINTS.ADMIN.TWIN.TOKEN_PRICES}?page=${logPagination.pageIndex}&pageSize=${logPagination.pageSize}`,
      ),
  });

  const priceMutation = useMutation({
    mutationFn: (payload: AdminTwinTokenPriceRequest) =>
      apiClient.post(ENDPOINTS.ADMIN.TWIN.TOKEN_PRICES, payload),
    onSuccess: () => {
      setPriceInput("");
      setNote("");
      setFormError(null);
      void qc.invalidateQueries({ queryKey: ["admin", "twin"] });
    },
    onError: () => {
      setFormError(t("priceError"));
    },
  });

  const priceNumber = Number(priceInput.replace(/,/g, ""));

  const logColumns: ColumnDef<AdminTwinTokenPriceRow, unknown>[] = [
    {
      accessorKey: "priceToman",
      header: t("priceColumns.price"),
      cell: ({ getValue }) => (
        <span className="font-medium tabular-nums">
          {Number(getValue()).toLocaleString("fa-IR")} {t("tomanUnit")}
        </span>
      ),
    },
    {
      accessorKey: "createdByName",
      header: t("priceColumns.admin"),
      cell: ({ getValue }) => <span className="text-sm">{String(getValue())}</span>,
    },
    {
      accessorKey: "note",
      header: t("priceColumns.note"),
      cell: ({ getValue }) => (
        <span className="text-muted text-xs">{String(getValue() ?? "—")}</span>
      ),
    },
    {
      accessorKey: "changedAt",
      header: t("priceColumns.changedAt"),
      cell: ({ getValue }) => (
        <span className="text-muted text-xs">{formatDisplayDate(String(getValue()))}</span>
      ),
    },
  ];

  function submitPrice() {
    setFormError(null);
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      setFormError(t("priceAmountInvalid"));
      return;
    }
    priceMutation.mutate({
      priceToman: priceNumber,
      note: note.trim() || undefined,
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl font-bold">{t("priceTitle")}</h1>
          <p className="text-muted mt-1 text-xs">{t("priceSubtitle")}</p>
        </div>
        <Link
          href={ROUTES.ADMIN.TWIN}
          className="text-primary hover:bg-primary/10 inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium"
        >
          <ArrowRight size={14} />
          {t("backToTwin")}
        </Link>
      </div>

      <section className="border-border bg-surface rounded-2xl border p-5">
        {overviewLoading ? (
          <div className="h-20 animate-pulse rounded-xl bg-black/5 dark:bg-white/5" />
        ) : (
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-muted text-xs">{t("instantPrice")}</p>
              <p className="text-foreground mt-1.5 text-2xl font-bold tabular-nums">
                {pn(overview?.tokenPriceToman ?? 0)}{" "}
                <span className="text-muted text-sm font-normal">{t("tomanUnit")}</span>
              </p>
              <p className="text-muted mt-1 text-[11px] tabular-nums">
                {pn(overview?.tokenPriceRial ?? 0)} {t("rialUnit")}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="border-border bg-surface flex flex-col gap-4 rounded-2xl border p-5">
        <div>
          <h2 className="text-foreground text-sm font-semibold">{t("priceFormTitle")}</h2>
          <p className="text-muted mt-0.5 text-xs">{t("priceFormSubtitle")}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="text-muted mb-1.5 block text-xs">{t("priceAmount")}</label>
            <input
              type="number"
              min={1}
              step={1}
              value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)}
              placeholder={t("priceAmountPlaceholder")}
              className="border-border bg-surface-2 text-foreground w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
              dir="ltr"
            />
          </div>
          <div>
            <label className="text-muted mb-1.5 block text-xs">{t("priceNote")}</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t("priceNotePlaceholder")}
              className="border-border bg-surface-2 text-foreground w-full rounded-xl border px-3 py-2.5 text-sm outline-none"
            />
          </div>
        </div>

        {formError && <p className="text-xs text-red-600">{formError}</p>}

        <div>
          <Button
            variant="primary"
            size="sm"
            loading={priceMutation.isPending}
            startIcon={<BadgeDollarSign size={14} />}
            onClick={submitPrice}
          >
            {t("priceSubmit")}
          </Button>
        </div>
      </section>

      <div>
        <div className="mb-4">
          <h2 className="text-foreground text-sm font-semibold">{t("priceLogTitle")}</h2>
          <p className="text-muted mt-0.5 text-xs">{t("priceLogSubtitle")}</p>
        </div>
        <DataTable
          data={priceLog?.data ?? []}
          columns={logColumns}
          pageCount={priceLog?.pageCount}
          total={priceLog?.total}
          pagination={logPagination}
          onPaginationChange={setLogPagination}
          isLoading={priceLogLoading}
          emptyMessage={t("priceLogEmpty")}
        />
      </div>
    </div>
  );
}
