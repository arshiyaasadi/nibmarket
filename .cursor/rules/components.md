# Component Rules

## Atomic Design

```
atoms/     ← عناصر بنیادی (Button، Input، Badge، Card، ...)
molecules/ ← ترکیب چند atom (FormField، SearchBar، ...)
organisms/ ← بخش‌های کامل UI (Sidebar، DataTable، ...)
```

همه atoms در `src/components/ui/atoms/` قرار دارند.  
import از barrel: `import { Button, Card } from "@/components/ui"`

## قوانین atoms

- **نباید margin بیرونی داشته باشند** — `mb-*`، `mt-*` روی خودشان ممنوع
- فاصله بین atoms توسط parent با `gap-*` مدیریت می‌شود
- هر component باید `@level` JSDoc داشته باشد

```tsx
/**
 * @level atom
 * @spacing internal: px-pad-mol, gap-atom-md | external: none
 */
export function Button(...) { ... }
```

## Spacing

فقط توکن‌های semantic — نه اعداد خام:

```tsx
// ✅ درست
<div className="flex gap-atom-md p-pad-mol">

// ❌ اشتباه  
<div className="flex gap-2 p-4">
```

توکن‌های کامل در `docs/spacing.md` و `tailwind.config.ts`.

## RTL

همیشه از CSS logical properties استفاده کنید:

```tsx
// ✅ درست — RTL-aware
className="ps-pad-atom-md pe-pad-addon start-0 end-pad-atom-md"

// ❌ اشتباه — direction-dependent
className="pl-3 pr-9 left-0 right-3"
```

| Tailwind physical | Logical (RTL-safe) |
|-------------------|--------------------|
| `pl-*` / `pr-*` | `ps-*` / `pe-*` |
| `ml-*` / `mr-*` | `ms-*` / `me-*` |
| `left-*` / `right-*` | `start-*` / `end-*` |
| `text-right` | `text-start` یا `text-right` (فارسی همیشه راست) |

## موجود در Design System

| Component | Variants/Notes |
|-----------|----------------|
| `Button` | primary/secondary/outline/ghost/danger، sm/md/lg، loading |
| `Badge` | 6 variant، dot indicator، sm/md |
| `Alert` | info/success/warning/danger، dismissible |
| `Input` | label، hint، error، startAddon/endAddon |
| `Select` | options، placeholder، error |
| `Checkbox` | label، hint، error |
| `Toggle` | sm/md، label، hint |
| `RadioGroup` | vertical/horizontal، error |
| `Label` | required، hint |
| `Avatar` | xs/sm/md/lg/xl، status dot |
| `AvatarGroup` | max overlap |
| `Spinner` / `SpinnerPage` | xs/sm/md/lg |
| `Card` / `CardHeader` / `CardBody` / `CardFooter` | padding sm/md/lg |
| `StatCard` | trend up/down/neutral، icon |
| `Table` / `Th` / `Td` / `Tr` | hoverable |
| `Tabs` | underline/pills/boxed، count badge |
| `Pagination` | RTL arrows |
| `Breadcrumb` | RTL separator |
| `Progress` | 4 variants، sm/md/lg |
| `Modal` / `ModalBody` / `ModalFooter` | sm/md/lg/xl/full |
| `Toast` / `ToastContainer` | 4 variants، auto-dismiss |
| `Dropdown` | align start/end |
| `EmptyState` | icon، title، description، action |
| `Sidebar` | collapsed mode، badge، active state |
| `Divider` | horizontal/vertical، label |
