/**
 * Server-side HTML sanitisation.
 *
 * React already escapes text children, but for any place that intentionally
 * renders user-provided HTML (e.g. love story rich text), use sanitiseHtml.
 *
 * Other input strings (slug, recipient ?to=) have their own sanitisers in
 * src/lib/validators - this module is only for HTML payloads.
 */
import "server-only"
import DOMPurify from "isomorphic-dompurify"

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "u",
  "i",
  "b",
  "span",
  "ul",
  "ol",
  "li",
  "a",
  "blockquote",
  "h2",
  "h3",
  "h4",
]

const ALLOWED_ATTR = ["href", "target", "rel"]

/**
 * Sanitise rich-text HTML coming from invitation builder fields. Forces
 * `rel="noopener noreferrer"` on all links and only allows http/https/mailto.
 */
export function sanitiseRichText(html: string): string {
  const cleaned = DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP: /^(?:https?|mailto):/i,
  })
  // Force safe link attributes
  return cleaned.replace(
    /<a\s+([^>]*?)>/gi,
    (_match, attrs) => `<a ${attrs} target="_blank" rel="noopener noreferrer">`
  )
}
