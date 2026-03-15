# TipAgent API - Node.js Build for Coolify
# Build from monorepo root

# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Install build dependencies
RUN apk add --no-cache python3 make g++ openssl-dev

WORKDIR /app

# Copy workspace config files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY turbo.json ./

# Copy packages
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build shared package
WORKDIR /app/packages/shared
RUN pnpm build 2>/dev/null || echo "No build script in shared"

# Build API
WORKDIR /app/apps/api
RUN pnpm build

# Production stage
FROM node:22-alpine AS runner

# Install runtime dependencies for Prisma
RUN apk add --no-cache openssl-dev

WORKDIR /app

# Copy built API
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/apps/api/prisma ./prisma

# Copy node_modules (including Prisma client)
COPY --from=builder /app/node_modules ./node_modules

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
