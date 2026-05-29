import { describe, it, expect } from "vitest"
import { detectAudioMime, detectImageMime } from "@/server/media/sniff"

const buf = (...bytes: number[]) => Buffer.from(bytes)
const pad = (b: Buffer, len: number) =>
  Buffer.concat([b, Buffer.alloc(Math.max(0, len - b.length))])

describe("detectImageMime", () => {
  it("detects JPEG by magic bytes", () => {
    expect(detectImageMime(buf(0xff, 0xd8, 0xff, 0xe0, 0x00))).toBe("image/jpeg")
  })
  it("detects PNG", () => {
    expect(
      detectImageMime(buf(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))
    ).toBe("image/png")
  })
  it("detects WEBP via RIFF...WEBP", () => {
    const b = pad(Buffer.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]), 16)
    expect(detectImageMime(b)).toBe("image/webp")
  })
  it("detects AVIF via ftyp+avif", () => {
    const b = pad(
      Buffer.from([
        0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66,
      ]),
      24
    )
    expect(detectImageMime(b)).toBe("image/avif")
  })
  it("rejects GIF and other unsupported formats", () => {
    expect(detectImageMime(Buffer.from("GIF89a"))).toBeNull()
    expect(detectImageMime(Buffer.from("not an image"))).toBeNull()
  })
})

describe("detectAudioMime", () => {
  it("detects MP3 with ID3 tag", () => {
    expect(detectAudioMime(Buffer.from("ID3\x04\x00", "binary"))).toBe("audio/mpeg")
  })
  it("detects MP3 with frame sync", () => {
    expect(detectAudioMime(buf(0xff, 0xfb, 0x90, 0x00))).toBe("audio/mpeg")
  })
  it("detects WAV via RIFF...WAVE", () => {
    const b = pad(Buffer.from([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x41, 0x56, 0x45]), 16)
    expect(detectAudioMime(b)).toBe("audio/wav")
  })
  it("detects OGG via OggS", () => {
    expect(detectAudioMime(Buffer.from("OggS\x00\x02"))).toBe("audio/ogg")
  })
  it("rejects garbage", () => {
    expect(detectAudioMime(Buffer.from("not audio"))).toBeNull()
  })
})
