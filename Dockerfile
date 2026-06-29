# syntax=docker/dockerfile:1

ARG NODE_BASE_IMAGE=node:22-bookworm-slim

FROM ${NODE_BASE_IMAGE} AS base
WORKDIR /app
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json package-lock.json .npmrc ./
RUN npm ci --include=optional --no-audit --no-fund

FROM base AS development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "dev"]

FROM base AS builder
ARG GIT_COMMIT=unknown
ARG GIT_COMMIT_FULL=unknown
ARG BUILD_TIME=
ARG APP_VERSION=0.1.0
ARG APP_ENV=production

ARG NEXT_PUBLIC_APP_NAME="Nib Club"
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_SSO_CALLBACK_PATH=/login/sso
ARG NEXT_PUBLIC_PANEL_BASE_URL=https://panel.nibdev.com
ARG NEXT_PUBLIC_PANEL_LOGIN_URL=
ARG NEXT_PUBLIC_SSO_ENTRY_COOKIE=nib_auth
ARG NEXT_PUBLIC_PANEL_PROFILE_URL=https://panel.nibdev.com/profile/
ARG NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL=https://panel.nibdev.com/user-account/

ENV NODE_ENV=production \
  GIT_COMMIT=$GIT_COMMIT \
  GIT_COMMIT_FULL=$GIT_COMMIT_FULL \
  BUILD_TIME=$BUILD_TIME \
  APP_VERSION=$APP_VERSION \
  APP_ENV=$APP_ENV \
  NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME \
  NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
  NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL \
  NEXT_PUBLIC_SSO_CALLBACK_PATH=$NEXT_PUBLIC_SSO_CALLBACK_PATH \
  NEXT_PUBLIC_PANEL_BASE_URL=$NEXT_PUBLIC_PANEL_BASE_URL \
  NEXT_PUBLIC_PANEL_LOGIN_URL=$NEXT_PUBLIC_PANEL_LOGIN_URL \
  NEXT_PUBLIC_SSO_ENTRY_COOKIE=$NEXT_PUBLIC_SSO_ENTRY_COOKIE \
  NEXT_PUBLIC_PANEL_PROFILE_URL=$NEXT_PUBLIC_PANEL_PROFILE_URL \
  NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL=$NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL \
  DATABASE_URL=postgresql://build:build@localhost:5432/build

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 --ingroup nodejs nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
CMD ["node", "server.js"]
