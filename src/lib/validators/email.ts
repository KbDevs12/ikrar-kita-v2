import { z } from "zod"
import { isDisposableEmailDomain } from "@/lib/constants/disposable-email-domains"

/**
 * Email validation utilities shared by auth, settings, and admin flows.
 *
 * Layers (cheapest first):
 *   1. Format check (Zod)
 *   2. Domain typo correction (suggest, do not auto-fix)
 *   3. Disposable domain blocklist
 *   4. MX lookup (server-side, network)
 */

const EMAIL_REGEX =
  // RFC 5322 simplified - reject obvious garbage but stay permissive on
  // legitimate odd characters in the local part.
  /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/

export const emailSchema = z
  .string({ required_error: "Email wajib diisi" })
  .trim()
  .toLowerCase()
  .min(5, "Email terlalu pendek")
  .max(254, "Email terlalu panjang")
  .regex(EMAIL_REGEX, "Format email tidak valid")

/**
 * Common typos -> suggested correction. Used to nudge the user, not to
 * silently rewrite their input.
 */
const TYPO_MAP: Record<string, string> = {
  "gmai.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gnail.com": "gmail.com",
  "gmaill.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gmail.cm": "gmail.com",
  "gmal.com": "gmail.com",
  "gemail.com": "gmail.com",
  "outlok.com": "outlook.com",
  "outloook.com": "outlook.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "yaho.com": "yahoo.com",
  "yahooo.com": "yahoo.com",
  "yhaoo.com": "yahoo.com",
  "icloud.co": "icloud.com",
  "iclod.com": "icloud.com",
  "protonmial.com": "protonmail.com",
}

export function suggestEmailDomainCorrection(email: string): string | null {
  const at = email.lastIndexOf("@")
  if (at === -1) return null
  const local = email.slice(0, at)
  const domain = email.slice(at + 1).toLowerCase()
  const fixed = TYPO_MAP[domain]
  if (!fixed) return null
  return `${local}@${fixed}`
}

export function getEmailDomain(email: string): string {
  const at = email.lastIndexOf("@")
  return at === -1 ? "" : email.slice(at + 1).toLowerCase()
}

/**
 * Synchronous client-friendly checks. Does NOT do MX lookup.
 *
 * Returns a typed result rather than throwing - callers usually want to
 * surface different UI for "typo" vs "disposable".
 */
export type EmailQuickCheck =
  | { ok: true }
  | { ok: false; code: "INVALID_FORMAT"; message: string }
  | { ok: false; code: "DISPOSABLE"; message: string }
  | { ok: false; code: "TYPO_SUGGESTION"; message: string; suggestion: string }

export function quickCheckEmail(rawEmail: string): EmailQuickCheck {
  const parsed = emailSchema.safeParse(rawEmail)
  if (!parsed.success) {
    return {
      ok: false,
      code: "INVALID_FORMAT",
      message: parsed.error.issues[0]?.message ?? "Format email tidak valid",
    }
  }
  const email = parsed.data
  const domain = getEmailDomain(email)
  if (isDisposableEmailDomain(domain)) {
    return {
      ok: false,
      code: "DISPOSABLE",
      message: "Mohon gunakan email pribadi atau kantor, bukan email sementara.",
    }
  }
  const suggestion = suggestEmailDomainCorrection(email)
  if (suggestion) {
    return {
      ok: false,
      code: "TYPO_SUGGESTION",
      message: "Sepertinya ada salah ketik pada domain email.",
      suggestion,
    }
  }
  return { ok: true }
}
