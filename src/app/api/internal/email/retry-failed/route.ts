import "server-only"
import { z } from "zod"
import { prisma } from "@/server/db/prisma"
import {
  requireInternalApiKey,
  UnauthorizedError,
  unauthorizedResponse,
} from "@/server/security/api-key"
import { handleApiError, jsonOk } from "@/server/http/response"
import { EmailEventType } from "@prisma/client"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const bodySchema = z.object({
  limit: z.number().int().min(1).max(50).default(10),
  hours: z.number().int().min(1).max(168).default(24),
})

/**
 * Internal: retry email events that failed in the last N hours.
 *
 * Re-sends:
 *   - INVOICE_CREATED_USER  (rebuilt from the invoice + user + plan)
 *   - VERIFICATION          (issues a new token)
 *
 * Other event types are surfaced as `skipped` so an operator can decide.
 *
 * The retry is best-effort; failures are written to a fresh EmailEvent row.
 */
export async function POST(req: Request): Promise<Response> {
  try {
    requireInternalApiKey(req)
  } catch (e) {
    if (e instanceof UnauthorizedError) return unauthorizedResponse()
    throw e
  }

  try {
    const body = await req.json().catch(() => ({}))
    const parsed = bodySchema.parse(body)

    const since = new Date(Date.now() - parsed.hours * 60 * 60 * 1000)
    const failed = await prisma.emailEvent.findMany({
      where: { status: "FAILED", createdAt: { gte: since } },
      orderBy: { createdAt: "desc" },
      take: parsed.limit,
    })

    let retried = 0
    let skipped = 0
    let failedAgain = 0

    for (const ev of failed) {
      try {
        if (ev.type === EmailEventType.VERIFICATION && ev.userId) {
          const user = await prisma.user.findUnique({ where: { id: ev.userId } })
          if (!user || user.emailVerifiedAt) {
            skipped++
            continue
          }
          const { sendInitialVerification } = await import("@/server/email/verification")
          await sendInitialVerification(user)
          retried++
          continue
        }
        if (ev.type === EmailEventType.INVOICE_CREATED_USER && ev.invoiceId) {
          const invoice = await prisma.invoice.findUnique({
            where: { id: ev.invoiceId },
            include: { user: true, plan: true },
          })
          if (!invoice) {
            skipped++
            continue
          }
          const { sendInvoiceCreatedEmailToUser } = await import("@/server/email/email-service")
          await sendInvoiceCreatedEmailToUser({
            invoice,
            user: invoice.user,
            planName: invoice.plan.name,
          })
          retried++
          continue
        }
        skipped++
      } catch (err) {
        console.error(`[email-retry] event ${ev.id} failed:`, err)
        failedAgain++
      }
    }

    return jsonOk({ examined: failed.length, retried, skipped, failedAgain })
  } catch (err) {
    return handleApiError(err)
  }
}
