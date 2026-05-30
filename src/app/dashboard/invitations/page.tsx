import Link from "next/link"
import { requireVerifiedUserOrRedirect } from "@/server/auth/guards"
import { prisma } from "@/server/db/prisma"
import { InvitationsTable } from "@/components/dashboard/invitations-table"

export const dynamic = "force-dynamic"

export default async function InvitationsPage() {
  const session = await requireVerifiedUserOrRedirect()
  const items = await prisma.invitation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  })

  return (
    <article className="px-8 py-12 lg:px-14 lg:py-16">
      <header className="mb-12 flex flex-wrap items-end justify-between gap-6 border-b border-rose-100 pb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.32em] text-rose-500">Undangan</p>
          <h1 className="mt-3 font-display text-5xl leading-[1] tracking-tight text-stone-900 md:text-6xl">
            Daftar undangan Anda
          </h1>
          <p className="mt-3 max-w-md text-sm text-stone-500">
            {items.length === 0
              ? "Belum ada apa-apa di sini. Buat satu draf, kapan saja Anda siap."
              : "Pratinjau, ubah, atau publikasikan dari satu tempat."}
          </p>
        </div>
        <Link
          href="/dashboard/invitations/new"
          className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-rose-600"
        >
          + Undangan baru
        </Link>
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-white px-8 py-16 text-center">
          <p className="font-display text-3xl text-stone-900">
            Mulai dari satu draf. <span className="italic text-rose-500">Gratis.</span>
          </p>
          <Link
            href="/dashboard/invitations/new"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-rose-500 px-6 py-3 text-sm text-white hover:bg-rose-600"
          >
            Buat undangan pertama
          </Link>
        </div>
      ) : (
        <InvitationsTable rows={items} />
      )}
    </article>
  )
}
