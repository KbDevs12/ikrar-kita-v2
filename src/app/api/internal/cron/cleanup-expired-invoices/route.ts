import "server-only"
import { prisma } from "@/server/db/prisma"
import { requireCronSecret, UnauthorizedError, unauthorizedResponse } from "@/server/security/api-key"
import { jsonOk } from "@/server/http/response"
import { sendInvoiceExpiredEmailToUser } from "@/server/email/email-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Cron: mark PENDING invoices whose expiredAt has passed as EXPIRED.
 *
 * We do this at the application layer rather than relying solely on the
 * Tripay callback because the callback for an expired transaction can be
 * delayed or missed. Idempotent.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    requireCronSecret(req)
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse()
    throw e
  }

  const now = new Date()
  const stale = await prisma.invoice.findMany({
    where: { status: "PENDING", expiredAt: { lt: now } },
    include: { user: true, plan: true },
  })

  if (stale.length === 0) {
    return jsonOk({ expired: 0 })
  }

  await prisma.invoice.updateMany({
    where: { id: { in: stale.map((i) => i.id) } },
    data: { status: "EXPIRED", processedAt: now },
  })

  // Best-effort notification - do not block on SMTP
  await Promise.allSettled(
    stale.map((inv) =>
      sendInvoiceExpiredEmailToUser({
        invoice: inv,
        user: inv.user,
        planName: inv.plan.name,
      })
    )
  )

  return jsonOk({ expired: stale.length })
}
