import "server-only"
import { handleTripayCallback } from "@/server/billing/callback-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Tripay webhook endpoint.
 *
 * IMPORTANT: we read the raw body as text BEFORE doing anything else.
 * Signature verification depends on the bytes Tripay sent, not on a
 * re-stringified JSON object.
 *
 * We always respond 200 with a small JSON payload so Tripay does not
 * indefinitely retry; the response body indicates the outcome to admins
 * looking at the dashboard logs. Real failures are written to PaymentEvent.
 */
export async function POST(req: Request): Promise<Response> {
  const rawBody = await req.text()

  const result = await handleTripayCallback(rawBody, {
    signature: req.headers.get("x-callback-signature"),
    event: req.headers.get("x-callback-event"),
  })

  // Return non-200 only when we are sure Tripay should retry. Bad signatures
  // and unknown invoices are *not* retried: there's no point.
  if (
    result.status === "INVALID_SIGNATURE" ||
    result.status === "INVALID_EVENT" ||
    result.status === "UNKNOWN_INVOICE" ||
    result.status === "PARSE_ERROR"
  ) {
    return Response.json({ success: false, status: result.status }, { status: 400 })
  }
  return Response.json({ success: true, status: result.status }, { status: 200 })
}
