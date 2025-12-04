# Curetfy COD Form - Production Dockerfile

FROM node:20-alpine AS base
RUN apk add --no-cache openssl libc6-compat

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy necessary files
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/shopify.app.toml ./

EXPOSE 3000

# Run migrations and start server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
