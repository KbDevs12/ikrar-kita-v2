"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface DashboardNavProps {
  isAdmin?: boolean
}

const ITEMS = [
  { href: "/dashboard", label: "Ringkasan" },
  { href: "/dashboard/invitations", label: "Undangan" },
  { href: "/dashboard/billing", label: "Langganan" },
  { href: "/dashboard/settings", label: "Pengaturan" },
] as const

/**
 * Typographic vertical nav. No icons - the dashboard intentionally drops
 * the icon+label SaaS pattern. Active state is a serif italic switch with
 * a small rose dash, so the eye lands on it without reading every line.
 */
export function DashboardNav({ isAdmin }: DashboardNavProps) {
  const pathname = usePathname()
  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname?.startsWith(href) ?? false
  }

  return (
    <nav className="flex flex-col gap-1 px-6 text-sm">
      {ITEMS.map((item) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group relative flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors",
              active ? "text-rose-600" : "text-stone-600 hover:text-stone-900"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "block h-px transition-all",
                active ? "w-6 bg-rose-400" : "w-2 bg-stone-300 group-hover:w-4"
              )}
            />
            <span className={cn("font-display", active ? "italic" : "")}>{item.label}</span>
          </Link>
        )
      })}

      {isAdmin ? (
        <>
          <span className="mx-2 my-3 h-px bg-rose-100" aria-hidden />
          <Link
            href="/admin"
            className={cn(
              "rounded-md px-2 py-2.5 text-xs uppercase tracking-[0.32em]",
              pathname?.startsWith("/admin")
                ? "text-rose-600"
                : "text-stone-500 hover:text-stone-900"
            )}
          >
            Area admin
          </Link>
        </>
      ) : null}
    </nav>
  )
}
