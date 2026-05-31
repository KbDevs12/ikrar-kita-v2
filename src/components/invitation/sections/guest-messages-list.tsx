import { prisma } from "@/server/db/prisma"
import { formatDateID } from "@/lib/utils"
import type { FormTone } from "./public-form-styles"

interface GuestMessagesListProps {
  invitationId: string
  tone?: FormTone
  /**
   * Maximum number of approved messages to render. Public pages should keep
   * this bounded so a viral invitation does not blow up the document size.
   */
  limit?: number
}

/**
 * Server-rendered list of approved guest messages. Re-rendered on
 * router.refresh() after a successful submit.
 */
export async function GuestMessagesList({
  invitationId,
  tone = "light",
  limit = 30,
}: GuestMessagesListProps) {
  const messages = await prisma.guestMessage.findMany({
    where: { invitationId, isApproved: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      name: true,
      message: true,
      createdAt: true,
    },
  })

  if (messages.length === 0) {
    return (
      <p
        className={
          "text-sm italic " +
          (tone === "dark" ? "text-white/55" : "text-current/55")
        }
      >
        Belum ada ucapan. Jadilah yang pertama menulis pesan untuk pasangan.
      </p>
    )
  }

  return (
    <ul
      className={
        "max-h-[420px] space-y-4 overflow-y-auto pr-1 " +
        (tone === "dark" ? "text-white/85" : "text-current/85")
      }
    >
      {messages.map((m) => (
        <li
          key={m.id}
          className={
            "rounded-lg border p-4 " +
            (tone === "dark"
              ? "border-white/10 bg-white/[0.03]"
              : "border-current/15 bg-white/55")
          }
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <span className="font-medium">{m.name}</span>
            <span
              className={
                "text-[11px] uppercase tracking-widest " +
                (tone === "dark" ? "text-white/45" : "text-current/45")
              }
            >
              {formatDateID(m.createdAt, {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
            {m.message}
          </p>
        </li>
      ))}
    </ul>
  )
}
