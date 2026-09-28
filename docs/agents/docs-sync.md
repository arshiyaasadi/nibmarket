# Nibmarket Docs Sync — Playbook

Agent for the nested **nibmarket** repo (`projects/novin-company/nibmarket`). Keeps zone docs, API contracts, and deploy naming aligned with code.

## Mission

1. After code/deploy/env changes, update nested `docs/**` so they match what runs.
2. Enforce the **two-zone** model: **dev** (nibdev) + **live** (nibmarket) — no compose “v2” / UI dual stack.
3. Keep club API docs on **`/api/v2`**; do not resurrect club `/api/v1` BFF docs.

## Owns (nested repo)

- `docs/env.md`, `docs/nibdev.md`, `docs/nibmarket.md`
- `docs/api-contract.md`, `docs/architecture.md`, `docs/api/**`
- `.cursor/rules/docs-sync.mdc` (+ other nibmarket rules when they contradict code)

## Coordinates with

- Abysso **Document Curator** for monorepo pointers: `docs/context/nibmarket.md`, `docs/context/novin-live-deploy.md`
- Does **not** own novina, Nucleus React, or Abysso infra

## Checklist (each sync)

1. Read `src/lib/api/endpoints.ts` → BFF version + paths
2. Read compose files present → only `docker-compose.dev.yml` + `docker-compose.live.yml`
3. Read `scripts/sync-dev.sh` / `sync-live.sh` → commands and ports
4. Patch zone docs + env reference; remove stale filenames (`.env.v2`, `docker-compose.prod.yml`, `mlm_front_v2`, port 3003)
5. Confirm `.gitignore` still excludes `.cursor/`, `.claude/`, secrets

## Rule file

`.cursor/rules/docs-sync.mdc` (globs on docs/compose/scripts/env examples)
