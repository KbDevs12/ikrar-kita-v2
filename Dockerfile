# syntax=docker/dockerfile:1.7

# ---------- 1. Base ----------
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.4.1 --activate
# libc6-compat is required by some native deps (sharp, argon2 NAPI)
RUN apk add --no-cache libc6-compat openssl ca-certificates
WORKDIR /app


# ---------- 2. Dependencies ----------
FROM base AS deps
COPY package.json pnpm-lock.yaml* .npmrc* ./
COPY prisma ./prisma
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --prefer-offline


# ---------- 3. Build ----------
FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Skip env validation at build time - real env is provided at runtime.
ENV SKIP_ENV_VALIDATION=1
RUN pnpm prisma generate && pnpm build


# ---------- 4. Runner ----------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN apk add --no-cache libc6-compat openssl ca-certificates tini \
 && addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy the standalone build output. Next.js standalone bundles only the
# minimum runtime needed plus a tiny server.js.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma needs the schema and engines at runtime for migrate deploy + client.
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000

# tini reaps zombie processes - important for Node + signal handling
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]
