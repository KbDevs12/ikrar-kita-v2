/**
 * DNS-based email validation for the registration flow.
 *
 * Strategy:
 *   1. Cheap checks (format, typo, disposable) happen first via
 *      `quickCheckEmail` from src/lib/validators/email.
 *   2. If those pass, we resolve MX records for the domain.
 *   3. If resolution fails because the domain has no MX (and no A record as
 *      a fallback), the email is rejected with a generic message.
 *   4. If DNS lookup fails for transient reasons (network), we apply a safe
 *      fallback: allow the registration to proceed for the well-known
 *      provider list and reject otherwise. This keeps the door open during
 *      DNS hiccups for normal users.
 *
 * The lookup uses node:dns/promises with a hard timeout so a slow DNS server
 * cannot stall the register endpoint.
 */
import "server-only"
import { promises as dns } from "node:dns"
import { quickCheckEmail, getEmailDomain } from "@/lib/validators/email"

const DNS_TIMEOUT_MS = 4_000

/**
 * Well-known providers that we accept on a transient DNS failure. Keep this
 * list intentionally small: only providers where MX existence is essentially
 * guaranteed.
 */
const WELL_KNOWN_PROVIDERS = new Set([
  "gmail.com",
  "googlemail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "yahoo.com",
  "yahoo.co.id",
  "icloud.com",
  "me.com",
  "mac.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "yandex.com",
])

export type RegistrationEmailValidation =
  | { ok: true; normalised: string }
  | {
      ok: false
      code: "INVALID_FORMAT" | "DISPOSABLE" | "TYPO_SUGGESTION" | "NO_MX" | "DNS_BLOCKED"
      message: string
      suggestion?: string
    }

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("DNS_TIMEOUT")), ms)
    promise.then(
      (v) => {
        clearTimeout(t)
        resolve(v)
      },
      (err) => {
        clearTimeout(t)
        reject(err)
      }
    )
  })
}

async function hasMxRecord(domain: string): Promise<boolean> {
  try {
    const records = await withTimeout(dns.resolveMx(domain), DNS_TIMEOUT_MS)
    if (records.length > 0) return true
  } catch (err) {
    // Continue to A-record fallback below for ENODATA, but rethrow timeouts
    if (err instanceof Error && err.message === "DNS_TIMEOUT") throw err
  }
  // Some providers serve mail via A-record fallback (rare but legal)
  try {
    const a = await withTimeout(dns.resolve4(domain), DNS_TIMEOUT_MS).catch(() => [])
    if (a.length > 0) return true
  } catch {
    /* ignore */
  }
  return false
}

/**
 * Validate an email for use in registration.
 *
 * Always normalises (trim + lowercase). On NO_MX returns a generic message
 * so we don't leak DNS details to the caller.
 */
export async function validateRegistrationEmail(
  rawEmail: string
): Promise<RegistrationEmailValidation> {
  const quick = quickCheckEmail(rawEmail)
  if (!quick.ok) {
    if (quick.code === "TYPO_SUGGESTION") {
      return {
        ok: false,
        code: "TYPO_SUGGESTION",
        message: quick.message,
        suggestion: quick.suggestion,
      }
    }
    return { ok: false, code: quick.code, message: quick.message }
  }

  const normalised = rawEmail.trim().toLowerCase()
  const domain = getEmailDomain(normalised)

  try {
    const ok = await hasMxRecord(domain)
    if (!ok) {
      return {
        ok: false,
        code: "NO_MX",
        message: "Domain email tidak dapat menerima email. Mohon gunakan email lain.",
      }
    }
    return { ok: true, normalised }
  } catch {
    // Transient DNS issue. Allow well-known providers, reject the rest with
    // a generic message so the user can retry or use a major provider.
    if (WELL_KNOWN_PROVIDERS.has(domain)) {
      return { ok: true, normalised }
    }
    return {
      ok: false,
      code: "DNS_BLOCKED",
      message:
        "Kami tidak dapat memverifikasi domain email Anda saat ini. Silakan coba lagi atau gunakan email lain.",
    }
  }
}
