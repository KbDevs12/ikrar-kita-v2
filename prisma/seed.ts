/**
 * Database seed.
 *
 * Idempotent - safe to run multiple times. Used by `pnpm db:seed`.
 *
 * Seeds:
 *   - Three plans (BASIC, PRO, RESELLER) with prices and limits from the spec.
 *   - One ADMIN user from SEED_ADMIN_* env. Password is hashed with Argon2id.
 *
 * Never hardcode admin passwords. The seed script will refuse to run if the
 * env explicitly leaves the placeholder password "change-this-password" in
 * production.
 */
import { PrismaClient, PlanCode, Role } from "@prisma/client"
import { hash } from "@node-rs/argon2"

const prisma = new PrismaClient()

const ARGON2_OPTIONS = {
  // OWASP recommended profile for interactive logins
  memoryCost: 19_456, // 19 MiB
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
} as const

async function seedPlans() {
  const plans = [
    {
      code: PlanCode.BASIC,
      name: "Basic",
      price: 100_000,
      durationDays: 30,
      invitationLimit: 1,
      description: "Pas untuk satu undangan dengan kebutuhan dasar.",
      sortOrder: 1,
    },
    {
      code: PlanCode.PRO,
      name: "Pro",
      price: 150_000,
      durationDays: 30,
      invitationLimit: 3,
      description: "Cocok untuk pasangan yang ingin punya beberapa varian undangan.",
      sortOrder: 2,
    },
    {
      code: PlanCode.RESELLER,
      name: "Reseller",
      price: 350_000,
      durationDays: 30,
      invitationLimit: null, // unlimited
      description: "Untuk vendor undangan yang menerbitkan banyak undangan tiap bulan.",
      sortOrder: 3,
    },
  ] as const

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { code: plan.code },
      update: {
        name: plan.name,
        price: plan.price,
        durationDays: plan.durationDays,
        invitationLimit: plan.invitationLimit,
        description: plan.description,
        sortOrder: plan.sortOrder,
        isActive: true,
      },
      create: { ...plan },
    })
  }

  console.log(`[seed] Plans upserted: ${plans.map((p) => p.code).join(", ")}`)
}

async function seedAdmin() {
  const name = process.env.SEED_ADMIN_NAME ?? "Admin"
  const email = (process.env.SEED_ADMIN_EMAIL ?? "admin@example.com").toLowerCase().trim()
  const password = process.env.SEED_ADMIN_PASSWORD ?? "change-this-password"

  if (process.env.NODE_ENV === "production" && password === "change-this-password") {
    throw new Error(
      "[seed] Refusing to seed admin with the placeholder password in production. " +
        "Set SEED_ADMIN_PASSWORD to a strong value."
    )
  }
  if (password.length < 8) {
    throw new Error("[seed] SEED_ADMIN_PASSWORD must be at least 8 characters")
  }

  const passwordHash = await hash(password, ARGON2_OPTIONS)
  const now = new Date()

  await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role: Role.ADMIN,
    },
    create: {
      name,
      email,
      passwordHash,
      role: Role.ADMIN,
      emailVerifiedAt: now,
      emailVerificationStatus: "VERIFIED",
    },
  })

  console.log(`[seed] Admin upserted: ${email}`)
}

async function main() {
  await seedPlans()
  await seedAdmin()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (err) => {
    console.error("[seed] failed:", err)
    await prisma.$disconnect()
    process.exit(1)
  })
