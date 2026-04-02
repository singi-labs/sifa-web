FROM node:24-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL=https://sifa.id
ARG NEXT_PUBLIC_GLITCHTIP_DSN
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GLITCHTIP_DSN=$NEXT_PUBLIC_GLITCHTIP_DSN
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
RUN rm -rf .next/cache/fetch-cache
EXPOSE 3000
CMD ["node", "server.js"]
