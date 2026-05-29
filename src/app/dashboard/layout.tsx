import Link from "next/link"
import { redirect } from "next/navigation"
import { requireSessionOrRedirect } from "@/server/auth/guards"
import { Role } from "@prisma/client"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSessionOrRedirect()
  if (session.user.emailVerifiedAt === null) redirect("/verify-email/pending")

  const isAdmin = session.user.role === Role.ADMIN

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr] bg-background">
      <aside className="flex flex-col border-r border-border bg-card">
        <div className="border-b border-border px-5 py-5">
          <Link href="/dashboard" className="font-display text-lg">
            Ikrar Kita
          </Link>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            {session.user.email}
          </p>
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-4 text-sm">
          <NavLink href="/dashboard">Ringkasan</NavLink>
          <NavLink href="/dashboard/invitations">Undangan</NavLink>
          <NavLink href="/dashboard/billing">Langganan</NavLink>
          <NavLink href="/dashboard/settings">Pengaturan</NavLink>
          {isAdmin ? (
            <>
              <div className="my-3 border-t border-border" />
              <NavLink href="/admin">Admin</NavLink>
            </>
          ) : null}
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
