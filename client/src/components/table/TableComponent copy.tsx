"use client";

import * as React from "react";
import {
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Skeleton } from "../ui/skeleton";
import type { ColumnDef } from "./ColumnDef";

interface DataTableProps<TData, TValue> {
  loading: boolean;
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  DataTableToolbar: React.ComponentType<{ table: any }>;
  TableFooterCustom: any;
  showTotal?: boolean;
}

export function DataTable<TData, TValue>({
  loading,
  columns,
  data,
  DataTableToolbar,
  TableFooterCustom,
  showTotal = false,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(() =>
      columns.reduce((acc, column) => {
        if (
          "accessorKey" in column &&
          column.accessorKey &&
          column.initialHidden
        ) {
          acc[column.accessorKey as string] = false;
        }
        return acc;
      }, {} as VisibilityState)
    );

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="flex flex-col gap-3">
      <DataTableToolbar table={table} />
      <div className="w-full overflow-auto rounded-md border">
        <div className="w-full overflow-auto">
          <Table className="w-full overflow-auto">
            <TableHeader className="bg-card">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({
                  length: table.getState().pagination.pageSize,
                }).map((_, index) => (
                  <TableRow key={index}>
                    {table
                      .getAllColumns()
                      .filter((column) => column.getIsVisible())
                      .map((_, colIndex) => (
                        <TableCell key={colIndex}>
                          <Skeleton className="h-7 w-full" />
                        </TableCell>
                      ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                <>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="odd:bg-transparent even:bg-slate-200"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {showTotal && (
                    <TableRow className="border-t font-medium">
                      <TableCell
                        colSpan={3}
                        className="font-medium text-center"
                      >
                        Grand Total:
                      </TableCell>
                      <TableCell className="w-[100px] text-center">
                        111,778.67
                      </TableCell>
                      <TableCell className="w-[100px] text-center">
                        66,059.00
                      </TableCell>
                      <TableCell className="w-[100px] text-center">
                        12,500.00
                      </TableCell>
                      <TableCell className="w-[100px] text-center">
                        53,559.00
                      </TableCell>
                      <TableCell className="w-[40px] text-center"></TableCell>
                    </TableRow>
                  )}
                </>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="border-t bg-gray-50 p-1">
          <div>
            <div className="text-center">
              <TableFooterCustom key={1} table={table} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
