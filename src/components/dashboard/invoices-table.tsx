"use client"

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import Link from "next/link"
import { useMemo } from "react"
import { Badge, type BadgeProps } from "@/components/ui/badge"
import { formatDateID, formatRupiah } from "@/lib/utils"

export interface InvoiceRow {
  id: string
  merchantRef: string
  amount: number
  status: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "CANCELLED" | "REFUND"
  createdAt: Date
  planName: string
}

const STATUS_LABEL: Record<InvoiceRow["status"], string> = {
  PENDING: "Menunggu",
  PAID: "Lunas",
  FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa",
  CANCELLED: "Dibatalkan",
  REFUND: "Refund",
}

const STATUS_TONE: Record<InvoiceRow["status"], BadgeProps["tone"]> = {
  PENDING: "amber",
  PAID: "sage",
  FAILED: "rose",
  EXPIRED: "stone",
  CANCELLED: "stone",
  REFUND: "rose",
}

export function InvoicesTable({ rows }: { rows: InvoiceRow[] }) {
  const columns = useMemo<ColumnDef<InvoiceRow>[]>(
    () => [
      {
        accessorKey: "createdAt",
        header: () => <span>Tanggal</span>,
        cell: ({ row }) => (
          <span className="text-sm text-stone-600">{formatDateID(row.original.createdAt)}</span>
        ),
      },
      {
        accessorKey: "merchantRef",
        header: () => <span>No. Invoice</span>,
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
        header: () => <span className="block text-right">Nominal</span>,
        cell: ({ row }) => (
          <span className="block text-right tabular-nums">{formatRupiah(row.original.amount)}</span>
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
        header: () => <span className="sr-only">Aksi</span>,
        cell: ({ row }) => (
          <Link
            href={`/dashboard/billing/invoices/${row.original.id}`}
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
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-rose-200 bg-white px-6 py-10 text-center text-sm text-stone-500">
        Belum ada tagihan. Pilih paket di tab Paket untuk memulai.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-rose-100 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-rose-50/40 text-xs uppercase tracking-[0.18em] text-stone-500">
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
        <tbody className="divide-y divide-rose-100">
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="px-4 py-4 align-middle first:pl-6 last:pr-6"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
