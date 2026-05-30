/**
 * Local wall-clock date/time helpers for the invitation builder pickers.
 *
 * Wedding event times are wall-clock ("akad pukul 08:00") and must NOT drift
 * with timezone conversion. So every value the pickers emit is a local-naive
 * ISO 8601 string of the form `YYYY-MM-DDTHH:mm:ss` (no trailing `Z`, no
 * offset). `Date.parse` treats such strings as local time, which is exactly
 * what the validator (`z.string().refine(v => !Number.isNaN(Date.parse(v)))`)
 * accepts and what the previous native `datetime-local` inputs produced -
 * so this stays backward compatible with existing drafts.
 */

function pad2(n: number): string {
  return String(n).padStart(2, "0")
}

/**
 * Format a `Date` as a local-naive ISO string `YYYY-MM-DDTHH:mm:ss`.
 * Seconds are included so the result is unambiguously parsed as local time.
 */
export function toLocalISOString(date: Date): string {
  return (
    `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}` +
    `T${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())}`
  )
}

/**
 * Parse an ISO-ish string into a `Date`, or return `null` when it is empty
 * or unparseable. Accepts the formats produced here as well as legacy
 * `datetime-local` values (`YYYY-MM-DDTHH:mm`).
 */
export function parseISO(value: string | undefined | null): Date | null {
  if (!value) return null
  const ts = Date.parse(value)
  if (Number.isNaN(ts)) return null
  return new Date(ts)
}

/**
 * Build a local ISO string from a base date (for the Y/M/D part) plus an
 * explicit hour and minute. Seconds and milliseconds are zeroed.
 */
export function combineDateWithTime(base: Date, hours: number, minutes: number): string {
  return toLocalISOString(
    new Date(base.getFullYear(), base.getMonth(), base.getDate(), hours, minutes, 0, 0)
  )
}

/**
 * Re-base a date/time string onto a new calendar day while preserving its
 * hour and minute. Used when the event date changes and the schedule items
 * must follow it without losing the times the user already picked.
 *
 * Empty or unparseable inputs are returned unchanged so a not-yet-filled
 * schedule time stays empty (and therefore still required).
 */
export function rebaseDateKeepTime(value: string, targetDateISO: string): string {
  const current = parseISO(value)
  const target = parseISO(targetDateISO)
  if (!current || !target) return value
  return combineDateWithTime(target, current.getHours(), current.getMinutes())
}

/**
 * Apply a calendar day (from `dayY/M/D`) to an existing value while keeping
 * its time-of-day. If the previous value has no time, midnight is used.
 */
export function applyCalendarDay(
  previous: Date | null,
  year: number,
  monthIndex: number,
  day: number
): string {
  const hours = previous ? previous.getHours() : 0
  const minutes = previous ? previous.getMinutes() : 0
  const seconds = previous ? previous.getSeconds() : 0
  return toLocalISOString(new Date(year, monthIndex, day, hours, minutes, seconds, 0))
}
