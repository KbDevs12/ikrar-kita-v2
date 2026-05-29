/**
 * Media upload service.
 *
 * Server-side validation pipeline (each stage is a hard gate):
 *   1. Owner check on the invitation
 *   2. Size cap (2 MB image, 3 MB audio)
 *   3. Browser-supplied MIME against the allow-list
 *   4. Magic-byte sniff on the actual bytes
 *   5. Image: re-encode with sharp to strip EXIF + ensure it's a real image
 *      and also enforce a sane max dimension
 *   6. Persist to MinIO with a content-hashed cuid filename
 *   7. Record metadata in InvitationMedia
 */
import "server-only"
import { nanoid } from "nanoid"
import sharp from "sharp"
import { prisma } from "@/server/db/prisma"
import {
  MAX_AUDIO_BYTES,
  MAX_IMAGE_BYTES,
  type AllowedAudioMime,
  type AllowedImageMime,
} from "@/lib/constants/upload"
import {
  detectAudioMime,
  detectImageMime,
  extensionForAudioMime,
  extensionForImageMime,
  isAllowedAudioMime,
  isAllowedImageMime,
} from "./sniff"
import { putObject, publicUrlFor } from "./storage"
import { InvitationMediaType } from "@prisma/client"

export class MediaUploadError extends Error {
  constructor(
    public code:
      | "NOT_FOUND"
      | "FORBIDDEN"
      | "TOO_LARGE"
      | "INVALID_MIME"
      | "MAGIC_MISMATCH"
      | "PROCESSING_FAILED",
    message: string
  ) {
    super(message)
    this.name = "MediaUploadError"
  }
}

const MAX_IMAGE_DIMENSION = 4096

interface UploadImageInput {
  userId: string
  invitationId: string
  filename: string
  declaredMime: string
  bytes: Buffer
  kind: "COVER" | "GALLERY"
}

export async function uploadImage(input: UploadImageInput) {
  if (input.bytes.byteLength > MAX_IMAGE_BYTES) {
    throw new MediaUploadError("TOO_LARGE", "Ukuran gambar maksimal 2 MB")
  }
  if (!isAllowedImageMime(input.declaredMime)) {
    throw new MediaUploadError("INVALID_MIME", "Format gambar tidak didukung")
  }

  const sniffed = detectImageMime(input.bytes)
  if (!sniffed || sniffed !== input.declaredMime) {
    throw new MediaUploadError("MAGIC_MISMATCH", "Berkas tidak sesuai dengan formatnya")
  }

  const invitation = await prisma.invitation.findUnique({ where: { id: input.invitationId } })
  if (!invitation) throw new MediaUploadError("NOT_FOUND", "Undangan tidak ditemukan")
  if (invitation.userId !== input.userId) {
    throw new MediaUploadError("FORBIDDEN", "Anda tidak memiliki akses ke undangan ini")
  }

  // Re-encode to strip metadata + ensure validity. Keep original format.
  let processed: Buffer
  let outputMime: AllowedImageMime = sniffed
  let width: number | null = null
  let height: number | null = null
  try {
    const pipeline = sharp(input.bytes, { failOn: "error" })
      .rotate() // honour EXIF orientation, then strip metadata
      .resize({ width: MAX_IMAGE_DIMENSION, height: MAX_IMAGE_DIMENSION, fit: "inside", withoutEnlargement: true })

    if (sniffed === "image/jpeg") processed = await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer()
    else if (sniffed === "image/png") processed = await pipeline.png({ compressionLevel: 9 }).toBuffer()
    else if (sniffed === "image/webp") processed = await pipeline.webp({ quality: 82 }).toBuffer()
    else processed = await pipeline.avif({ quality: 60 }).toBuffer()

    const meta = await sharp(processed).metadata()
    width = meta.width ?? null
    height = meta.height ?? null
    outputMime = sniffed
  } catch {
    throw new MediaUploadError("PROCESSING_FAILED", "Gambar gagal diproses")
  }

  const ext = extensionForImageMime(outputMime)
  const id = nanoid(20)
  const folder = input.kind === "COVER" ? "cover" : "gallery"
  const key = `invitations/${input.invitationId}/${folder}/${id}${ext}`

  await putObject(key, processed, outputMime)
  const url = publicUrlFor(key)

  const record = await prisma.invitationMedia.create({
    data: {
      invitationId: input.invitationId,
      type: input.kind === "COVER" ? InvitationMediaType.COVER : InvitationMediaType.GALLERY,
      url,
      filename: id + ext,
      mimeType: outputMime,
      size: processed.byteLength,
      width,
      height,
    },
  })

  // For COVER, also bump the invitation column so it can be listed cheaply
  if (input.kind === "COVER") {
    await prisma.invitation.update({
      where: { id: input.invitationId },
      data: { coverImageUrl: url },
    })
  }

  return record
}

interface UploadAudioInput {
  userId: string
  invitationId: string
  filename: string
  declaredMime: string
  bytes: Buffer
}

export async function uploadAudio(input: UploadAudioInput) {
  if (input.bytes.byteLength > MAX_AUDIO_BYTES) {
    throw new MediaUploadError("TOO_LARGE", "Ukuran audio maksimal 3 MB")
  }
  if (!isAllowedAudioMime(input.declaredMime)) {
    throw new MediaUploadError("INVALID_MIME", "Format audio tidak didukung")
  }
  const sniffed = detectAudioMime(input.bytes)
  if (!sniffed) throw new MediaUploadError("MAGIC_MISMATCH", "Berkas audio tidak valid")

  const invitation = await prisma.invitation.findUnique({ where: { id: input.invitationId } })
  if (!invitation) throw new MediaUploadError("NOT_FOUND", "Undangan tidak ditemukan")
  if (invitation.userId !== input.userId) {
    throw new MediaUploadError("FORBIDDEN", "Anda tidak memiliki akses ke undangan ini")
  }

  const outputMime: AllowedAudioMime = sniffed
  const ext = extensionForAudioMime(outputMime)
  const id = nanoid(20)
  const key = `invitations/${input.invitationId}/music/${id}${ext}`

  await putObject(key, input.bytes, outputMime)
  const url = publicUrlFor(key)

  const record = await prisma.invitationMedia.create({
    data: {
      invitationId: input.invitationId,
      type: InvitationMediaType.MUSIC,
      url,
      filename: id + ext,
      mimeType: outputMime,
      size: input.bytes.byteLength,
    },
  })

  await prisma.invitation.update({
    where: { id: input.invitationId },
    data: { musicUrl: url },
  })

  return record
}
