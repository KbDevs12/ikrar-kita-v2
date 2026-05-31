/**
 * Email templates.
 *
 * Each template returns `{ subject, html, text }`. HTML is generated through
 * a tiny `tpl` tagged literal that escapes interpolated values to neutralise
 * any user-controlled content. Plain-text fallback is always provided.
 *
 * Tone: warm and Indonesian. No exclamation-heavy marketing copy.
 */
import { formatDateID, formatRupiah } from "@/lib/utils"
import type { InvoiceEmailContext } from "../email-service"

export interface EmailContent {
  subject: string
  html: string
  text: string
}

// ─── Escaping helper ─────────────────────────────────────────────────────────

function esc(value: unknown): string {
  if (value === null || value === undefined) return ""
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

/**
 * Tagged template that escapes every interpolated value.
 * Use `tpl.raw` for values that are pre-escaped HTML (e.g. button blocks).
 */
function tpl(strings: TemplateStringsArray, ...values: unknown[]): string {
  let out = strings[0] ?? ""
  for (let i = 0; i < values.length; i++) {
    const v = values[i]
    out += v instanceof RawHtml ? v.html : esc(v)
    out += strings[i + 1] ?? ""
  }
  return out
}

class RawHtml {
  constructor(public html: string) {}
}
const raw = (html: string): RawHtml => new RawHtml(html)

// ─── Shared layout ───────────────────────────────────────────────────────────

const BRAND_NAME = "Ikrar Kita"

function layout(opts: { title: string; preheader: string; bodyHtml: string }): string {
  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${esc(opts.title)}</title>
</head>
<body style="margin:0;padding:0;background:#f7f6f3;font-family:'Helvetica Neue',Arial,sans-serif;color:#2a2419;">
  <span style="display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden;">${esc(
    opts.preheader
  )}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f6f3;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;border:1px solid #ebe7df;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 8px 32px;">
              <p style="margin:0;font-family:Georgia,serif;font-size:22px;letter-spacing:.2px;color:#3f372a;">${BRAND_NAME}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 32px 28px 32px;font-size:15px;line-height:1.6;color:#2a2419;">
              ${opts.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 32px;background:#fafaf6;border-top:1px solid #ebe7df;font-size:12px;color:#8b7d63;">
              Anda menerima email ini karena terdaftar di ${BRAND_NAME}. Jika ini bukan Anda, abaikan saja email ini.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function button(href: string, label: string): RawHtml {
  return raw(
    `<a href="${esc(
      href
    )}" style="display:inline-block;padding:12px 22px;background:#92422a;color:#fdf6f3;text-decoration:none;border-radius:8px;font-weight:600;">${esc(
      label
    )}</a>`
  )
}

// ─── Templates ───────────────────────────────────────────────────────────────

export interface VerifyParams {
  name: string
  url: string
}

export function verifyEmail({ name, url }: VerifyParams): EmailContent {
  const bodyHtml = tpl`
    <p style="margin:0 0 14px 0;">Halo ${name},</p>
    <p style="margin:0 0 14px 0;">Selamat datang di ${BRAND_NAME}. Untuk melanjutkan, mohon konfirmasi alamat email Anda dengan menekan tombol di bawah.</p>
    <p style="margin:18px 0;">${button(url, "Verifikasi email saya")}</p>
    <p style="margin:0 0 8px 0;color:#5e5340;font-size:13px;">Atau salin tautan ini ke peramban:</p>
    <p style="margin:0 0 14px 0;font-size:13px;word-break:break-all;color:#5e5340;">${url}</p>
    <p style="margin:0;color:#5e5340;font-size:13px;">Tautan ini berlaku selama 60 menit.</p>
  `
  return {
    subject: `Konfirmasi email Anda di ${BRAND_NAME}`,
    html: layout({
      title: "Verifikasi email",
      preheader: "Tautan verifikasi email akun Anda",
      bodyHtml,
    }),
    text: `Halo ${name},\n\nVerifikasi email Anda dengan membuka tautan berikut (berlaku 60 menit):\n${url}\n\n— ${BRAND_NAME}`,
  }
}

export function verifyEmailSuccess({ name }: { name: string }): EmailContent {
  const bodyHtml = tpl`
    <p style="margin:0 0 14px 0;">Halo ${name},</p>
    <p style="margin:0 0 14px 0;">Email Anda sudah berhasil diverifikasi. Anda kini dapat mulai membuat undangan, memilih tema, dan mengundang tamu lewat dasbor ${BRAND_NAME}.</p>
    <p style="margin:0;">Selamat berkarya untuk hari spesial Anda.</p>
  `
  return {
    subject: `Email Anda sudah diverifikasi`,
    html: layout({
      title: "Email terverifikasi",
      preheader: "Email Anda sudah diverifikasi - dasbor sudah terbuka.",
      bodyHtml,
    }),
    text: `Halo ${name},\n\nEmail Anda sudah berhasil diverifikasi. Dasbor ${BRAND_NAME} sudah dapat digunakan.\n`,
  }
}

// ─── Invoice templates ──────────────────────────────────────────────────────

function invoiceSummaryRows(ctx: InvoiceEmailContext): RawHtml {
  const exp = ctx.invoice.expiredAt ? formatDateID(ctx.invoice.expiredAt) : "-"
  return raw(`
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:14px 0;">
      <tr><td style="padding:6px 0;color:#8b7d63;width:40%;">Paket</td><td style="padding:6px 0;font-weight:600;">${esc(
        ctx.planName
      )}</td></tr>
      <tr><td style="padding:6px 0;color:#8b7d63;">Nominal</td><td style="padding:6px 0;font-weight:600;">${esc(
        formatRupiah(ctx.invoice.amount)
      )}</td></tr>
      <tr><td style="padding:6px 0;color:#8b7d63;">Metode</td><td style="padding:6px 0;">${esc(
        ctx.invoice.paymentMethodName ?? "-"
      )}</td></tr>
      <tr><td style="padding:6px 0;color:#8b7d63;">No. Invoice</td><td style="padding:6px 0;font-family:monospace;">${esc(
        ctx.invoice.merchantRef
      )}</td></tr>
      <tr><td style="padding:6px 0;color:#8b7d63;">Berlaku sampai</td><td style="padding:6px 0;">${esc(exp)}</td></tr>
    </table>
  `)
}

export function invoiceCreatedUserEmail(ctx: InvoiceEmailContext): EmailContent {
  const url = ctx.invoice.tripayCheckoutUrl ?? ""
  const bodyHtml = tpl`
    <p style="margin:0 0 14px 0;">Halo ${ctx.user.name},</p>
    <p style="margin:0 0 6px 0;">Tagihan Anda untuk paket <strong>${ctx.planName}</strong> sudah dibuat. Berikut ringkasannya:</p>
    ${invoiceSummaryRows(ctx)}
    ${url ? raw(`<p style="margin:18px 0;">${button(url, "Buka instruksi pembayaran").html}</p>`) : raw("")}
    <p style="margin:0;color:#5e5340;font-size:13px;">Status pembayaran akan otomatis ter-update setelah Anda menyelesaikan transaksi.</p>
  `
  return {
    subject: `Tagihan ${ctx.planName} - ${ctx.invoice.merchantRef}`,
    html: layout({
      title: "Tagihan dibuat",
      preheader: `Tagihan ${formatRupiah(ctx.invoice.amount)} untuk paket ${ctx.planName}.`,
      bodyHtml,
    }),
    text: `Halo ${ctx.user.name},\n\nTagihan untuk paket ${ctx.planName} (${formatRupiah(
      ctx.invoice.amount
    )}) sudah dibuat. No. invoice: ${ctx.invoice.merchantRef}.\n${
      url ? `Bayar di: ${url}\n` : ""
    }`,
  }
}

export function invoiceCreatedAdminEmail(ctx: InvoiceEmailContext): EmailContent {
  const bodyHtml = tpl`
    <p style="margin:0 0 14px 0;">Ada user yang baru saja melakukan checkout.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:14px 0;">
      <tr><td style="padding:6px 0;color:#8b7d63;width:40%;">Nama</td><td style="padding:6px 0;font-weight:600;">${ctx.user.name}</td></tr>
      <tr><td style="padding:6px 0;color:#8b7d63;">Email</td><td style="padding:6px 0;">${ctx.user.email}</td></tr>
      <tr><td style="padding:6px 0;color:#8b7d63;">Paket</td><td style="padding:6px 0;">${ctx.planName}</td></tr>
      <tr><td style="padding:6px 0;color:#8b7d63;">Nominal</td><td style="padding:6px 0;">${formatRupiah(
        ctx.invoice.amount
      )}</td></tr>
      <tr><td style="padding:6px 0;color:#8b7d63;">Metode</td><td style="padding:6px 0;">${
        ctx.invoice.paymentMethodName ?? "-"
      }</td></tr>
      <tr><td style="padding:6px 0;color:#8b7d63;">Merchant Ref</td><td style="padding:6px 0;font-family:monospace;">${
        ctx.invoice.merchantRef
      }</td></tr>
    </table>
  `
  return {
    subject: `[Admin] Checkout baru - ${ctx.user.email}`,
    html: layout({ title: "Checkout baru", preheader: `Checkout dari ${ctx.user.email}`, bodyHtml }),
    text: `Checkout baru dari ${ctx.user.name} <${ctx.user.email}>: ${ctx.planName} (${formatRupiah(
      ctx.invoice.amount
    )}). Ref ${ctx.invoice.merchantRef}.`,
  }
}

export function invoicePaidUserEmail(ctx: InvoiceEmailContext): EmailContent {
  const bodyHtml = tpl`
    <p style="margin:0 0 14px 0;">Halo ${ctx.user.name},</p>
    <p style="margin:0 0 14px 0;">Pembayaran untuk paket <strong>${ctx.planName}</strong> sudah kami terima. Subscription Anda aktif untuk 30 hari ke depan.</p>
    ${invoiceSummaryRows(ctx)}
    <p style="margin:0 0 14px 0;">Anda kini bisa menerbitkan undangan baru atau memperpanjang yang sudah ada.</p>
  `
  return {
    subject: `Pembayaran berhasil - ${ctx.planName}`,
    html: layout({
      title: "Pembayaran berhasil",
      preheader: "Subscription Anda aktif untuk 30 hari ke depan.",
      bodyHtml,
    }),
    text: `Halo ${ctx.user.name},\n\nPembayaran ${ctx.planName} (${formatRupiah(
      ctx.invoice.amount
    )}) berhasil. Subscription aktif 30 hari.`,
  }
}

export function invoicePaidAdminEmail(ctx: InvoiceEmailContext): EmailContent {
  const bodyHtml = tpl`
    <p style="margin:0 0 14px 0;">Pembayaran ${ctx.planName} dari ${ctx.user.email} berhasil.</p>
    ${invoiceSummaryRows(ctx)}
  `
  return {
    subject: `[Admin] Pembayaran berhasil - ${ctx.user.email}`,
    html: layout({
      title: "Pembayaran berhasil",
      preheader: `Tripay PAID untuk ${ctx.invoice.merchantRef}`,
      bodyHtml,
    }),
    text: `Pembayaran ${ctx.planName} dari ${ctx.user.email} berhasil. Ref ${ctx.invoice.merchantRef}.`,
  }
}

export function invoiceExpiredUserEmail(ctx: InvoiceEmailContext): EmailContent {
  const bodyHtml = tpl`
    <p style="margin:0 0 14px 0;">Halo ${ctx.user.name},</p>
    <p style="margin:0 0 14px 0;">Tagihan untuk paket <strong>${ctx.planName}</strong> sudah melewati batas waktu pembayaran.</p>
    ${invoiceSummaryRows(ctx)}
    <p style="margin:0;">Anda dapat membuat tagihan baru kapan saja dari halaman Billing di dasbor.</p>
  `
  return {
    subject: `Tagihan ${ctx.planName} kedaluwarsa`,
    html: layout({
      title: "Tagihan kedaluwarsa",
      preheader: "Tagihan Anda sudah lewat batas waktu.",
      bodyHtml,
    }),
    text: `Tagihan ${ctx.planName} (${ctx.invoice.merchantRef}) kedaluwarsa.`,
  }
}

export function invoiceFailedUserEmail(ctx: InvoiceEmailContext): EmailContent {
  const bodyHtml = tpl`
    <p style="margin:0 0 14px 0;">Halo ${ctx.user.name},</p>
    <p style="margin:0 0 14px 0;">Pembayaran untuk paket <strong>${ctx.planName}</strong> tidak berhasil diproses.</p>
    ${invoiceSummaryRows(ctx)}
    <p style="margin:0;">Silakan coba lagi dari halaman Billing atau hubungi tim kami jika butuh bantuan.</p>
  `
  return {
    subject: `Pembayaran gagal - ${ctx.planName}`,
    html: layout({
      title: "Pembayaran gagal",
      preheader: "Pembayaran tidak berhasil diproses.",
      bodyHtml,
    }),
    text: `Pembayaran ${ctx.planName} (${ctx.invoice.merchantRef}) gagal.`,
  }
}
