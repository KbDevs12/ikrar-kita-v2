/**
 * Upload limits and accepted MIME types.
 *
 * Used by both client (TanStack Form metadata schemas) and server (final
 * binary validation). Keeping them in one place means we cannot drift.
 */

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024 // 2 MB
export const MAX_AUDIO_BYTES = 3 * 1024 * 1024 // 3 MB

export const ALLOWED_IMAGE_MIME = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const
export type AllowedImageMime = (typeof ALLOWED_IMAGE_MIME)[number]

export const ALLOWED_AUDIO_MIME = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/ogg",
  "audio/mp4",
] as const
export type AllowedAudioMime = (typeof ALLOWED_AUDIO_MIME)[number]

export const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".avif"] as const
export const ALLOWED_AUDIO_EXTENSIONS = [".mp3", ".wav", ".ogg", ".m4a"] as const

/**
 * Magic byte signatures used for server-side content sniffing. We never
 * trust the Content-Type or filename extension alone.
 *
 * Source references for offsets:
 *   - JPEG: FF D8 FF
 *   - PNG : 89 50 4E 47 0D 0A 1A 0A
 *   - WEBP: "RIFF" .... "WEBP"
 *   - AVIF: "ftyp" with "avif" / "avis" brand at offset 8
 *   - MP3 : "ID3" or 0xFFE-/0xFFF- frame sync
 *   - WAV : "RIFF" .... "WAVE"
 *   - OGG : "OggS"
 *   - M4A : "ftyp" with "M4A " / "mp42" / "isom" brand at offset 8
 */
export const FILE_SIGNATURES = {
  jpeg: [Uint8Array.from([0xff, 0xd8, 0xff])],
  png: [Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])],
  riff: [Uint8Array.from([0x52, 0x49, 0x46, 0x46])], // RIFF (WEBP / WAV)
  ftyp: [Uint8Array.from([0x66, 0x74, 0x79, 0x70])], // "ftyp" - at offset 4
  id3: [Uint8Array.from([0x49, 0x44, 0x33])],
  oggs: [Uint8Array.from([0x4f, 0x67, 0x67, 0x53])],
} as const
