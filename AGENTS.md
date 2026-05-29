# AGENTS.md

Konteks proyek untuk siapa pun (manusia atau agent) yang akan menyentuh kode
ini setelah saya. Baca sebelum mengubah arsitektur, menambah dependency, atau
membuat fitur baru.

## Project Overview

Ikrar Kita adalah SaaS undangan pernikahan digital berbasis Next.js.

User flow:

- register / login
- verifikasi email lewat tautan yang dikirim Gmail SMTP
- membuat draft undangan (multi-step builder)
- preview undangan kapan pun (gratis, tanpa subscription)
- publish hanya jika subscription aktif
- bayar subscription via Tripay (sandbox di dev, production di VPS)
- akses undangan publik di `/{slug}?to={nama_penerima}`

Plan & limit publish:

| Plan     | Harga / bulan  | Publish aktif       |
| -------- | -------------- | ------------------- |
| Basic    | Rp 100.000     | 1                   |
| Pro      | Rp 150.000     | 3                   |
| Reseller | Rp 350.000     | unlimited           |

Semua plan berdurasi 30 hari. Setelah expired, draft tetap tersimpan, public
URL menampilkan halaman "Undangan tidak aktif" sampai diperpanjang.

## Tech Stack

- Next.js 15 (App Router) + React 19 + TypeScript strict
- Tailwind CSS + shadcn/ui (Radix primitives)
- TanStack Form + Zod untuk semua form
- Prisma + PostgreSQL 16
- Redis 7 (cache + rate limit)
- MinIO (object storage, S3-compatible) di balik Nginx
- Nginx reverse proxy
- Tripay (sandbox / production)
- Nodemailer + Gmail SMTP untuk email transaksional
- Argon2id (`@node-rs/argon2`) untuk password hashing
- Leaflet untuk peta
- Framer Motion + GSAP + AOS + Lenis untuk animasi public invitation
- Vitest + Testing Library untuk test

## Repository Layout

```
src/
  app/                       Next.js routes (auth/dashboard/admin/api/[slug])
  components/
    ui/                      shadcn primitives
    dashboard/, billing/,    domain components
    invitation/templates/    10 invitation templates (one folder each)
    forms/                   reusable TanStack Form helpers
  server/
    auth/                    sessions, password, guards
    billing/                 subscription rules
    cache/                   Redis client + invitation/subscription helpers
    db/                      Prisma client singleton
    email/                   smtp.ts, email-service.ts, templates/
    invitation/              ownership + slug + publish
    media/                   upload, magic-byte sniff, MinIO
    payment/tripay.ts        Tripay service (closed payment + callback)
    security/api-key.ts      Internal API key + cron secret guards
    subscription/            limit + extension logic
  lib/
    constants/               upload limits, template registry, blocklists
    validators/              Zod schemas (auth, invitation, billing, ...)
    forms/                   TanStack Form ↔ Zod adapter
    utils/                   pure helpers (cn, formatRupiah, ...)
prisma/
  schema.prisma
  seed.ts
docker/
  nginx/                     dev + prod nginx configs
tests/
  validators/, server/, integration/
```

## Important Rules

### Forms

Setiap form yang diliat user wajib:

1. dibungkus TanStack Form
2. divalidasi dengan Zod schema yang sama di client dan server
3. punya state `idle | submitting | success | error`
4. menonaktifkan tombol submit selama request berjalan
5. memetakan error server ke field yang relevan (`form.setFieldError`)

Jangan duplikasi schema. Selalu import dari `src/lib/validators/<domain>.ts`.

### Server actions / route handlers

- Validasi setiap input dengan Zod, tidak peduli apakah client sudah
  memvalidasinya.
- Cek ownership sebelum mutasi: `invitation.userId === session.userId` atau
  role ADMIN.
- Cek `requireVerifiedUser()` untuk fitur utama (create/edit/publish
  invitation, upload media, checkout).
- Bungkus error stack trace - jangan dikirim ke client.

### Anti AI-Pattern UI

UI dan copywriting harus terasa dirancang manusia.

- Hindari frasa marketing klise ("seamless", "revolutionize", "unlock").
- Bahasa Indonesia natural, sopan, konteks pernikahan.
- Layout boleh asimetris terkontrol; jangan semua section grid 3 kolom rapi
  dengan card identik.
- Variasikan whitespace, ukuran heading, dan rhythm vertikal.
- Hindari emoji dan gradient berlebihan.
- 10 template undangan harus punya karakter visual berbeda, bukan sekadar
  ganti palet.

### Email Verification

Selama `User.emailVerifiedAt` masih null, user hanya boleh:

- melihat layar "verifikasi dulu"
- meminta resend (rate-limited di Redis)
- logout
- (opsional) mengubah email

Tidak boleh: create/edit/publish invitation, upload media, checkout, atau
submit RSVP sebagai owner. Server-side guard `requireVerifiedUser()` adalah
final authority - jangan hanya hidden di UI.

Domain email divalidasi server-side: format → typo suggestion → disposable
blocklist → MX lookup. Gagal MX → ditolak dengan pesan generik. Network error
saat MX lookup → fallback policy yang aman (lihat `validateRegistrationEmail`).

### Invitation status

`DRAFT` → boleh edit, boleh preview owner, tidak publik.
`PUBLISHED` → publik aktif **hanya jika** subscription owner ACTIVE.
`ARCHIVED` → tidak publik, tetap bisa diedit owner.

Ketika subscription expired, public page menampilkan halaman "Undangan tidak
aktif" tanpa data sensitif.

### Public URL

`/{slug}?to={recipient}`

- `slug` unik global, pola `/^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/`.
- `to` selalu disanitasi via `sanitiseRecipient()`. Tidak boleh dirender
  sebagai raw HTML. Default fallback: "Tamu Undangan".

### Tripay

- Semua kredensial server-only. Jangan pernah `NEXT_PUBLIC_TRIPAY_*`.
- Service `src/server/payment/tripay.ts` adalah satu-satunya yang
  memanggil API Tripay.
- Callback signature dibandingkan dengan `crypto.timingSafeEqual`.
- Callback wajib idempotent. Duplicate `PAID` callback tidak boleh
  membuat subscription dobel - gunakan database transaction yang membaca
  status invoice sebelum extend subscription.
- Mapping status: `PAID → PAID`, `EXPIRED → EXPIRED`, `FAILED → FAILED`,
  `REFUND → REFUND`.

### Internal API security

Endpoint cron / worker / service-to-service:

- Dilindungi `INTERNAL_API_KEY` (header `Authorization: Bearer ...` atau
  `X-Internal-Api-Key`) atau `CRON_SECRET` untuk cron.
- Pakai `crypto.timingSafeEqual`.
- Tidak boleh `NEXT_PUBLIC_*`.
- Tripay webhook **tidak** memakai `INTERNAL_API_KEY`; ia dilindungi
  signature Tripay sendiri.

### Redis cache keys

- `invitation:public:{slug}` (TTL 5 menit, di-invalidate saat publish/edit/
  archive/delete + saat subscription owner berubah status)
- `subscription:user:{userId}` (TTL 60 menit, di-invalidate saat
  invoice PAID, manual approve, atau cancel)
- `rate-limit:{identifier}:{action}` (TTL = window)

Saat subscription user berubah status, invalidate semua slug milik user.

### Upload limits

- Gambar maks 2 MB, MIME `image/jpeg|png|webp|avif`.
- Audio maks 3 MB, MIME `audio/mpeg|mp3|wav|ogg|mp4`.
- Server validasi MIME, ekstensi, magic bytes (`src/lib/constants/upload.ts`),
  dan ukuran. Client-side check hanyalah UX hint.
- Filename diganti dengan `${cuid()}.${ext}` sebelum disimpan ke MinIO.
  Tidak pernah menggunakan filename asli.

## Commit Rules

- Conventional Commits: `<type>(scope): description`.
- Types: `feat`, `fix`, `security`, `perf`, `refactor`, `docs`, `test`,
  `style`, `chore`, `build`, `ci`, `revert`.
- Satu commit = satu perubahan logis. Jangan campur auth + billing + UI
  besar dalam satu commit.
- Jangan commit `.env`, lockfile produksi, build artifact, atau `*.pem`.
- Setelah commit, tampilkan hash dan ringkasan singkat.

Contoh sah:

```
feat(auth): implement session login with HTTP-only cookie
security(webhook): verify Tripay callback signature with timing-safe compare
fix(subscription): prevent duplicate activation from repeated callback
perf(cache): cache public invitation by slug with 5m TTL
docs(agents): document email verification guard
```

## Development Commands

```bash
# Dependencies
pnpm install

# Local dev (host) + infra (docker)
docker compose up -d         # postgres, redis, minio, nginx
pnpm db:migrate              # prisma migrate dev
pnpm db:seed                 # plans + admin user
pnpm dev                     # Next.js on :3000

# Quality gates
pnpm lint
pnpm typecheck
pnpm test                    # vitest --run

# Production stack on VPS
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
docker compose exec app pnpm db:migrate:deploy
docker compose exec app pnpm db:seed
```

## Architecture Notes

- Route handler / server action hanya: parse → validate → call service →
  return. Tidak ada SQL/business logic langsung di sana.
- Service layer di `src/server/<domain>/` punya tanggung jawab tunggal.
- Prisma client diakses lewat `src/server/db/prisma.ts` (singleton).
- Redis client di `src/server/cache/redis.ts` (singleton).
- Email dispatch lewat `src/server/email/email-service.ts` - jangan
  panggil nodemailer dari route handler.

## Testing Notes

Wajib hijau sebelum merge:

- validators (auth, invitation, billing, rsvp, guest-message, media)
- slug sanitiser + recipient sanitiser
- subscription limit per plan
- publish guard (status + subscription + limit)
- Tripay signature generator + callback verification (timing-safe)
- Tripay callback idempotency (duplicate PAID → no double extension)
- email verification: token hash, expiry, single-use, resend rate limit
- disposable email blocker
- ownership: user A tidak bisa edit invitation user B
- internal API key guard
- public invitation cache invalidation pada publish/archive/expire

## Maintenance

Update dokumen ini ketika:

- menambah/mengubah model Prisma yang besar
- menambah/menghapus integrasi (payment provider, storage, email)
- mengubah flow auth/email-verification/publish
- mengubah perilaku cache atau rate limit secara signifikan
