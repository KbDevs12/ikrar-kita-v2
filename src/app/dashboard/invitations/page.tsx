import Link from "next/link"
import { requireVerifiedUserOrRedirect } from "@/server/auth/guards"
import { prisma } from "@/server/db/prisma"
import { formatDateID } from "@/lib/utils"

export const dynamic = "force-dynamic"

const STATUS_BADGE: Record<string, string> = {
  DRAFT: "bg-muted text-muted-foreground",
  PUBLISHED: "bg-sage-100 text-sage-700",
  ARCHIVED: "bg-rose-50 text-rose-700",
}

export default async function InvitationsPage() {
  const session = await requireVerifiedUserOrRedirect()
  const items = await prisma.invitation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <div className="px-8 py-10">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Undangan</p>
          <h1 className="mt-1 font-display text-3xl">Daftar undangan</h1>
        </div>
        <Link
          href="/dashboard/invitations/new"
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
        >
          + Buat undangan
        </Link>
      </header>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="font-display text-xl">Belum ada undangan</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Mulai dari satu draft. Tidak perlu langganan untuk membuat draft.
          </p>
          <Link
            href="/dashboard/invitations/new"
            className="mt-5 inline-block rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
          >
            Buat undangan pertama
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Pasangan</th>
                <th className="px-4 py-3 text-left font-medium">Slug</th>
                <th className="px-4 py-3 text-left font-medium">Tanggal acara</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((i) => (
                <tr key={i.id}>
                  <td className="px-4 py-3 font-medium">
                    {i.groomName} &amp; {i.brideName}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    /{i.slug}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {i.eventDate ? formatDateID(i.eventDate) : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                        STATUS_BADGE[i.status] ?? "bg-muted"
                      }`}
                    >
                      {i.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/invitations/${i.id}/edit`}
                      className="mr-3 text-primary hover:underline"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/dashboard/invitations/${i.id}/preview`}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Pratinjau
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
