# Ikrar Kita

SaaS undangan pernikahan digital. Self-hosted di VPS, single-region, Bahasa
Indonesia first.

> Status: dalam pengembangan. Lihat `AGENTS.md` untuk konteks arsitektur dan
> aturan kontribusi.

## Daftar isi

- [Stack](#stack)
- [Persyaratan](#persyaratan)
- [Pengembangan lokal](#pengembangan-lokal)
- [Variabel lingkungan](#variabel-lingkungan)
- [Database](#database)
- [Test, lint, build](#test-lint-build)
- [Deployment ke VPS](#deployment-ke-vps)
- [SSL / domain](#ssl--domain)
- [Backup & restore](#backup--restore)
- [Update aplikasi](#update-aplikasi)
- [Troubleshooting](#troubleshooting)

## Stack

- Next.js 15 (App Router), React 19, TypeScript strict
- Tailwind CSS + shadcn/ui
- TanStack Form + Zod
- Prisma + PostgreSQL 16
- Redis 7
- MinIO (S3-compatible)
- Nginx reverse proxy
- Tripay (payment)
- Gmail SMTP (email transaksional)

Detail di [`AGENTS.md`](./AGENTS.md).

## Persyaratan

- Node.js ≥ 20.11 (di-test pada 22)
- pnpm ≥ 9
- Docker & Docker Compose v2
- Akun Gmail / Google Workspace + App Password (untuk SMTP)
- Akun Tripay (sandbox dulu, kemudian production merchant)
- VPS Ubuntu 22.04+ untuk produksi (1 vCPU / 2 GB RAM minimum, 2 vCPU / 4 GB
  disarankan)

## Pengembangan lokal

```bash
git clone https://github.com/<org>/ikrar-kita.git
cd ikrar-kita
cp .env.example .env
# isi semua variabel WAJIB di .env (lihat bagian berikut)

pnpm install

# Jalankan postgres, redis, minio, nginx via Docker
docker compose up -d

# Migrasi + seed
pnpm db:migrate
pnpm db:seed

# Dev server di http://localhost:3000
pnpm dev
```

Saat dev:

- Next.js berjalan di host (`pnpm dev`).
- PostgreSQL, Redis, dan MinIO berjalan dalam container; port 5432, 6379,
  9000 (S3), dan 9001 (MinIO Console) ter-bind ke host.
- Nginx dev (port 8080) memproxy `host.docker.internal:3000` dan
  `/media/...` ke MinIO. Tidak wajib digunakan untuk dev.

### Membuat akun admin

Set di `.env`:

```env
SEED_ADMIN_NAME=Admin
SEED_ADMIN_EMAIL=admin@yourdomain.id
SEED_ADMIN_PASSWORD=<password kuat>
```

Lalu:

```bash
pnpm db:seed
```

Skrip ini idempotent dan akan menolak password placeholder
`change-this-password` di `NODE_ENV=production`.

## Variabel lingkungan

Salin `.env.example` ke `.env` dan isi semua nilai. Variabel yang **wajib
diisi sebelum first run**:

| Variabel                          | Catatan                                              |
| --------------------------------- | ---------------------------------------------------- |
| `SESSION_SECRET`                  | `openssl rand -base64 48`                            |
| `INTERNAL_API_KEY`                | `openssl rand -hex 32`                               |
| `CRON_SECRET`                     | `openssl rand -hex 32`                               |
| `DATABASE_URL`                    | Sesuaikan host (`localhost` di host, `postgres` di docker) |
| `REDIS_URL`                       | Idem                                                 |
| `TRIPAY_API_KEY/PRIVATE_KEY/...`  | Dari dashboard Tripay (sandbox dulu)                 |
| `MINIO_*`                         | Akses Object Storage                                 |
| `SMTP_USER/PASSWORD`              | App Password Gmail, bukan password akun              |
| `SMTP_FROM_EMAIL`                 | Email pengirim (biasanya = `SMTP_USER`)              |
| `ADMIN_NOTIFICATION_EMAIL`        | Tujuan notifikasi transaksi & callback Tripay        |
| `SEED_ADMIN_*`                    | Akun admin awal                                      |

Variabel server-only **tidak boleh** di-prefix `NEXT_PUBLIC_`. Hanya nilai
yang aman dikonsumsi browser yang diberi prefix tersebut (`NEXT_PUBLIC_APP_URL`).

## Database

Skema definisi di `prisma/schema.prisma`. Perintah umum:

```bash
pnpm db:generate          # regenerate Prisma client
pnpm db:migrate           # buat & apply migrasi (dev)
pnpm db:migrate:deploy    # apply migrasi (prod, tidak interaktif)
pnpm db:push              # sync skema tanpa migrasi (hanya untuk eksperimen)
pnpm db:seed              # idempotent: plans + admin
pnpm db:studio            # browser UI untuk DB
```

## Test, lint, build

```bash
pnpm lint
pnpm typecheck
pnpm test                 # vitest --run
pnpm build                # next build (memanggil prisma generate dulu)
```

CI di GitHub Actions akan menjalankan lint + typecheck + test pada setiap
push (file workflow akan ditambahkan pada milestone CI/CD).

## Deployment ke VPS

### Persiapan VPS

```bash
# Ubuntu 22.04 + Docker Engine + Compose v2
sudo apt update
sudo apt install -y ca-certificates curl gnupg ufw
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Firewall - biarkan 22, 80, 443 saja
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Deploy

```bash
# Sebagai user non-root yang ada di group docker
git clone https://github.com/<org>/ikrar-kita.git
cd ikrar-kita
cp .env.example .env
# Isi semua nilai produksi. Pastikan TRIPAY_MODE=production hanya jika
# merchant production sudah disetujui Tripay.

# Build & jalankan
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Migrasi + seed (sekali saat first deploy)
docker compose exec app pnpm db:migrate:deploy
docker compose exec app pnpm db:seed
```

Service yang berjalan:

- `app` (Next.js) - hanya `expose 3000` ke network internal
- `postgres`, `redis`, `minio` - tidak ter-publish ke host
- `nginx` - satu-satunya yang membuka 80 & 443 ke publik

Cek health:

```bash
docker compose ps
docker compose logs -f app
curl -f http://localhost/api/health || echo "app belum siap"
```

### Konfigurasi domain

1. Arahkan A-record domain (mis. `ikrarkita.id`) ke IP VPS.
2. Edit `docker/nginx/conf.d.prod/default.conf`, ganti `your-domain.id`
   dengan domain Anda.
3. Restart nginx: `docker compose restart nginx`.

## SSL / domain

Gunakan Certbot di host atau di container. Cara host paling sederhana:

```bash
sudo apt install -y certbot
# Hentikan nginx sementara agar 80 bebas
docker compose stop nginx
sudo certbot certonly --standalone -d ikrarkita.id -d www.ikrarkita.id
# Salin sertifikat ke folder yang di-mount nginx
sudo cp /etc/letsencrypt/live/ikrarkita.id/fullchain.pem docker/nginx/ssl/
sudo cp /etc/letsencrypt/live/ikrarkita.id/privkey.pem   docker/nginx/ssl/
sudo chown -R $USER docker/nginx/ssl
docker compose start nginx
```

Renew (cron host):

```cron
0 3 * * 0 certbot renew --quiet --pre-hook "docker compose -f /opt/ikrar-kita/docker-compose.yml -f /opt/ikrar-kita/docker-compose.prod.yml stop nginx" --post-hook "cp /etc/letsencrypt/live/ikrarkita.id/fullchain.pem /opt/ikrar-kita/docker/nginx/ssl/ && cp /etc/letsencrypt/live/ikrarkita.id/privkey.pem /opt/ikrar-kita/docker/nginx/ssl/ && docker compose -f /opt/ikrar-kita/docker-compose.yml -f /opt/ikrar-kita/docker-compose.prod.yml start nginx"
```

## Backup & restore

### PostgreSQL

```bash
# Backup
docker compose exec -T postgres pg_dump -U postgres -F c wedding_saas \
  > backups/db-$(date +%Y%m%d-%H%M).dump

# Restore
docker compose exec -T postgres pg_restore -U postgres -d wedding_saas --clean \
  < backups/db-2026-05-29-0300.dump
```

Otomatisasi via cron host:

```cron
30 2 * * * cd /opt/ikrar-kita && docker compose exec -T postgres pg_dump -U postgres -F c wedding_saas | gzip > /opt/ikrar-kita/backups/db-$(date +\%Y\%m\%d).dump.gz
```

### MinIO / media

```bash
# Backup volume MinIO (semua media)
docker run --rm -v ikrar-kita_minio-data:/data -v $(pwd)/backups:/backup \
  alpine tar czf /backup/minio-$(date +%Y%m%d).tgz -C /data .

# Restore
docker compose stop minio
docker run --rm -v ikrar-kita_minio-data:/data -v $(pwd)/backups:/backup \
  alpine sh -c "rm -rf /data/* && tar xzf /backup/minio-2026-05-29.tgz -C /data"
docker compose start minio
```

Atau gunakan `mc mirror` ke object storage off-site:

```bash
docker compose exec minio mc mirror /data s3-offsite/ikrar-kita-backups/
```

## Update aplikasi

```bash
git pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml build app
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d app

# Apply migrasi baru (jika ada)
docker compose exec app pnpm db:migrate:deploy
```

Rolling update tanpa downtime di single-host belum dikonfigurasi - jika
butuh, jalankan dua replika `app` di belakang nginx upstream.

## Troubleshooting

| Gejala                                  | Pemeriksaan                                                                    |
| --------------------------------------- | ------------------------------------------------------------------------------ |
| App container crash loop                | `docker compose logs app` - biasanya env tidak valid (Zod parse error)        |
| `relation "..." does not exist`         | Jalankan `pnpm db:migrate:deploy`                                              |
| Email verifikasi tidak masuk            | `docker compose exec app env | grep SMTP` + cek log `EmailEvent` di DB        |
| Tripay callback ditolak                 | Lihat `PaymentEvent.isValidSignature=false` - cek `TRIPAY_PRIVATE_KEY`         |
| Public invitation tidak muncul          | Cek subscription user `ACTIVE` dan invitation `PUBLISHED` di Prisma Studio    |
| Upload >2 MB ditolak                    | Sengaja - lihat `src/lib/constants/upload.ts`                                  |

## Lisensi

Lihat [LICENSE](./LICENSE).
