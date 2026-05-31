import "@testing-library/jest-dom/vitest"
import { afterEach, vi } from "vitest"
import { cleanup } from "@testing-library/react"

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Default test env - tests should override per-suite when needed.
// process.env.NODE_ENV is typed readonly in Node 20+ types, so cast through
// a permissive shape to assign without disabling strictness elsewhere.
;(process.env as Record<string, string | undefined>).NODE_ENV = "test"
process.env.SESSION_SECRET = "test-session-secret-change-me-32chars"
process.env.INTERNAL_API_KEY = "test-internal-api-key"
process.env.CRON_SECRET = "test-cron-secret"
process.env.ADMIN_API_KEY = "test-admin-api-key"
process.env.TRIPAY_MODE = "sandbox"
process.env.TRIPAY_API_KEY = "test-tripay-api-key"
process.env.TRIPAY_PRIVATE_KEY = "test-tripay-private-key"
process.env.TRIPAY_MERCHANT_CODE = "T0000"
