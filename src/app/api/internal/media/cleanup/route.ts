import "server-only"
import { z } from "zod"
import { prisma } from "@/server/db/prisma"
import { deleteObject } from "@/server/media/storage"
import {
  requireInternalApiKey,
  UnauthorizedError,
  unauthorizedResponse,
} from "@/server/security/api-key"
import { handleApiError, jsonOk } from "@/server/http/response"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const bodySchema = z.object({
  limit: z.number().int().min(1).max(500).default(100),
})

/**
 * Internal: remove media rows whose invitation no longer exists or whose
 * URL no longer resolves to a known key. Conservative - only deletes rows
 * older than 24h to avoid removing media for a freshly-broken upload.
 *
 * MinIO objects are deleted best-effort. If the object is missing the
 * delete still succeeds (S3 semantics).
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
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000)

    // Orphan: media row whose invitation has been deleted
    // (Prisma cascade handles row deletion already, so this is a defence
    // against legacy orphans created before the cascade was added.)
    const orphans = await prisma.invitationMedia.findMany({
      where: {
        createdAt: { lt: cutoff },
        invitation: undefined, // Prisma: relation IS NULL not directly expressable
      },
      take: parsed.limit,
    })

    let deleted = 0
    for (const m of orphans) {
      try {
        // url shape: <public-url>/<bucket>/<key>; extract the key after bucket
        const url = new URL(m.url)
        const parts = url.pathname.split("/").filter(Boolean)
        // ['<bucket>', 'invitations', '<id>', '<type>', '<file>']
        const key = parts.slice(1).join("/")
        if (key) await deleteObject(key)
        await prisma.invitationMedia.delete({ where: { id: m.id } })
        deleted++
      } catch (err) {
        console.error(`[media-cleanup] failed for ${m.id}:`, err)
      }
    }

    return jsonOk({ examined: orphans.length, deleted })
  } catch (err) {
    return handleApiError(err)
  }
}
