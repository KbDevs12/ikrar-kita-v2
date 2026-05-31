/**
 * MinIO / S3-compatible storage client.
 *
 * - Server-only.
 * - Bucket existence is asserted lazily on first upload.
 * - File keys are deterministic: invitations/<invitationId>/<type>/<cuid>.<ext>
 *   so we can list / clean up per-invitation.
 */
import "server-only"
import { Client } from "minio"
import { Readable } from "node:stream"
import { getServerEnv } from "@/lib/env"

let client: Client | null = null
let bucketReady = false

function buildClient(): Client {
  const env = getServerEnv()
  const url = new URL(env.MINIO_ENDPOINT)
  return new Client({
    endPoint: url.hostname,
    port: Number(url.port) || (url.protocol === "https:" ? 443 : 80),
    useSSL: url.protocol === "https:",
    accessKey: env.MINIO_ACCESS_KEY,
    secretKey: env.MINIO_SECRET_KEY,
  })
}

export function getStorage(): Client {
  if (!client) client = buildClient()
  return client
}

export async function ensureBucket(): Promise<void> {
  if (bucketReady) return
  const env = getServerEnv()
  const c = getStorage()
  const exists = await c.bucketExists(env.MINIO_BUCKET).catch(() => false)
  if (!exists) {
    await c.makeBucket(env.MINIO_BUCKET, "")
  }
  bucketReady = true
}

export async function putObject(
  key: string,
  body: Buffer,
  contentType: string
): Promise<void> {
  await ensureBucket()
  const env = getServerEnv()
  const stream = Readable.from(body)
  await getStorage().putObject(env.MINIO_BUCKET, key, stream, body.byteLength, {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
  })
}

export async function deleteObject(key: string): Promise<void> {
  const env = getServerEnv()
  await getStorage().removeObject(env.MINIO_BUCKET, key)
}

/**
 * Build the public URL the browser will use to fetch the file.
 * In production this routes through Nginx /media/ to MinIO.
 */
export function publicUrlFor(key: string): string {
  const env = getServerEnv()
  const base = env.MINIO_PUBLIC_URL.replace(/\/$/, "")
  return `${base}/${env.MINIO_BUCKET}/${key}`
}
