"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const ITEMS = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/invoices", label: "Invoice" },
  { href: "/admin/users", label: "Pengguna" },
  { href: "/admin/subscriptions", label: "Langganan" },
  { href: "/admin/invitations", label: "Undangan" },
] as const

/**
 * Admin nav uses the same typographic vertical pattern as the dashboard
 * but in stone-tone instead of rose - the admin area is utility-first.
 */
export function AdminNav() {
  const pathname = usePathname()
  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin"
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
              active ? "text-stone-900" : "text-stone-500 hover:text-stone-900"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "block h-px transition-all",
                active ? "w-6 bg-stone-900" : "w-2 bg-stone-300 group-hover:w-4"
              )}
            />
            <span className={cn("font-display", active ? "italic" : "")}>{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
