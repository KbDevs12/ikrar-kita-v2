import "server-only"
import { prisma } from "@/server/db/prisma"
import { jsonOk } from "@/server/http/response"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(): Promise<Response> {
  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      code: true,
      name: true,
      price: true,
      durationDays: true,
      invitationLimit: true,
      description: true,
    },
  })
  return jsonOk({ plans })
}
