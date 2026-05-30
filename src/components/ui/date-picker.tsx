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
  /**
   * Earliest selectable date (ISO string). Days before it render dimmed and
   * cannot be picked. The builder passes today so the event date can never be
   * set in the past. When omitted, every date is selectable.
   */
  minDate?: string
}

type Mode = "days" | "months" | "years"

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

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
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

function startOfDay(date: Date): Date {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy
}

/**
 * Date picker built on Radix Popover with a hand-rolled month grid using
 * native `Date`. Outputs a local-naive ISO string and preserves any existing
 * time-of-day on the value so changing the date does not wipe the hour set
 * by a TimePicker elsewhere.
 *
 * Supports a `minDate` floor (dates before it are dimmed + disabled) and a
 * year -> month -> day drill-down for fast navigation across years.
 */
export function DatePicker({
  value,
  onChange,
  placeholder = "Pilih tanggal",
  disabled,
  minDate,
}: DatePickerProps) {
  const selected = parseISO(value)
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<Mode>("days")
  const [view, setView] = useState(() => {
    const base = selected ?? new Date()
    return { year: base.getFullYear(), month: base.getMonth() }
  })

  const today = new Date()
  const min = minDate ? startOfDay(new Date(minDate)) : null

  function syncViewToSelection() {
    const base = parseISO(value) ?? new Date()
    setView({ year: base.getFullYear(), month: base.getMonth() })
    setMode("days")
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

  function isDateBeforeMin(date: Date): boolean {
    if (!min) return false
    return startOfDay(date) < min
  }

  function isDisabled(day: number): boolean {
    return isDateBeforeMin(new Date(view.year, view.month, day))
  }

  function isYearDisabled(year: number): boolean {
    if (!min) return false
    return year < min.getFullYear()
  }

  function isMonthDisabled(monthIndex: number): boolean {
    if (!min) return false
    if (view.year < min.getFullYear()) return true
    if (view.year === min.getFullYear() && monthIndex < min.getMonth()) return true
    return false
  }

  function pickDay(day: number) {
    if (isDisabled(day)) return
    onChange(applyCalendarDay(selected, view.year, view.month, day))
    setOpen(false)
  }

  function pickToday() {
    const t = new Date()
    onChange(applyCalendarDay(selected, t.getFullYear(), t.getMonth(), t.getDate()))
    setView({ year: t.getFullYear(), month: t.getMonth() })
    setOpen(false)
  }

  const firstWeekday = new Date(view.year, view.month, 1).getDay()
  const daysInMonth = new Date(view.year, view.month + 1, 0).getDate()
  const cells: Array<number | null> = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const yearRange = Array.from({ length: 11 }, (_, i) => view.year - 5 + i)
  const todayDisabled = isDateBeforeMin(today)

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
          <CalendarDays
            className={cn("h-4 w-4 shrink-0", selected ? "text-rose-400" : "text-stone-400")}
            aria-hidden
          />
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
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-500 hover:bg-rose-50 hover:text-stone-900",
                mode !== "days" && "pointer-events-none opacity-0"
              )}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setMode((m) => (m === "days" ? "years" : "days"))}
              aria-label="Pilih bulan dan tahun"
              className="rounded-md px-2 py-1 text-sm font-medium text-stone-900 hover:bg-rose-50"
            >
              {mode === "years"
                ? `${yearRange[0]} – ${yearRange[yearRange.length - 1]}`
                : mode === "months"
                  ? view.year
                  : `${MONTHS[view.month]} ${view.year}`}
            </button>
            <button
              type="button"
              onClick={goNextMonth}
              aria-label="Bulan berikutnya"
              className={cn(
                "inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-500 hover:bg-rose-50 hover:text-stone-900",
                mode !== "days" && "pointer-events-none opacity-0"
              )}
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>

          {mode === "years" ? (
            <div className="grid grid-cols-4 gap-1.5">
              {yearRange.map((year) => {
                const yDisabled = isYearDisabled(year)
                const isPast = year < today.getFullYear()
                return (
                  <button
                    key={year}
                    type="button"
                    disabled={yDisabled}
                    onClick={() => {
                      if (yDisabled) return
                      setView((v) => ({ ...v, year }))
                      setMode("months")
                    }}
                    className={cn(
                      "inline-flex h-10 items-center justify-center rounded-md text-sm tabular-nums transition-colors",
                      year === view.year
                        ? "bg-rose-500 font-medium text-white hover:bg-rose-600"
                        : "text-stone-700 hover:bg-rose-50",
                      yDisabled
                        ? "cursor-not-allowed opacity-40 hover:bg-transparent"
                        : isPast && year !== view.year
                          ? "opacity-50"
                          : ""
                    )}
                  >
                    {year}
                  </button>
                )
              })}
            </div>
          ) : mode === "months" ? (
            <div className="grid grid-cols-3 gap-1.5">
              {MONTHS_SHORT.map((label, monthIndex) => {
                const mDisabled = isMonthDisabled(monthIndex)
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={mDisabled}
                    onClick={() => {
                      if (mDisabled) return
                      setView((v) => ({ ...v, month: monthIndex }))
                      setMode("days")
                    }}
                    className={cn(
                      "inline-flex h-10 items-center justify-center rounded-md text-sm transition-colors",
                      monthIndex === view.month
                        ? "bg-rose-500 font-medium text-white hover:bg-rose-600"
                        : "text-stone-700 hover:bg-rose-50",
                      mDisabled ? "cursor-not-allowed opacity-40 hover:bg-transparent" : ""
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          ) : (
            <>
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

              <div
                key={`${view.year}-${view.month}`}
                className="grid grid-cols-7 gap-1 duration-150 animate-in fade-in"
              >
                {cells.map((day, i) => {
                  if (day === null) return <div key={`empty-${i}`} aria-hidden />
                  const cellDate = new Date(view.year, view.month, day)
                  const isSelected = selected ? isSameDay(cellDate, selected) : false
                  const isToday = isSameDay(cellDate, today)
                  const dayDisabled = isDisabled(day)
                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={dayDisabled}
                      onClick={() => pickDay(day)}
                      aria-pressed={isSelected}
                      className={cn(
                        "inline-flex h-9 w-9 items-center justify-center rounded-md text-sm transition-colors",
                        isSelected
                          ? "bg-rose-500 font-medium text-white hover:bg-rose-600"
                          : "text-stone-700 hover:bg-rose-50",
                        !isSelected && isToday ? "ring-1 ring-rose-300" : "",
                        dayDisabled ? "cursor-not-allowed opacity-40 hover:bg-transparent" : ""
                      )}
                    >
                      {day}
                    </button>
                  )
                })}
              </div>

              {todayDisabled ? null : (
                <button
                  type="button"
                  onClick={pickToday}
                  className="mt-2 w-full rounded-md py-1.5 text-center text-xs font-medium text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                >
                  Hari ini
                </button>
              )}
            </>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
