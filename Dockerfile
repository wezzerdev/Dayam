# ----------------------------------------------------
# Dockerfile para Dokploy / VPS - Boutique & Accesorios
# Next.js 14 Standalone Multi-stage Build
# ----------------------------------------------------

# Stage 1: Base & Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno en tiempo de compilación (Next.js client-side)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_STORE_NAME
ARG NEXT_PUBLIC_STORE_TAGLINE
ARG NEXT_PUBLIC_WHATSAPP_PHONE
ARG NEXT_PUBLIC_CURRENCY_SYMBOL
ARG NEXT_PUBLIC_CURRENCY_CODE

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Configurar permisos para Next.js standalone
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copiar artefactos standalone generados por Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
