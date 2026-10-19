# Product overview

Short map of what the **novin-club** FE ships today.

## User panel (`app/(panel)`)

| Area | Routes (examples) | Notes |
|------|-------------------|--------|
| Dashboard | `/dashboard` | Wallet widgets, missions preview, network tree, competition teaser |
| Network | `/dashboard/network` | Subsets, invite, VIP invite + KYC gate, marketing badges |
| Missions | `/dashboard/missions` | Promotion / onboarding / marketing sections + badges + activity |
| Leaderboard / pool | `/dashboard/leaderboard` | Competition pool, history modal (`?period=`), subsets board, honors |
| Wallet / reports | `/dashboard/wallet`, reports | Token summary, transactions, income |
| Notifications | panel chrome | List + activity |

## Admin (`app/(admin)`)

Admin console for users (incl. Sejam profile fields), missions, network closure/invites, system messages, pool/sediment/twin overviews. Auth may still use a local/dev bypass until BE admin login is fully live — see inbox.

## Public / marketing

| Surface | Notes |
|---------|--------|
| Landing (Tanvin) | Hero registration-link lead, join form (same lead API), badges, courses entry |
| Courses | `/courses`, `/courses/level-1` — login gate; authenticated visit completes `training_level_1` |

## Auth

SSO / NIB entry via BFF (`/auth/sso/*`, session cookies). Client talks only to `/api/v2/*`.

## Backend dependency

Open BE contracts and mocks live in **`novin-club-work/backend-inbox.md`**. Shapes live in `src/types/*`.
