FROM node:lts-alpine AS base

# Stage 1: Build the application (deps + builder統合)
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Next.js ビルド
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 2: Production server
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]