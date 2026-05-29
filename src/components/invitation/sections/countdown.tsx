"use client"

import { useEffect, useState } from "react"
import { computeCountdown } from "./section-helpers"

interface CountdownProps {
  target: string // ISO
  variant?: "classic" | "minimal" | "soft"
}

const labels = ["Hari", "Jam", "Menit", "Detik"] as const

export function Countdown({ target, variant = "classic" }: CountdownProps) {
  const targetDate = new Date(target)
  const [state, setState] = useState(() => computeCountdown(targetDate))

  useEffect(() => {
    const t = window.setInterval(() => setState(computeCountdown(targetDate)), 1000)
    return () => window.clearInterval(t)
  }, [targetDate])

  const cells: Array<[string, number]> = [
    [labels[0], state.days],
    [labels[1], state.hours],
    [labels[2], state.minutes],
    [labels[3], state.seconds],
  ]

  if (variant === "minimal") {
    return (
      <div className="flex items-baseline gap-x-8 gap-y-2 font-mono text-sm tabular-nums">
        {cells.map(([label, value]) => (
          <span key={label} className="flex items-baseline gap-1.5">
            <strong className="font-display text-3xl font-normal">{String(value).padStart(2, "0")}</strong>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
          </span>
        ))}
      </div>
    )
  }

  if (variant === "soft") {
    return (
      <div className="grid grid-cols-4 gap-2">
        {cells.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl bg-white/70 px-3 py-3 text-center shadow-sm ring-1 ring-rose-200/60 backdrop-blur"
          >
            <div className="font-display text-2xl text-rose-800">{String(value).padStart(2, "0")}</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-widest text-rose-500">{label}</div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-end justify-center gap-6 sm:gap-10">
      {cells.map(([label, value]) => (
        <div key={label} className="text-center">
          <div className="font-display text-4xl tabular-nums sm:text-5xl">
            {String(value).padStart(2, "0")}
          </div>
          <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</div>
        </div>
      ))}
    </div>
  )
}
