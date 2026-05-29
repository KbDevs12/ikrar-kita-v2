import { z } from "zod"
import {
  ALLOWED_AUDIO_MIME,
  ALLOWED_IMAGE_MIME,
  MAX_AUDIO_BYTES,
  MAX_IMAGE_BYTES,
} from "@/lib/constants/upload"

/**
 * Media metadata validators. The actual file binary is validated server-side
 * with magic-byte sniffing in src/server/media. These schemas only cover the
 * metadata that travels through TanStack Form / FormData fields.
 */

export const imageMetadataSchema = z.object({
  filename: z
    .string()
    .min(1, "Nama file wajib")
    .max(180, "Nama file terlalu panjang")
    .regex(/^[^/\\\0]+$/, "Nama file tidak valid"),
  mimeType: z.enum(ALLOWED_IMAGE_MIME, {
    errorMap: () => ({ message: "Format gambar tidak didukung. Gunakan JPG, PNG, WEBP, atau AVIF." }),
  }),
  size: z
    .number()
    .int()
    .nonnegative()
    .max(MAX_IMAGE_BYTES, "Ukuran gambar maksimal 2 MB"),
  invitationId: z.string().cuid(),
  kind: z.enum(["COVER", "GALLERY"]),
})

export type ImageMetadata = z.infer<typeof imageMetadataSchema>

export const audioMetadataSchema = z.object({
  filename: z
    .string()
    .min(1)
    .max(180)
    .regex(/^[^/\\\0]+$/, "Nama file tidak valid"),
  mimeType: z.enum(ALLOWED_AUDIO_MIME, {
    errorMap: () => ({ message: "Format audio tidak didukung. Gunakan MP3, WAV, OGG, atau M4A." }),
  }),
  size: z
    .number()
    .int()
    .nonnegative()
    .max(MAX_AUDIO_BYTES, "Ukuran audio maksimal 3 MB"),
  invitationId: z.string().cuid(),
})

export type AudioMetadata = z.infer<typeof audioMetadataSchema>

/**
 * Single union for the upload entrypoint - the API differentiates by the
 * `kind` discriminator to pick the right validator + storage path.
 */
export const uploadMetadataSchema = z.discriminatedUnion("category", [
  imageMetadataSchema.extend({ category: z.literal("image") }),
  audioMetadataSchema.extend({ category: z.literal("audio") }),
])

export type UploadMetadata = z.infer<typeof uploadMetadataSchema>
