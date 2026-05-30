"use client"

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowUpDown } from "lucide-react"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatDateID, formatRupiah } from "@/lib/utils"

export interface AdminInvoiceRow {
  id: string
  createdAt: Date
  merchantRef: string
  userName: string
  userEmail: string
  planName: string
  amount: number
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED" | "REFUND"
}

const STATUS_LABEL: Record<AdminInvoiceRow["status"], string> = {
  PENDING: "Menunggu",
  PAID: "Lunas",
  FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa",
  CANCELLED: "Dibatalkan",
  REFUND: "Refund",
}

const STATUS_TONE: Record<AdminInvoiceRow["status"], BadgeProps["tone"]> = {
  PENDING: "amber",
  PAID: "sage",
  FAILED: "rose",
  EXPIRED: "stone",
  CANCELLED: "stone",
  REFUND: "rose",
}

export function AdminInvoicesTable({ rows }: { rows: AdminInvoiceRow[] }) {
  const [filter, setFilter] = useState("")

  const columns = useMemo<ColumnDef<AdminInvoiceRow>[]>(
    () => [
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-1"
          >
            Tanggal
            <ArrowUpDown className="h-3 w-3" aria-hidden />
          </button>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-stone-600">{formatDateID(row.original.createdAt)}</span>
        ),
      },
      {
        id: "user",
        accessorFn: (r) => `${r.userName} ${r.userEmail}`,
        header: () => <span>Pengguna</span>,
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium text-stone-900">{row.original.userName}</p>
            <p className="font-mono text-xs text-stone-500">{row.original.userEmail}</p>
          </div>
        ),
      },
      {
        accessorKey: "merchantRef",
        header: () => <span>Merchant ref</span>,
        cell: ({ row }) => (
          <span className="font-mono text-xs text-stone-700">{row.original.merchantRef}</span>
        ),
      },
      {
        accessorKey: "planName",
        header: () => <span>Paket</span>,
        cell: ({ row }) => (
          <span className="text-sm text-stone-700">{row.original.planName}</span>
        ),
      },
      {
        accessorKey: "amount",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="inline-flex items-center gap-1"
          >
            Nominal
            <ArrowUpDown className="h-3 w-3" aria-hidden />
          </button>
        ),
        cell: ({ row }) => (
          <span className="tabular-nums">{formatRupiah(row.original.amount)}</span>
        ),
      },
      {
        accessorKey: "status",
        header: () => <span>Status</span>,
        cell: ({ row }) => (
          <Badge tone={STATUS_TONE[row.original.status]}>
            {STATUS_LABEL[row.original.status]}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Detail</span>,
        cell: ({ row }) => (
          <Link
            href={`/admin/invoices/${row.original.id}`}
            className="text-sm font-medium text-rose-600 hover:underline"
          >
            Detail →
          </Link>
        ),
      },
    ],
    []
  )

  const table = useReactTable({
    data: rows,
    columns,
    state: { globalFilter: filter },
    onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <Input
          placeholder="Cari nama, email, atau merchant ref…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-md"
        />
        <span className="text-xs text-stone-500">
          {table.getFilteredRowModel().rows.length} invoice
        </span>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase tracking-[0.18em] text-stone-500">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="px-4 py-3 font-medium first:pl-6 last:pr-6">
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-stone-200">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-10 text-center text-stone-500">
                  Tidak ada invoice yang cocok.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-stone-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-4 align-middle first:pl-6 last:pr-6"
                    >
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
  )
}
