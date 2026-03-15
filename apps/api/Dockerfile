# Build stage
FROM node:22-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++ sqlite-dev

WORKDIR /app

# Copy workspace root files
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copy packages
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared package first
WORKDIR /app/packages/shared
RUN pnpm build || true

# Build API
WORKDIR /app/apps/api
RUN pnpm build

# Production stage
FROM node:22-alpine AS runner

# Install runtime dependencies for better-sqlite3
RUN apk add --no-cache sqlite-libs

WORKDIR /app

# Copy built files and node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/node_modules ./node_modules_root
COPY --from=builder /app/apps/api/src/db/schema.sql ./dist/db/schema.sql

# Create data directory for SQLite
RUN mkdir -p /app/data

# Set environment
ENV NODE_ENV=production
ENV DATABASE_PATH=/app/data/tipagent.db
ENV PORT=3000

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

CMD ["node", "dist/server.js"]
