# Database / Prisma Sync

- Canonical database schema lives in `../shared/database/schema.sql`.
- Every schema change must have a numbered SQL migration under `../shared/database/migrations/` and a changelog entry.
- `web-panel/prisma/schema.prisma` mirrors the SQL schema for Prisma Client only. Do not introduce Prisma Migrate as a separate migration source.
- After schema changes, run the SQL migration first, then sync Prisma:
  - `cd .. && ./db.sh migrate`
  - `cd web-panel && npm run db:pull && npm run db:generate`
- Keep `../shared/types/` aligned with database columns and enums.
- Keep `src/types/mlm.ts` as API DTOs, not raw Prisma row types.
- Convert Prisma rows to DTOs through `src/types/mappers.ts`.
- `DATABASE_URL` is server-only. Never expose it through `NEXT_PUBLIC_*`.
- The BFF may read wallet balances and transactions, but must not update balances directly. Financial mutations must go through event/transaction flows.
