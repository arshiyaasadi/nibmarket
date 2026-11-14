# Novin Club docs

English documentation map for the **novin-club** frontend (Tanvin / Nib Club panel).

**Project status:** feature-complete enough for stable FE demos; club backend still has open work tracked only in the inbox.

## Sources of truth

| Concern | Where |
|---------|--------|
| API **paths** | [`src/lib/api/endpoints.ts`](../src/lib/api/endpoints.ts) |
| API **DTO shapes** | [`src/types/mlm.ts`](../src/types/mlm.ts), [`src/types/admin.ts`](../src/types/admin.ts) (JSDoc on types) |
| Pending **club BE** work | [`../../novin-club-work/backend-inbox.md`](../../novin-club-work/backend-inbox.md) |
| Mission seed codes | [`03-data/missions-catalog.json`](./03-data/missions-catalog.json) |
| Admin Twin / treasury BE share packet | [`admin-twin-token-api.md`](./admin-twin-token-api.md) |

Do **not** recreate general markdown API contracts. Exception: the Twin treasury share file above (packet **K**) is maintained for club BE handoff — keep it aligned with types + inbox when Twin APIs change.

## Doc folders

| Folder | Contents |
|--------|----------|
| [`01-product/`](./01-product/) | What shipped (panel, admin, landing, courses) |
| [`02-architecture/`](./02-architecture/) | Stack, BFF, feature pattern, proxy |
| [`03-data/`](./03-data/) | Seed JSON (missions catalog) |
| [`04-design/`](./04-design/) | Design system + spacing tokens |
| [`05-ops/`](./05-ops/) | Deploy (dev + live), env, nibdev, nibmarket |
| [`06-agents/`](./06-agents/) | Agent playbooks (docs sync) |

Docs and code comments are **English only** (UI copy / seed `labelFa` may be Persian).

## Ops quick links

| Doc | Use |
|-----|-----|
| [`05-ops/deploy.md`](./05-ops/deploy.md) | **Start here** — both zones stable |
| [`05-ops/nibdev.md`](./05-ops/nibdev.md) | Dig blue/green |
| [`05-ops/nibmarket.md`](./05-ops/nibmarket.md) | Live CDN origin |
| [`05-ops/env.md`](./05-ops/env.md) | Env / presets |

## Related

- Work / share inbox: `novin-club-work/backend-inbox.md`
- Cursor rule: `.cursor/rules/backend-inbox.mdc`
