/**
 * Disposable / temporary email domain blocklist.
 *
 * Kept as a Set<string> for O(1) lookup. Add new domains here when you
 * encounter abuse - keep entries lowercase. The list is intentionally a
 * starting point, not exhaustive; combine with MX check + rate limit for
 * defence in depth.
 */
export const DISPOSABLE_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  // Original spec list
  "mailinator.com",
  "10minutemail.com",
  "temp-mail.org",
  "guerrillamail.com",
  "yopmail.com",
  "throwawaymail.com",
  "getnada.com",
  "sharklasers.com",

  // Common additions seen in production abuse logs
  "tempmail.com",
  "trashmail.com",
  "trash-mail.com",
  "fakeinbox.com",
  "maildrop.cc",
  "dispostable.com",
  "mintemail.com",
  "spamgourmet.com",
  "mohmal.com",
  "mailnesia.com",
  "tempr.email",
  "tempinbox.com",
  "emailondeck.com",
  "getairmail.com",
  "mailcatch.com",
  "mailnator.com",
  "tempmailaddress.com",
  "tempmailo.com",
  "mvrht.net",
  "anonbox.net",
  "discard.email",
  "discardmail.com",
  "ezztt.com",
  "mailtemp.info",
  "spambog.com",
  "spambog.de",
  "spam.la",
  "ultra.fyi",
  "wegwerfmail.de",
  "fakemail.fr",
  "fakemail.net",
  "binkmail.com",
  "bobmail.info",
  "deadaddress.com",
])

export function isDisposableEmailDomain(domain: string): boolean {
  return DISPOSABLE_EMAIL_DOMAINS.has(domain.toLowerCase())
}
