"use client"

import { useState } from "react"
import * as Popover from "@radix-ui/react-popover"
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { applyCalendarDay, parseISO } from "@/lib/utils/datetime"

export type DatePickerProps = {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"] as const

const MONTHS = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
] as const

function formatLong(date: Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date)
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

/**
 * Date picker built on Radix Popover with a hand-rolled month grid using
 * native `Date`. Outputs a local-naive ISO string and preserves any existing
 * time-of-day on the value so changing the date does not wipe the hour set
 * by a TimePicker elsewhere.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  disabled,
}: DatePickerProps) {
  const selected = parseISO(value)
  const [open, setOpen] = useState(false)
  const [view, setView] = useState(() => {
    const base = selected ?? new Date()
    return { year: base.getFullYear(), month: base.getMonth() }
  })

  const today = new Date()

  function syncViewToSelection() {
    const base = parseISO(value) ?? new Date()
    setView({ year: base.getFullYear(), month: base.getMonth() })
  }

  function goPrevMonth() {
    setView((v) => {
      const m = v.month - 1
      return m < 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: m }
    })
  }

  function goNextMonth() {
    setView((v) => {
      const m = v.month + 1
      return m > 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: m }
    })
  }

  function pickDay(day: number) {
    onChange(applyCalendarDay(selected, view.year, view.month, day))
    setOpen(false)
  }

  const firstWeekday = new Date(view.year, view.month, 1).getDay()
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        if (next) syncViewToSelection()
        setOpen(next)
      }}
    >
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={selected ? `Tanggal terpilih ${formatLong(selected)}` : placeholder}
          className={cn(
            "flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-left text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-60",
            selected ? "text-stone-900" : "text-stone-400"
          )}
        >
          <span className="truncate">{selected ? formatLong(selected) : placeholder}</span>
          <CalendarDays className="h-4 w-4 shrink-0 text-rose-400" aria-hidden />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 w-[18rem] rounded-xl border border-rose-200 bg-white p-3 shadow-lg focus:outline-none"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrevMonth}
              aria-label="Bulan sebelumnya"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-500 hover:bg-rose-50 hover:text-stone-900"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <p className="text-sm font-medium text-stone-900">
              {MONTHS[view.month]} {view.year}
            </p>
            <button
              type="button"
              onClick={goNextMonth}
              aria-label="Bulan berikutnya"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-500 hover:bg-rose-50 hover:text-stone-900"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="py-1 text-center text-[11px] font-medium uppercase tracking-wide text-stone-400"
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} aria-hidden />
              const cellDate = new Date(view.year, view.month, day)
              const isSelected = selected ? isSameDay(cellDate, selected) : false
              const isToday = isSameDay(cellDate, today)
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => pickDay(day)}
                  aria-pressed={isSelected}
                  className={cn(
                    "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors",
                    isSelected
                      ? "bg-rose-500 font-medium text-white hover:bg-rose-600"
                      : "text-stone-700 hover:bg-rose-50",
                    !isSelected && isToday ? "ring-1 ring-rose-300" : ""
                  )}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
