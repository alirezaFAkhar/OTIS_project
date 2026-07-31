# Dockerfile برای Next.js Standalone Build
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Referrer-gate env must exist at build time for middleware bundle (server layout also reads runtime env).
ARG REFERRER_GATE_ENABLED=false
ARG REFERRER_GATE_ALLOWED_URLS=
ARG REFERRER_GATE_REDIRECT_URL=
ARG REFERRER_GATE_ALLOW_DIRECT_NAVIGATION=false
ENV REFERRER_GATE_ENABLED=$REFERRER_GATE_ENABLED
ENV REFERRER_GATE_ALLOWED_URLS=$REFERRER_GATE_ALLOWED_URLS
ENV REFERRER_GATE_REDIRECT_URL=$REFERRER_GATE_REDIRECT_URL
ENV REFERRER_GATE_ALLOW_DIRECT_NAVIGATION=$REFERRER_GATE_ALLOW_DIRECT_NAVIGATION

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]





