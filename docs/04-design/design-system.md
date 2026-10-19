# Design system

Source of truth for tokens: [`src/styles/globals.css`](../../src/styles/globals.css) (`@theme` block).  
Use Tailwind utilities generated from those CSS variables (e.g. `bg-primary`, `text-muted`, `rounded-lg`).

## Brand colors

| Token | Approx value | Use |
|-------|----------------|-----|
| `primary` | `#501e78` | Brand purple — CTAs, active states |
| `primary-50` … `primary-950` | palette | Surfaces, hovers, soft fills |
| `accent` | `#ffc83a` | Marketing / landing gold CTAs |
| `accent-hover` | `#ffd65c` | Accent hover |
| `secondary` | `#6f6a9e` | Neutral purple-grey |

```tsx
className="bg-primary text-white"
className="bg-accent text-foreground hover:bg-accent-hover"
```

## Neutrals & semantic

| Token | Use |
|-------|-----|
| `background` | Page background |
| `surface` / `surface-2` | Cards, nested panels |
| `border` | Dividers, card outlines |
| `muted` | Secondary text, placeholders |
| `foreground` | Primary text |
| `success` / `warning` / `danger` / `info` | Feedback |

Dark mode overrides live in the same `globals.css` file (`prefers-color-scheme` + `.dark` / `.light` classes).

## Typography

**IRANSans** (FaNum pack) — `public/fonts/`, wired as `--font-sans`.

Type scale is shifted one step up from Tailwind defaults in `@theme` (`--text-xs` … `--text-9xl`). Prefer semantic sizes: `text-sm`, `text-base`, `text-lg`, …

## Radius

| Token | Typical use |
|-------|-------------|
| `rounded-sm` / `rounded` / `rounded-md` | Controls, chips |
| `rounded-lg` / `rounded-xl` / `rounded-2xl` | Cards, panels |
| `rounded-full` | Avatars, pills |

## Components

Atomic Design folders:

- `src/components/atoms`
- `src/components/molecules`
- `src/components/organisms`

Prefer existing atoms (`Button`, `Input`, `Modal`, …) before inventing new primitives.

## Spacing

See [`spacing.md`](./spacing.md) — **semantic spacing tokens only** (no raw `p-4` / arbitrary values for layout).
