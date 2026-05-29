/**
 * Singleton Prisma client.
 *
 * Avoids exhausting connection pool during dev hot-reload by reusing a single
 * client instance attached to globalThis. In production this still works
 * fine because the module is imported once per process.
 */
import { PrismaClient } from "@prisma/client"

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined
}

function createClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  })
}

export const prisma: PrismaClient = global.__prisma__ ?? createClient()

if (process.env.NODE_ENV !== "production") {
  global.__prisma__ = prisma
}
