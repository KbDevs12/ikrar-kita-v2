"use client"

import { useState } from "react"
import * as Popover from "@radix-ui/react-popover"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { combineDateWithTime, parseISO } from "@/lib/utils/datetime"

export type TimePickerProps = {
  value?: string
  /**
   * The event date the time belongs to. The picker only chooses hour/minute;
   * the calendar day is inherited from here so a schedule item always lands
   * on the event day.
   */
  dateValue?: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

const HOURS: number[] = Array.from({ length: 24 }, (_, i) => i)
const MINUTES: number[] = Array.from({ length: 12 }, (_, i) => i * 5)

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

/**
 * Time picker built on Radix Popover. Two scrollable columns (hours 00-23,
 * minutes in 5-minute steps). Outputs a local-naive ISO string whose date
 * part is inherited from `dateValue` (the event date), falling back to the
 * existing value's date, then to today. Seconds/ms are zeroed.
 */
export function TimePicker({
  value,
  dateValue,
  onChange,
  placeholder = "Pilih waktu",
  disabled,
}: TimePickerProps) {
  const [open, setOpen] = useState(false)
  const current = parseISO(value)
  const selectedHour = current ? current.getHours() : null
  const selectedMinute = current ? current.getMinutes() : null

  function baseDate(): Date {
    return parseISO(dateValue) ?? current ?? new Date()
  }

  function emit(hour: number, minute: number) {
    onChange(combineDateWithTime(baseDate(), hour, minute))
  }

  function pickHour(hour: number) {
    emit(hour, selectedMinute ?? 0)
  }

  function pickMinute(minute: number) {
    emit(selectedHour ?? 0, minute)
  }

  const label =
    selectedHour !== null && selectedMinute !== null
      ? `${pad2(selectedHour)}:${pad2(selectedMinute)}`
      : placeholder

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          aria-label={
            selectedHour !== null && selectedMinute !== null
              ? `Waktu terpilih ${label}`
              : placeholder
          }
          className={cn(
            "flex h-11 w-full items-center justify-between gap-2 rounded-lg border border-rose-200 bg-white px-4 py-2.5 text-left text-sm tabular-nums focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-60",
            selectedHour !== null ? "text-stone-900" : "text-stone-400"
          )}
        >
          <span>{label}</span>
          <Clock className="h-4 w-4 shrink-0 text-rose-400" aria-hidden />
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          className="z-50 w-[14rem] rounded-xl border border-rose-200 bg-white p-2 shadow-lg focus:outline-none"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-stone-400">
                Jam
              </p>
              <ul className="max-h-48 overflow-y-auto pr-1" aria-label="Pilih jam">
                {HOURS.map((h) => (
                  <li key={h}>
                    <button
                      type="button"
                      onClick={() => pickHour(h)}
                      aria-pressed={selectedHour === h}
                      className={cn(
                        "w-full rounded-md px-3 py-1.5 text-left text-sm tabular-nums transition-colors",
                        selectedHour === h
                          ? "bg-rose-500 font-medium text-white"
                          : "text-stone-700 hover:bg-rose-50"
                      )}
                    >
                      {pad2(h)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-stone-400">
                Menit
              </p>
              <ul className="max-h-48 overflow-y-auto pr-1" aria-label="Pilih menit">
                {MINUTES.map((m) => (
                  <li key={m}>
                    <button
                      type="button"
                      onClick={() => pickMinute(m)}
                      aria-pressed={selectedMinute === m}
                      className={cn(
                        "w-full rounded-md px-3 py-1.5 text-left text-sm tabular-nums transition-colors",
                        selectedMinute === m
                          ? "bg-rose-500 font-medium text-white"
                          : "text-stone-700 hover:bg-rose-50"
                      )}
                    >
                      {pad2(m)}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
