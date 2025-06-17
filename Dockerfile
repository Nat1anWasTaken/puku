# syntax=docker/dockerfile:1

# Base image with Bun
FROM oven/bun:1-alpine AS base

# Install system dependencies for PDF processing
RUN apk add --no-cache \
  imagemagick \
  ghostscript \
  fontconfig \
  ttf-dejavu \
  python3 \
  make \
  g++ \
  cairo-dev \
  jpeg-dev \
  pango-dev \
  giflib-dev \
  pixman-dev

WORKDIR /app

# Install dependencies
FROM base AS deps

COPY bun.lockb package.json ./
RUN bun install

# Rebuild the source code
FROM base AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Optional: disable Next.js telemetry during build
# ENV NEXT_TELEMETRY_DISABLED=1

RUN bun run build

# Production image
FROM base AS runner

WORKDIR /app

ENV NODE_ENV=production
# Optional: disable telemetry at runtime
# ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 -S nodejs \
  && adduser -u 1001 -S nextjs -G nodejs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
