import Link from "next/link"
import { requireAdminOrRedirect } from "@/server/auth/guards"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminOrRedirect()
  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-background">
      <aside className="flex flex-col border-r border-border bg-card">
        <div className="border-b border-border px-5 py-5">
          <Link href="/admin" className="font-display text-lg">
            Ikrar Kita
          </Link>
          <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
            Admin · {session.user.name}
          </p>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-4 text-sm">
          <NavLink href="/admin">Ringkasan</NavLink>
          <NavLink href="/admin/users">Pengguna</NavLink>
          <NavLink href="/admin/invoices">Invoice</NavLink>
          <NavLink href="/admin/subscriptions">Langganan</NavLink>
          <NavLink href="/admin/invitations">Undangan</NavLink>
          <div className="my-3 border-t border-border" />
          <NavLink href="/dashboard">← Kembali ke dasbor</NavLink>
        </nav>
        <form action="/api/auth/logout" method="post" className="border-t border-border px-3 py-3">
          <button
            className="w-full rounded-md px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            type="submit"
          >
            Keluar
          </button>
        </form>
      </aside>
      <main className="overflow-y-auto">{children}</main>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {children}
    </Link>
  )
}
