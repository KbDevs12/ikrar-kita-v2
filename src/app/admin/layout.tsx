import Link from "next/link"
import { requireAdminOrRedirect } from "@/server/auth/guards"
import { Avatar } from "@/components/ui/avatar"
import { AdminNav } from "@/components/admin/admin-nav"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminOrRedirect()
  return (
    <div className="grid min-h-screen grid-cols-1 bg-stone-50 lg:grid-cols-[260px_1fr]">
      <aside className="hidden border-r border-stone-200 bg-white lg:flex lg:flex-col">
        <div className="px-8 py-8">
          <Link href="/admin" className="font-display text-2xl tracking-tight text-stone-900">
            Ikrar Kita
          </Link>
          <p className="mt-1 text-xs uppercase tracking-[0.32em] text-rose-500">
            Konsol admin
          </p>
        </div>
        <AdminNav />
        <div className="mt-auto border-t border-stone-200 p-6">
          <div className="flex items-center gap-3">
            <Avatar name={session.user.name} size={10} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-stone-900">
                {session.user.name}
              </p>
              <p className="truncate text-xs text-stone-500">{session.user.email}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-stone-500">
            <Link href="/dashboard" className="hover:text-stone-900">
              ← Kembali ke dasbor
            </Link>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="hover:text-rose-600">Keluar</button>
            </form>
          </div>
        </div>
      </aside>

      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-4 py-3 lg:hidden">
        <Link href="/admin" className="font-display text-lg tracking-tight text-stone-900">
          Admin · Ikrar Kita
        </Link>
        <Link href="/dashboard" className="text-xs text-stone-500">
          Ke dasbor
        </Link>
      </header>

      <main className="overflow-y-auto">{children}</main>
    </div>
  )
}
