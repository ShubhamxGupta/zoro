# Multi-stage Production Dockerfile for Repository Intelligence Platform
FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-libc-dev --no-cache python3 make g++ git

# Stage 1: Dependency Installation
FROM base AS dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY services ./services
COPY apps ./apps
RUN npm install -g pnpm@9.1.0 && pnpm install --frozen-lockfile

# Stage 2: Build Application Packages
FROM dependencies AS builder
RUN pnpm build

# Stage 3: Production Runtime Image (Air-Gapped Hardened Container)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV AIR_GAPPED_MODE=true

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/services/api/dist ./services/api/dist
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/cli/dist ./apps/cli/dist

EXPOSE 3000 3001

USER node

CMD ["node", "services/api/dist/index.js"]
