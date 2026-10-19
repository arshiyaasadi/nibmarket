# Spacing system

Tokens are defined as `--spacing-*` in [`src/styles/globals.css`](../../src/styles/globals.css) (`@theme`).  
Tailwind v4 exposes them as utilities: `gap-atom`, `p-pad-mol`, `py-pad-org`, …

## Rule

> Do **not** use raw Tailwind spacing numbers (`p-4`, `gap-6`, `mt-8`) or arbitrary values (`p-[13px]`) for layout.  
> Use the semantic tokens below.

## Tokens

### Atom (4–12px)

| Utility | CSS var | px | Use |
|---------|---------|----|-----|
| `gap-atom` / `p-atom` | `--spacing-atom` | 4 | Icon ↔ label |
| `gap-atom-md` | `--spacing-atom-md` | 8 | Badge ↔ text |
| `p-pad-atom` / `px-pad-atom` | `--spacing-pad-atom` | 6 | Chip / compact control padding |
| `px-pad-atom-md` | `--spacing-pad-atom-md` | 12 | Input / table cell padding |
| `py-pad-atom-xs` | `--spacing-pad-atom-xs` | 2 | Micro padding (close btn) |

### Molecule (16–32px)

| Utility | CSS var | ~px | Use |
|---------|---------|-----|-----|
| `gap-mol` | `--spacing-mol` | 16 | Atoms inside a molecule |
| `gap-mol-md` / `px-mol-md` | `--spacing-mol-md` | 24 | Card grids / larger control padding |
| `p-pad-mol` / `px-pad-mol` | `--spacing-pad-mol` | 16 | Molecule container padding |
| `p-pad-mol-md` | `--spacing-pad-mol-md` | 32 | Card / form block padding |
| `gap-stack-mol` / `p-stack-mol` | `--spacing-stack-mol` | 20 | Vertical row stack |

### Organism (32–80px)

| Utility | CSS var | px | Use |
|---------|---------|----|-----|
| `gap-org` | `--spacing-org` | 32 | Molecules inside a section |
| `gap-org-md` | `--spacing-org-md` | 48 | Section column gap |
| `py-pad-org` | `--spacing-pad-org` | 48 | Section vertical padding |
| `px-pad-org-x` | `--spacing-pad-org-x` | 64 | Section horizontal padding |
| `gap-stack-org` | `--spacing-stack-org` | 80 | Section ↔ section |

### Controls & addons

| Utility | CSS var | px | Use |
|---------|---------|----|-----|
| `h-control-h` (if used) / `--spacing-control-h` | 48 | Default control height |
| `--spacing-control-h-sm` | 36 | Compact control |
| `--spacing-control-h-lg` | 56 | Large control |
| `pe-pad-addon` | `--spacing-pad-addon` | 36 | Input/select icon end padding |

## Example

```tsx
// Good — semantic tokens
<section className="px-pad-org-x py-pad-org">
  <div className="flex flex-col gap-org">
    <div className="border-border bg-surface flex flex-col gap-mol rounded-2xl p-pad-mol-md">
      <div className="flex items-center gap-atom-md">
        {/* icon + title */}
      </div>
    </div>
  </div>
</section>

// Bad — raw scale / magic numbers
<section className="px-8 py-12">
  <div className="gap-6 p-[18px]" />
</section>
```

## Component author notes

Document internal vs external spacing in file headers when adding organisms, e.g.:

```ts
/**
 * @level organism
 * @spacing internal: gap-mol p-pad-mol-md | external: none
 */
```
