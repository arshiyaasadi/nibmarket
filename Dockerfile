# No "# syntax=docker/dockerfile:…" — that pulls docker/dockerfile from Docker Hub
# and often gets 403 (CloudFront) on restricted networks (e.g. IR).
#
# Base image: prefer a Hub mirror. Override at build time if needed:
#   NODE_BASE_IMAGE=node:22-bookworm-slim docker compose ... build
#
# Do NOT `apt-get install ca-certificates` here — live IR hosts time out on
# deb.debian.org during build. Official node bookworm-slim already ships CAs.
#
# Production uses Next.js `output: "standalone"` so we never run a second
# `yarn install --production` (that step re-fetches the registry and hangs on slow nets).
ARG NODE_BASE_IMAGE=mirror.gcr.io/library/node:22-bookworm-slim

FROM ${NODE_BASE_IMAGE} AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 600000

FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
CMD ["yarn", "dev"]

FROM base AS builder
# Zone selects URL presets (src/config/env-presets.ts).
ARG APP_ENV=development
ARG NEXT_PUBLIC_APP_ENV=development
ARG NEXT_PUBLIC_PUBLIC_ORIGIN=
ARG FORCE_UI_DEV_MODE=
ARG NEXT_PUBLIC_FORCE_UI_DEV_MODE=
ARG NEXT_PUBLIC_UI_DEV_MODE=
ARG NEXT_PUBLIC_KEEP_SESSION_ON_401=
ARG GIT_SHA=unknown
ARG NEXT_PUBLIC_GIT_SHA=unknown
ARG BUILD_TIME=

ENV NODE_ENV=production \
  APP_ENV=$APP_ENV \
  NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV \
  NEXT_PUBLIC_PUBLIC_ORIGIN=$NEXT_PUBLIC_PUBLIC_ORIGIN \
  FORCE_UI_DEV_MODE=$FORCE_UI_DEV_MODE \
  NEXT_PUBLIC_FORCE_UI_DEV_MODE=$NEXT_PUBLIC_FORCE_UI_DEV_MODE \
  NEXT_PUBLIC_UI_DEV_MODE=$NEXT_PUBLIC_UI_DEV_MODE \
  NEXT_PUBLIC_KEEP_SESSION_ON_401=$NEXT_PUBLIC_KEEP_SESSION_ON_401 \
  GIT_SHA=$GIT_SHA \
  NEXT_PUBLIC_GIT_SHA=$NEXT_PUBLIC_GIT_SHA \
  BUILD_TIME=$BUILD_TIME

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Stamp deploy version (also served at /build-info.json)
RUN node -e "const fs=require('fs');const p=require('./package.json');fs.mkdirSync('public',{recursive:true});fs.writeFileSync('public/build-info.json',JSON.stringify({version:p.version,git:process.env.GIT_SHA||'unknown',builtAt:process.env.BUILD_TIME||new Date().toISOString()},null,2));"

RUN yarn build

FROM base AS production
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs --no-create-home nextjs

COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV HOME=/app
CMD ["node", "server.js"]
