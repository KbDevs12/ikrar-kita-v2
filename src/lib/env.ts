import { z } from "zod"

/**
 * Centralised, type-safe environment variable schema.
 *
 * - Server-only secrets must NEVER be prefixed with NEXT_PUBLIC_.
 * - This module is server-only. Client code should use the public env helpers
 *   exported separately (see env.public.ts) or read NEXT_PUBLIC_* directly.
 *
 * IMPORTANT: parsing happens lazily so that build-time tooling (next build,
 * prisma generate, etc.) does not crash when secrets are intentionally absent.
 */

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  COOKIE_DOMAIN: z.string().optional().default(""),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters"),

  // Internal service-to-service authentication
  INTERNAL_API_KEY: z.string().min(24, "INTERNAL_API_KEY must be at least 24 characters"),
  CRON_SECRET: z.string().min(24, "CRON_SECRET must be at least 24 characters"),
  ADMIN_API_KEY: z.string().min(24).optional(),

  // Tripay - sensitive, server-only
  TRIPAY_MODE: z.enum(["sandbox", "production"]).default("sandbox"),
  TRIPAY_API_KEY: z.string().min(1),
  TRIPAY_PRIVATE_KEY: z.string().min(1),
  TRIPAY_MERCHANT_CODE: z.string().min(1),
  TRIPAY_CALLBACK_URL: z.string().url(),
  TRIPAY_RETURN_URL: z.string().url(),

  // MinIO / object storage
  MINIO_ENDPOINT: z.string().url(),
  MINIO_PUBLIC_URL: z.string().url(),
  MINIO_ACCESS_KEY: z.string().min(1),
  MINIO_SECRET_KEY: z.string().min(1),
  MINIO_BUCKET: z.string().min(1).default("wedding-media"),

  // Email / SMTP
  SMTP_HOST: z.string().min(1).default("smtp.gmail.com"),
  SMTP_PORT: z.coerce.number().int().positive().default(587),
  SMTP_SECURE: z
    .union([z.boolean(), z.string()])
    .transform((v) => (typeof v === "string" ? v === "true" : v))
    .default(false),
  SMTP_USER: z.string().min(1),
  SMTP_PASSWORD: z.string().min(1),
  SMTP_FROM_NAME: z.string().min(1).default("Ikrar Kita"),
  SMTP_FROM_EMAIL: z.string().email(),
  ADMIN_NOTIFICATION_EMAIL: z.string().email(),

  EMAIL_VERIFICATION_TOKEN_TTL_MINUTES: z.coerce.number().int().positive().default(60),
  EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS: z.coerce.number().int().positive().default(60),

  // Seed
  SEED_ADMIN_NAME: z.string().min(1).default("Admin"),
  SEED_ADMIN_EMAIL: z.string().email().default("admin@example.com"),
  SEED_ADMIN_PASSWORD: z.string().min(8).default("change-this-password"),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>

let cached: ServerEnv | null = null

/**
 * Parse and return the server env. Call this only in server contexts.
 *
 * In production we want a hard fail at startup. In dev / tests we surface a
 * detailed error so the developer can fix the .env quickly.
 */
export function getServerEnv(): ServerEnv {
  if (cached) return cached

  const parsed = serverEnvSchema.safeParse(process.env)
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n")
    throw new Error(`Invalid server environment configuration:\n${issues}`)
  }

  cached = parsed.data
  return cached
}

/**
 * Public env values that are safe for the client. Keep this list tiny.
 */
export const publicEnv = {
  APP_URL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const
