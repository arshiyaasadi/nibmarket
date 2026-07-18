"use client";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type PaginationState,
} from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { PaginationNavIcon } from "@/components/molecules/HorizontalScrollNav";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData, unknown>[];
  pageCount?: number;
  total?: number;
  pagination?: PaginationState;
  onPaginationChange?: (
    updater: PaginationState | ((prev: PaginationState) => PaginationState),
  ) => void;
  pageSizeOptions?: number[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<TData>({
  data,
  columns,
  pageCount,
  total,
  pagination,
  onPaginationChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  isLoading,
  emptyMessage = "داده‌ای یافت نشد",
}: DataTableProps<TData>) {
  const t = useTranslations("admin.common");
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: pagination ? { pagination } : undefined,
    onPaginationChange: onPaginationChange as never,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: !!pagination,
  });

  const recordTotal = total ?? (pagination ? undefined : data.length);
  const from =
    pagination && recordTotal !== undefined
      ? recordTotal === 0
        ? 0
        : pagination.pageIndex * pagination.pageSize + 1
      : undefined;
  const to =
    pagination && recordTotal !== undefined
      ? Math.min((pagination.pageIndex + 1) * pagination.pageSize, recordTotal)
      : undefined;

  return (
    <div className="flex flex-col gap-3">
      <div className="border-border bg-surface overflow-hidden rounded-xl border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-border bg-background border-b">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="text-muted px-4 py-3 text-start text-xs font-semibold"
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="text-muted py-16 text-center">
                    <div className="flex justify-center">
                      <div className="border-primary h-6 w-6 animate-spin rounded-full border-2 border-t-transparent" />
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="text-muted px-4 py-16 text-center text-xs"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-border hover:bg-background/50 border-b transition-colors last:border-0"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="text-foreground px-4 py-3">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && onPaginationChange && pageCount !== undefined && (
        <div className="text-muted flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {from !== undefined && to !== undefined && recordTotal !== undefined && (
              <span>{t("showingRange", { from, to, total: recordTotal })}</span>
            )}
            <span>{t("pageOf", { page: pagination.pageIndex + 1, total: pageCount })}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1.5">
              <span>{t("pageSize")}</span>
              <select
                value={pagination.pageSize}
                onChange={(e) =>
                  onPaginationChange({
                    pageIndex: 0,
                    pageSize: Number(e.target.value),
                  })
                }
                className="border-border bg-surface text-foreground rounded-lg border px-2 py-1 outline-none"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size}>
                    {size.toLocaleString("fa-IR")}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() =>
                  onPaginationChange({ ...pagination, pageIndex: pagination.pageIndex - 1 })
                }
                disabled={pagination.pageIndex === 0}
                className="border-border hover:bg-background rounded-lg border p-1.5 disabled:opacity-40"
              >
                <PaginationNavIcon direction="prev" />
              </button>
              <button
                type="button"
                onClick={() =>
                  onPaginationChange({ ...pagination, pageIndex: pagination.pageIndex + 1 })
                }
                disabled={pagination.pageIndex >= pageCount - 1}
                className="border-border hover:bg-background rounded-lg border p-1.5 disabled:opacity-40"
              >
                <PaginationNavIcon direction="next" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
