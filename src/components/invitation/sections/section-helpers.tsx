/**
 * Small helpers used by templates. These are deliberately layout-agnostic -
 * they only deal with formatting and data shaping. Each template controls
 * its own layout primitives.
 */
import { formatDateID } from "@/lib/utils"

export interface ScheduleItemData {
  label: string
  startsAt: string
  endsAt?: string
  notes?: string
}

export function formatScheduleRange(item: ScheduleItemData): string {
  const start = new Date(item.startsAt)
  const time = (d: Date) =>
    d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" })
  if (item.endsAt) {
    const end = new Date(item.endsAt)
    return `${time(start)} – ${time(end)} WIB`
  }
  return `Pukul ${time(start)} WIB`
}

export function formatScheduleDate(item: ScheduleItemData): string {
  return formatDateID(new Date(item.startsAt), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

/**
 * Compute remaining time to a target date in days/hours/minutes/seconds.
 * Pure - safe for SSR. The animated countdown ticker is a client component
 * that calls this every second.
 */
export function computeCountdown(target: Date, now = new Date()) {
  const diff = Math.max(0, target.getTime() - now.getTime())
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)
  return { days, hours, minutes, seconds, finished: diff === 0 }
}
