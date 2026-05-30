/**
 * Singleton Prisma client.
 *
 * Avoids exhausting connection pool during dev hot-reload by reusing a single
 * client instance attached to globalThis. In production this still works
 * fine because the module is imported once per process.
 */
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import pg from "pg"

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined
}

function createClient(): PrismaClient {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["warn", "error"],
  })
}

export const prisma: PrismaClient = global.__prisma__ ?? createClient()

if (process.env.NODE_ENV !== "production") {
  global.__prisma__ = prisma
}
