# syntax=docker/dockerfile:1

ARG NODE_BASE_IMAGE=node:22-bookworm-slim

FROM ${NODE_BASE_IMAGE} AS base
WORKDIR /app
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable

FROM base AS deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
CMD ["yarn", "dev"]

FROM base AS builder
ARG NEXT_PUBLIC_APP_NAME="Nib Club"
ARG NEXT_PUBLIC_SITE_URL=https://api-club.nibdev.com
ARG NEXT_PUBLIC_APP_URL=https://api-club.nibdev.com
ARG NEXT_PUBLIC_SSO_CALLBACK_PATH=/login/sso
ARG NEXT_PUBLIC_PANEL_BASE_URL=https://panel.nibdev.com
ARG NEXT_PUBLIC_SSO_ENTRY_COOKIE=nib_auth
ARG NEXT_PUBLIC_PANEL_PROFILE_URL=https://panel.nibdev.com/profile/
ARG NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL=https://panel.nibdev.com/user-account/

ENV NODE_ENV=production \
  NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME \
  NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
  NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
  NEXT_PUBLIC_SSO_CALLBACK_PATH=$NEXT_PUBLIC_SSO_CALLBACK_PATH \
  NEXT_PUBLIC_PANEL_BASE_URL=$NEXT_PUBLIC_PANEL_BASE_URL \
  NEXT_PUBLIC_SSO_ENTRY_COOKIE=$NEXT_PUBLIC_SSO_ENTRY_COOKIE \
  NEXT_PUBLIC_PANEL_PROFILE_URL=$NEXT_PUBLIC_PANEL_PROFILE_URL \
  NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL=$NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build
RUN yarn install --frozen-lockfile --production=true

FROM base AS production
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs --no-create-home nextjs

COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV HOME=/app
CMD ["node", "node_modules/next/dist/bin/next", "start"]
