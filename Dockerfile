# Node 22 LTS — aligned with @types/node and Next 16
#
# Omit `# syntax=docker/dockerfile:1` so BuildKit does not pull `docker/dockerfile`
# from Docker Hub (often fails with `auth.docker.io` timeout on corporate networks).
#
# If pulling `node:22-bookworm-slim` from Docker Hub fails, set in `.env`:
#   NODE_BASE_IMAGE=public.ecr.aws/docker/library/node:22-bookworm-slim
# (Compose passes this as a build arg; see docker-compose.yml.)
ARG NODE_BASE_IMAGE=node:22-bookworm-slim
FROM ${NODE_BASE_IMAGE} AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

FROM base AS deps
COPY package.json package-lock.json .npmrc ./
RUN npm ci

FROM base AS development
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY docker-entrypoint.dev.sh /usr/local/bin/docker-entrypoint.dev.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.dev.sh
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.dev.sh"]
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "3000"]

FROM base AS builder
ENV NODE_ENV=production
ARG GIT_COMMIT=unknown
ARG GIT_COMMIT_FULL=unknown
ARG BUILD_TIME=
ARG APP_VERSION=0.0.0
ARG APP_ENV=production
# Baked into client bundle (see .dockerignore — .env is not COPY'd)
ARG NEXT_PUBLIC_API_BASE_URL=https://api-club.nibdev.com
ARG NEXT_PUBLIC_DATA_SOURCE=api
ARG NEXT_PUBLIC_API_ENABLED=
ARG NEXT_PUBLIC_JWT_EXPIRATION=5m
ARG NEXT_PUBLIC_JWT_SECRET=dd5f3089-40c3-403d-af14-d0c228b05cb4
ARG NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET=7c4c1c50-3230-45bf-9eae-c9b2e401c767
ENV GIT_COMMIT=$GIT_COMMIT \
    GIT_COMMIT_FULL=$GIT_COMMIT_FULL \
    BUILD_TIME=$BUILD_TIME \
    APP_VERSION=$APP_VERSION \
    APP_ENV=$APP_ENV \
    NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL \
    NEXT_PUBLIC_DATA_SOURCE=$NEXT_PUBLIC_DATA_SOURCE \
    NEXT_PUBLIC_API_ENABLED=$NEXT_PUBLIC_API_ENABLED \
    NEXT_PUBLIC_JWT_EXPIRATION=$NEXT_PUBLIC_JWT_EXPIRATION \
    NEXT_PUBLIC_JWT_SECRET=$NEXT_PUBLIC_JWT_SECRET \
    NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET=$NEXT_PUBLIC_JWT_REFRESH_TOKEN_SECRET
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN chmod +x scripts/write-build-info.sh \
  && if [ -z "$BUILD_TIME" ]; then export BUILD_TIME="$(date -u +%Y-%m-%dT%H:%M:%SZ)"; fi \
  && ./scripts/write-build-info.sh \
  && npm run build

FROM base AS production
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
