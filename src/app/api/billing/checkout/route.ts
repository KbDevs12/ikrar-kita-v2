import "server-only"
import { checkoutSchema } from "@/lib/validators/billing"
import { CheckoutError, createCheckout } from "@/server/billing/checkout-service"
import { rateLimit, RATE_LIMITS } from "@/server/cache/rate-limit"
import { requireVerifiedUser } from "@/server/auth/guards"
import { handleApiError, jsonError, jsonOk } from "@/server/http/response"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request): Promise<Response> {
  try {
    const session = await requireVerifiedUser()

    const rl = await rateLimit({
      identifier: session.user.id,
      action: "checkout",
      ...RATE_LIMITS.checkout,
    })
    if (!rl.ok) {
      return jsonError(429, {
        code: "RATE_LIMITED",
        message: "Terlalu banyak permintaan checkout. Coba lagi nanti.",
      })
    }

    const body = await req.json().catch(() => null)
    if (!body) return jsonError(400, { code: "BAD_REQUEST", message: "Body tidak valid" })
    const parsed = checkoutSchema.parse(body)

    const result = await createCheckout(session.user, parsed)

    return jsonOk({
      invoice: {
        id: result.invoice.id,
        merchantRef: result.invoice.merchantRef,
        amount: result.invoice.amount,
        status: result.invoice.status,
        paymentMethodCode: result.invoice.paymentMethodCode,
        paymentMethodName: result.invoice.paymentMethodName,
        checkoutUrl: result.invoice.tripayCheckoutUrl,
        payCode: result.invoice.tripayPayCode,
        qrUrl: result.invoice.tripayQrUrl,
        expiredAt: result.invoice.expiredAt,
      },
    })
  } catch (err) {
    if (err instanceof CheckoutError) {
      const status =
        err.code === "EMAIL_NOT_VERIFIED" ? 403 : err.code === "PLAN_NOT_FOUND" ? 404 : 502
      return jsonError(status, { code: err.code, message: err.message })
    }
    return handleApiError(err)
  }
}
