# ── Build stage ───────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# ── Development stage (hot-reload) ────────────────────────────────────────────
FROM node:24-alpine AS dev

WORKDIR /app

COPY package*.json ./
RUN npm ci

# prisma schema needed for generate inside the container
COPY prisma ./prisma
RUN npx prisma generate

# Source is bind-mounted at runtime by docker-compose — do not COPY here
EXPOSE 3000
CMD ["sh", "-c", "npm run start:dev"]

# ── Production stage ──────────────────────────────────────────────────────────
FROM node:24-alpine AS runner

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

# Compiled output
COPY --from=builder /app/dist ./dist
# Prisma generated client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Migrations (needed for migrate deploy at startup)
COPY prisma ./prisma

EXPOSE 3000

# Run migrations then start the pre-compiled app — no TypeScript compiler involved
CMD ["sh", "-c", "node dist/src/main.js"]