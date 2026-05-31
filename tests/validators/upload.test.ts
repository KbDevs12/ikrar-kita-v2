import { describe, it, expect } from "vitest"
import { imageMetadataSchema, audioMetadataSchema } from "@/lib/validators/media"
import { MAX_AUDIO_BYTES, MAX_IMAGE_BYTES } from "@/lib/constants/upload"

const cuid = "ckxyz0000000000000000000"

describe("imageMetadataSchema", () => {
  it("accepts a 1.5MB jpeg", () => {
    const res = imageMetadataSchema.safeParse({
      filename: "cover.jpg",
      mimeType: "image/jpeg",
      size: 1.5 * 1024 * 1024,
      invitationId: cuid,
      kind: "COVER",
    })
    expect(res.success).toBe(true)
  })

  it("rejects images larger than 2MB", () => {
    const res = imageMetadataSchema.safeParse({
      filename: "huge.png",
      mimeType: "image/png",
      size: MAX_IMAGE_BYTES + 1,
      invitationId: cuid,
      kind: "GALLERY",
    })
    expect(res.success).toBe(false)
  })

  it("rejects unsupported mime types", () => {
    const res = imageMetadataSchema.safeParse({
      filename: "file.gif",
      mimeType: "image/gif",
      size: 100,
      invitationId: cuid,
      kind: "GALLERY",
    })
    expect(res.success).toBe(false)
  })

  it("rejects path traversal in filename", () => {
    const res = imageMetadataSchema.safeParse({
      filename: "../../etc/passwd",
      mimeType: "image/jpeg",
      size: 100,
      invitationId: cuid,
      kind: "GALLERY",
    })
    expect(res.success).toBe(false)
  })
})

describe("audioMetadataSchema", () => {
  it("accepts a 2.5MB mp3", () => {
    const res = audioMetadataSchema.safeParse({
      filename: "song.mp3",
      mimeType: "audio/mpeg",
      size: 2.5 * 1024 * 1024,
      invitationId: cuid,
    })
    expect(res.success).toBe(true)
  })

  it("rejects audio larger than 3MB", () => {
    const res = audioMetadataSchema.safeParse({
      filename: "huge.wav",
      mimeType: "audio/wav",
      size: MAX_AUDIO_BYTES + 1,
      invitationId: cuid,
    })
    expect(res.success).toBe(false)
  })
})
