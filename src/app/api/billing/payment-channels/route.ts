import "server-only"
import { getPaymentChannels } from "@/server/payment/tripay"
import { requireVerifiedUser } from "@/server/auth/guards"
import { handleApiError, jsonOk } from "@/server/http/response"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(): Promise<Response> {
  try {
    await requireVerifiedUser()
    const channels = await getPaymentChannels()
    // Return only what the UI needs, do not echo any sensitive merchant data.
    return jsonOk({
      channels: channels.map((c) => ({
        code: c.code,
        name: c.name,
        type: c.type,
        group: c.group,
        feeFlat: c.fee_customer.flat,
        feePercent: c.fee_customer.percent,
        iconUrl: c.icon_url,
        active: c.active,
      })),
    })
  } catch (err) {
    return handleApiError(err)
  }
}
