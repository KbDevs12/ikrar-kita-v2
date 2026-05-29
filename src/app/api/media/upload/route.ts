import "server-only"
import { requireVerifiedUser } from "@/server/auth/guards"
import { MediaUploadError, uploadAudio, uploadImage } from "@/server/media/upload-service"
import { handleApiError, jsonCreated, jsonError } from "@/server/http/response"
import { MAX_AUDIO_BYTES, MAX_IMAGE_BYTES } from "@/lib/constants/upload"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Hard ceiling on the multipart body. Per-file limits are enforced inside.
export const config = {
  api: { bodyParser: false },
}

const MAX_FORM_BYTES = Math.max(MAX_IMAGE_BYTES, MAX_AUDIO_BYTES) + 256 * 1024

export async function POST(req: Request): Promise<Response> {
  try {
    const session = await requireVerifiedUser()
    const ct = req.headers.get("content-type") ?? ""
    if (!ct.startsWith("multipart/form-data")) {
      return jsonError(400, { code: "BAD_REQUEST", message: "Expected multipart/form-data" })
    }

    const cl = Number(req.headers.get("content-length") ?? "0")
    if (cl > MAX_FORM_BYTES) {
      return jsonError(413, { code: "TOO_LARGE", message: "Berkas terlalu besar" })
    }

    const form = await req.formData()
    const file = form.get("file")
    const category = String(form.get("category") ?? "")
    const invitationId = String(form.get("invitationId") ?? "")
    const kindRaw = String(form.get("kind") ?? "GALLERY")

    if (!(file instanceof Blob)) {
      return jsonError(400, { code: "BAD_REQUEST", message: "Field 'file' tidak ditemukan" })
    }
    if (!invitationId) {
      return jsonError(400, { code: "BAD_REQUEST", message: "Field 'invitationId' wajib diisi" })
    }

    const arrayBuffer = await file.arrayBuffer()
    const bytes = Buffer.from(arrayBuffer)

    if (category === "image") {
      const kind = kindRaw === "COVER" ? "COVER" : "GALLERY"
      const record = await uploadImage({
        userId: session.user.id,
        invitationId,
        filename: (file as File).name ?? "upload",
        declaredMime: file.type,
        bytes,
        kind,
      })
      return jsonCreated({ media: record })
    }
    if (category === "audio") {
      const record = await uploadAudio({
        userId: session.user.id,
        invitationId,
        filename: (file as File).name ?? "upload",
        declaredMime: file.type,
        bytes,
      })
      return jsonCreated({ media: record })
    }
    return jsonError(400, { code: "BAD_REQUEST", message: "Kategori upload tidak valid" })
  } catch (err) {
    if (err instanceof MediaUploadError) {
      const map: Record<string, number> = {
        NOT_FOUND: 404,
        FORBIDDEN: 403,
        TOO_LARGE: 413,
        INVALID_MIME: 415,
        MAGIC_MISMATCH: 415,
        PROCESSING_FAILED: 422,
      }
      return jsonError(map[err.code] ?? 422, { code: err.code, message: err.message })
    }
    return handleApiError(err)
  }
}
