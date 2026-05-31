/**
 * Nodemailer transport singleton.
 *
 * Constructed lazily so unit tests don't open a real SMTP connection.
 * In production the connection is pooled and reused across requests.
 */
import "server-only"
import nodemailer, { type Transporter } from "nodemailer"
import { getServerEnv } from "@/lib/env"

let transporter: Transporter | null = null

export function getTransport(): Transporter {
  if (transporter) return transporter
  const env = getServerEnv()

  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    // 587 + STARTTLS by default. 465 = implicit TLS.
    secure: env.SMTP_SECURE === true,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASSWORD,
    },
    pool: true,
    maxConnections: 3,
    maxMessages: 100,
    // Sane retry behaviour for transient Gmail SMTP errors
    socketTimeout: 30_000,
    connectionTimeout: 15_000,
  })

  return transporter
}

export function getDefaultFrom(): string {
  const env = getServerEnv()
  return `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`
}
