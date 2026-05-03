# =============================================================================
# ORTHONOBA — Multi-stage Production Dockerfile
# =============================================================================
# PREREQUISITE: next.config.ts must include `output: 'standalone'`
#   const nextConfig = { output: 'standalone', ... }
#
# .dockerignore (add this file at project root):
#   .git
#   .github
#   .next
#   node_modules
#   *.md
#   .env*
#   !.env.example
#   infra
#   scripts
#   nginx
#   certbot
#   docker-compose*.yml
#   Dockerfile
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: deps — install all dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps

# Install libc compatibility for native modules
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy only package files for layer caching
COPY package.json package-lock.json* ./

# Clean install — uses lock file exactly
RUN npm ci

# -----------------------------------------------------------------------------
# Stage 2: builder — compile the Next.js application
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy installed dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy full source
COPY . .

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build — produces .next/standalone + .next/static
# Requires next.config.ts: output: 'standalone'
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 3: runner — minimal production image
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat curl

WORKDIR /app

# Security: run as non-root user
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

# Create non-root system user
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Set correct ownership for prerender cache
RUN mkdir -p .next \
 && chown nextjs:nodejs .next

# Copy standalone output (includes server.js + minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

# Health-check so Docker / Coolify can track readiness
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
