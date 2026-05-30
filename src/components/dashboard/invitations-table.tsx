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
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { formatDateID } from "@/lib/utils"

export interface InvitationRow {
  id: string
  slug: string
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED"
  groomName: string
  brideName: string
  eventDate: Date | null
  updatedAt: Date
}

const STATUS_TONE = {
  DRAFT: "stone",
  PUBLISHED: "sage",
  ARCHIVED: "stone",
} as const

interface InvitationsTableProps {
  rows: InvitationRow[]
}

/**
 * Sortable, filterable invitation table. Built on @tanstack/react-table so
 * the same primitive can power admin invoice tables next door without
 * re-implementing sort/filter logic.
 *
 * Pagination is omitted by design - personal dashboards rarely cross 30 rows
 * and a "showing 5 of 27" footer is a common AI tell. The whole list scrolls
 * naturally; admin tables in /admin/invoices are where pagination lives.
 */
export function InvitationsTable({ rows }: InvitationsTableProps) {
  const [filter, setFilter] = useState("")

  const columns = useMemo<ColumnDef<InvitationRow>[]>(
    () => [
      {
        accessorKey: "groomName",
        id: "couple",
        header: ({ column }) => (
          <SortableHeader
            label="Pasangan"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-display text-base text-stone-900">
              {row.original.groomName}{" "}
              <span className="text-stone-400">&amp;</span>{" "}
              {row.original.brideName}
            </p>
            <p className="truncate font-mono text-xs text-stone-400">
              /{row.original.slug}
            </p>
          </div>
        ),
        sortingFn: (a, b) =>
          `${a.original.groomName}${a.original.brideName}`.localeCompare(
            `${b.original.groomName}${b.original.brideName}`
          ),
        filterFn: (row, _id, value) => {
          const q = String(value).toLowerCase()
          if (!q) return true
          return (
            row.original.groomName.toLowerCase().includes(q) ||
            row.original.brideName.toLowerCase().includes(q) ||
            row.original.slug.toLowerCase().includes(q)
          )
        },
      },
      {
        accessorKey: "eventDate",
        header: ({ column }) => (
          <SortableHeader
            label="Tanggal acara"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          />
        ),
        cell: ({ row }) => (
          <span className="text-sm text-stone-600">
            {row.original.eventDate ? formatDateID(row.original.eventDate) : "—"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: () => <span>Status</span>,
        cell: ({ row }) => (
          <Badge tone={STATUS_TONE[row.original.status]}>
            {row.original.status.toLowerCase()}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <span className="sr-only">Aksi</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-4 text-sm">
            <Link
              href={`/dashboard/invitations/${row.original.id}/preview`}
              className="text-stone-600 hover:text-rose-600"
            >
              Pratinjau
            </Link>
            <Link
              href={`/dashboard/invitations/${row.original.id}/edit`}
              className="font-medium text-rose-600 hover:underline"
            >
              Edit →
            </Link>
          </div>
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
          placeholder="Cari nama pasangan atau slug…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
        <span className="text-xs text-stone-500">
          {table.getFilteredRowModel().rows.length} undangan
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-rose-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-rose-50/40 text-xs uppercase tracking-[0.18em] text-stone-500">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th key={h.id} className="px-4 py-3 font-medium first:pl-6 last:pr-6 last:text-right">
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-rose-100">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-stone-500">
                  Tidak ada undangan yang cocok dengan pencarian.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-rose-50/30">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-4 align-middle first:pl-6 last:pr-6 last:text-right"
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

function SortableHeader({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-stone-500 hover:text-stone-900"
    >
      {label}
      <ArrowUpDown className="h-3 w-3" aria-hidden />
    </button>
  )
}
