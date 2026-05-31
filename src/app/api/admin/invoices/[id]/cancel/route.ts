import "server-only"
import { adminCancelInvoiceSchema } from "@/lib/validators/admin"
import { requireAdmin } from "@/server/auth/guards"
import { prisma } from "@/server/db/prisma"
import { handleApiError, jsonError, jsonOk } from "@/server/http/response"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

interface Params {
  params: Promise<{ id: string }>
}

export async function POST(req: Request, ctx: Params): Promise<Response> {
  try {
    const session = await requireAdmin()
    const { id } = await ctx.params

    const body = await req.json().catch(() => ({}))
    const parsed = adminCancelInvoiceSchema.parse({ ...body, invoiceId: id })

    const invoice = await prisma.invoice.findUnique({ where: { id: parsed.invoiceId } })
    if (!invoice) {
      return jsonError(404, { code: "NOT_FOUND", message: "Invoice tidak ditemukan" })
    }
    if (invoice.status === "PAID") {
      return jsonError(409, {
        code: "ALREADY_PAID",
        message: "Invoice yang sudah lunas tidak bisa dibatalkan",
      })
    }

    const updated = await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        status: "CANCELLED",
        processedAt: new Date(),
        manualApprovalNote: parsed.reason || null,
        approvedByAdminId: session.user.id,
      },
    })

    await prisma.auditLog.create({
      data: {
        adminId: session.user.id,
        userId: invoice.userId,
        action: "invoice.cancel",
        entityType: "Invoice",
        entityId: invoice.id,
        metadata: { reason: parsed.reason ?? null, merchantRef: invoice.merchantRef },
      },
    })

    return jsonOk({ invoice: { id: updated.id, status: updated.status } })
  } catch (err) {
    return handleApiError(err)
  }
}
