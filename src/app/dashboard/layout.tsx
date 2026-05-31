import Link from "next/link"
import { redirect } from "next/navigation"
import { requireSessionOrRedirect } from "@/server/auth/guards"
import { Role } from "@prisma/client"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Avatar } from "@/components/ui/avatar"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSessionOrRedirect()
  if (session.user.emailVerifiedAt === null) redirect("/verify-email/pending")

  return (
    <div className="grid min-h-screen grid-cols-1 bg-rose-50/30 lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-rose-100 bg-white lg:flex lg:flex-col">
        <div className="px-8 py-8">
          <Link href="/dashboard" className="font-display text-2xl tracking-tight text-stone-900">
            Ikrar Kita
          </Link>
          <p className="mt-1 text-xs text-stone-500">Dasbor pengundang</p>
        </div>
        <DashboardNav isAdmin={session.user.role === Role.ADMIN} />
        <div className="mt-auto border-t border-rose-100 p-6">
          <div className="flex items-center gap-3">
            <Avatar name={session.user.name} size={10} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-stone-900">
                {session.user.name}
              </p>
              <p className="truncate text-xs text-stone-500">{session.user.email}</p>
            </div>
          </div>
          <form action="/api/auth/logout" method="post" className="mt-4">
            <button
              type="submit"
              className="text-xs text-stone-500 underline-offset-4 hover:text-rose-600 hover:underline"
            >
              Keluar dari sesi ini
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile chrome - sidebar collapses to a single bar with the brand
          and a tap-to-show menu (handled inside DashboardNav for small
          screens). Keeps the cockpit usable on phones without a heavy
          drawer library. */}
      <header className="flex items-center justify-between border-b border-rose-100 bg-white px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="font-display text-lg tracking-tight text-stone-900">
          Ikrar Kita
        </Link>
        <span className="text-xs text-stone-500">{session.user.name}</span>
      </header>

      <main className="overflow-y-auto">{children}</main>
    </div>
  )
}
