/**
 * Password hashing / verification with Argon2id.
 *
 * Profile follows OWASP guidance for interactive logins:
 *   - 19 MiB memory cost
 *   - 2 iterations
 *   - 1 parallelism lane
 *
 * Why Argon2id: PHC winner, side-channel resistant, modern. We use the
 * native `@node-rs/argon2` for performance (vs. argon2-browser) and so the
 * Docker image stays small.
 */
import "server-only"
import { hash as argonHash, verify as argonVerify } from "@node-rs/argon2"

const ARGON2_OPTIONS = {
  memoryCost: 19_456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
} as const

export async function hashPassword(plain: string): Promise<string> {
  return argonHash(plain, ARGON2_OPTIONS)
}

export async function verifyPassword(plain: string, hashStr: string): Promise<boolean> {
  try {
    return await argonVerify(hashStr, plain)
  } catch {
    // Bad hash format / corrupt - treat as a non-match.
    return false
  }
}
