# Docs sync — playbook

Keeps zone docs and architecture notes aligned with the nested **novin-club** repo.

## Mission

1. After code / deploy / env changes, update `docs/**` so they match what runs.
2. Enforce the **two-zone** model: **dev** (nibdev) + **live** (nibmarket).
3. Club API paths stay on **`/api/v2`**.

## Owns

- `docs/05-ops/env.md`, `nibdev.md`, `nibmarket.md`
- `docs/02-architecture/*`
- `docs/04-design/*` when tokens/spacing change
- `docs/README.md` map

## Does not own

- Club BE pending work — that is **only** `novin-club-work/backend-inbox.md`
- API path/DTO catalogs as markdown — use `src/lib/api/endpoints.ts` + `src/types/*`

## Coordinates with

- Monorepo deploy context docs (if present outside this nest)
- Cursor rule `.cursor/rules/backend-inbox.mdc`

## Checklist (each sync)

1. Read `src/lib/api/endpoints.ts` → BFF version + paths
2. Confirm compose files: `docker-compose.dev.yml` + `docker-compose.live.yml`
3. Confirm `scripts/sync-dev.sh` / `sync-live.sh` vs ops docs
4. Patch `05-ops/*` if URLs/ports/env names changed
5. If BE contract changed: update **inbox** (and types JSDoc), not a separate api-contract.md
