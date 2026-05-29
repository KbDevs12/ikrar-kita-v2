/**
 * Domain email service.
 *
 * Route handlers and services call these typed functions; they never touch
 * nodemailer directly. Each successful or failed send is recorded in the
 * EmailEvent table so admins can audit delivery.
 *
 * The provider can be swapped without changing call sites: just replace
 * `getTransport()` with another implementation that exposes `sendMail`.
 */
import "server-only"
import { prisma } from "@/server/db/prisma"
import { getServerEnv } from "@/lib/env"
import { EmailEventStatus, EmailEventType, type Invoice, type User } from "@prisma/client"
import { getDefaultFrom, getTransport } from "./smtp"
import {
  invoiceCreatedAdminEmail,
  invoiceCreatedUserEmail,
  invoiceExpiredUserEmail,
  invoiceFailedUserEmail,
  invoicePaidAdminEmail,
  invoicePaidUserEmail,
  verifyEmail,
  verifyEmailSuccess,
  type EmailContent,
} from "./templates"

interface SendOptions {
  to: string
  content: EmailContent
  type: EmailEventType
  userId?: string | null
  invoiceId?: string | null
}

async function send(opts: SendOptions): Promise<void> {
  const transport = getTransport()
  const from = getDefaultFrom()

  try {
    await transport.sendMail({
      from,
      to: opts.to,
      subject: opts.content.subject,
      text: opts.content.text,
      html: opts.content.html,
    })

    await recordEmailEvent({
      type: opts.type,
      recipient: opts.to,
      status: EmailEventStatus.SENT,
      userId: opts.userId ?? null,
      invoiceId: opts.invoiceId ?? null,
    })
  } catch (err) {
    // We never let SMTP failures crash a payment / register flow. Log and
    // record so we can retry from /api/internal/email/retry-failed.
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error(`[email] failed to send ${opts.type} to ${opts.to}:`, message)
    await recordEmailEvent({
      type: opts.type,
      recipient: opts.to,
      status: EmailEventStatus.FAILED,
      errorMessage: redactSensitive(message),
      userId: opts.userId ?? null,
      invoiceId: opts.invoiceId ?? null,
    })
  }
}

interface RecordOpts {
  type: EmailEventType
  recipient: string
  status: EmailEventStatus
  errorMessage?: string
  userId: string | null
  invoiceId: string | null
}

async function recordEmailEvent(opts: RecordOpts): Promise<void> {
  await prisma.emailEvent
    .create({
      data: {
        type: opts.type,
        recipient: opts.recipient,
        status: opts.status,
        errorMessage: opts.errorMessage ?? null,
        userId: opts.userId,
        invoiceId: opts.invoiceId,
      },
    })
    .catch((e) => {
      // Audit table failures must never propagate.
      console.error("[email] failed to write EmailEvent:", e)
    })
}

/**
 * Strip anything that looks like a credential from error strings before we
 * persist them. Defence in depth: the transport already redacts but Gmail
 * sometimes echoes parts of the auth header in errors.
 */
function redactSensitive(s: string): string {
  return s
    .replace(/AUTH\s+\w+\s+\S+/gi, "AUTH [redacted]")
    .replace(/password=\S+/gi, "password=[redacted]")
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
    .slice(0, 1000)
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function sendVerificationEmail(
  user: Pick<User, "id" | "name" | "email">,
  rawToken: string
): Promise<void> {
  const env = getServerEnv()
  const url = `${env.APP_URL.replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(
    rawToken
  )}`
  await send({
    to: user.email,
    content: verifyEmail({ name: user.name, url }),
    type: EmailEventType.VERIFICATION,
    userId: user.id,
  })
}

export async function sendVerificationSuccessEmail(
  user: Pick<User, "id" | "name" | "email">
): Promise<void> {
  await send({
    to: user.email,
    content: verifyEmailSuccess({ name: user.name }),
    type: EmailEventType.VERIFICATION_SUCCESS,
    userId: user.id,
  })
}

export interface InvoiceEmailContext {
  invoice: Pick<
    Invoice,
    | "id"
    | "amount"
    | "merchantRef"
    | "tripayCheckoutUrl"
    | "tripayPayCode"
    | "expiredAt"
    | "paymentMethodName"
    | "status"
    | "paidAt"
  >
  user: Pick<User, "id" | "name" | "email">
  planName: string
}

export async function sendInvoiceCreatedEmailToUser(
  ctx: InvoiceEmailContext
): Promise<void> {
  await send({
    to: ctx.user.email,
    content: invoiceCreatedUserEmail(ctx),
    type: EmailEventType.INVOICE_CREATED_USER,
    userId: ctx.user.id,
    invoiceId: ctx.invoice.id,
  })
}

export async function sendInvoiceCreatedEmailToAdmin(
  ctx: InvoiceEmailContext
): Promise<void> {
  const env = getServerEnv()
  await send({
    to: env.ADMIN_NOTIFICATION_EMAIL,
    content: invoiceCreatedAdminEmail(ctx),
    type: EmailEventType.INVOICE_CREATED_ADMIN,
    userId: ctx.user.id,
    invoiceId: ctx.invoice.id,
  })
}

export async function sendInvoicePaidEmailToUser(ctx: InvoiceEmailContext): Promise<void> {
  await send({
    to: ctx.user.email,
    content: invoicePaidUserEmail(ctx),
    type: EmailEventType.INVOICE_PAID_USER,
    userId: ctx.user.id,
    invoiceId: ctx.invoice.id,
  })
}

export async function sendInvoicePaidEmailToAdmin(ctx: InvoiceEmailContext): Promise<void> {
  const env = getServerEnv()
  await send({
    to: env.ADMIN_NOTIFICATION_EMAIL,
    content: invoicePaidAdminEmail(ctx),
    type: EmailEventType.INVOICE_PAID_ADMIN,
    userId: ctx.user.id,
    invoiceId: ctx.invoice.id,
  })
}

export async function sendInvoiceExpiredEmailToUser(
  ctx: InvoiceEmailContext
): Promise<void> {
  await send({
    to: ctx.user.email,
    content: invoiceExpiredUserEmail(ctx),
    type: EmailEventType.INVOICE_EXPIRED_USER,
    userId: ctx.user.id,
    invoiceId: ctx.invoice.id,
  })
}

export async function sendInvoiceFailedEmailToUser(
  ctx: InvoiceEmailContext
): Promise<void> {
  await send({
    to: ctx.user.email,
    content: invoiceFailedUserEmail(ctx),
    type: EmailEventType.INVOICE_FAILED_USER,
    userId: ctx.user.id,
    invoiceId: ctx.invoice.id,
  })
}
