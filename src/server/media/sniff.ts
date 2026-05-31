/**
 * Magic-byte content sniffing for uploaded files.
 *
 * Used as the FINAL gate before persisting media. The browser-supplied
 * Content-Type and filename extension are advisory only - the binary itself
 * must match one of the allowed signatures.
 */
import {
  ALLOWED_AUDIO_MIME,
  ALLOWED_IMAGE_MIME,
  type AllowedAudioMime,
  type AllowedImageMime,
} from "@/lib/constants/upload"

function startsWith(buf: Buffer, sig: number[], offset = 0): boolean {
  if (buf.length < offset + sig.length) return false
  for (let i = 0; i < sig.length; i++) {
    if (buf[offset + i] !== sig[i]) return false
  }
  return true
}

function asciiAt(buf: Buffer, offset: number, length: number): string {
  if (buf.length < offset + length) return ""
  return buf.slice(offset, offset + length).toString("ascii")
}

export function detectImageMime(buf: Buffer): AllowedImageMime | null {
  // JPEG: FF D8 FF
  if (startsWith(buf, [0xff, 0xd8, 0xff])) return "image/jpeg"
  // PNG : 89 50 4E 47 0D 0A 1A 0A
  if (startsWith(buf, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png"
  // RIFF + WEBP
  if (asciiAt(buf, 0, 4) === "RIFF" && asciiAt(buf, 8, 4) === "WEBP") return "image/webp"
  // ftyp + avif/avis brand at offset 4-12
  if (asciiAt(buf, 4, 4) === "ftyp") {
    const brand = asciiAt(buf, 8, 4)
    if (brand === "avif" || brand === "avis") return "image/avif"
  }
  return null
}

export function detectAudioMime(buf: Buffer): AllowedAudioMime | null {
  // ID3 (MP3 with metadata) or 0xFF 0xE/F (MPEG audio frame sync)
  if (asciiAt(buf, 0, 3) === "ID3") return "audio/mpeg"
  // Pull both bytes once after the length check so we don't re-index buf in
  // a way that confuses noUncheckedIndexedAccess.
  const b0 = buf[0]
  const b1 = buf[1]
  if (
    buf.length >= 2 &&
    b0 === 0xff &&
    b1 !== undefined &&
    (b1 & 0xe0) === 0xe0
  )
    return "audio/mpeg"
  // RIFF + WAVE
  if (asciiAt(buf, 0, 4) === "RIFF" && asciiAt(buf, 8, 4) === "WAVE") return "audio/wav"
  // OGG
  if (asciiAt(buf, 0, 4) === "OggS") return "audio/ogg"
  // M4A: ftyp + brand M4A or mp42 / isom
  if (asciiAt(buf, 4, 4) === "ftyp") {
    const brand = asciiAt(buf, 8, 4)
    if (brand === "M4A " || brand === "mp42" || brand === "isom") return "audio/mp4"
  }
  return null
}

export function isAllowedImageMime(mime: string): mime is AllowedImageMime {
  return (ALLOWED_IMAGE_MIME as readonly string[]).includes(mime)
}

export function isAllowedAudioMime(mime: string): mime is AllowedAudioMime {
  return (ALLOWED_AUDIO_MIME as readonly string[]).includes(mime)
}

export function extensionForImageMime(mime: AllowedImageMime): string {
  switch (mime) {
    case "image/jpeg":
      return ".jpg"
    case "image/png":
      return ".png"
    case "image/webp":
      return ".webp"
    case "image/avif":
      return ".avif"
  }
}

export function extensionForAudioMime(mime: AllowedAudioMime): string {
  switch (mime) {
    case "audio/mpeg":
    case "audio/mp3":
      return ".mp3"
    case "audio/wav":
      return ".wav"
    case "audio/ogg":
      return ".ogg"
    case "audio/mp4":
      return ".m4a"
  }
}
