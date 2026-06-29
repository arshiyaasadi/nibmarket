# Design System

## رنگ‌ها

تعریف در `src/styles/globals.css` با Tailwind `@theme`:

| Token | مقدار | کاربرد |
|-------|-------|---------|
| `--color-primary` | `#721bd9` | رنگ اصلی — CTA، active states |
| `--color-primary-{50-900}` | palette بنفش | hover، background، text |
| `--color-secondary` | `#4C4BAB` | رنگ ثانوی |
| `--color-secondary-{50-900}` | palette آبی-بنفش | |
| `--color-surface` | سفید/تیره | پس‌زمینه کارت |
| `--color-surface-2` | خاکستری روشن | hover، input bg |
| `--color-border` | خاکستری کم‌رنگ | خطوط جداکننده |
| `--color-muted` | خاکستری | متن کم‌اهمیت، placeholder |
| `--color-foreground` | تیره | متن اصلی |
| `--color-success` | سبز | موفقیت |
| `--color-warning` | نارنجی | هشدار |
| `--color-danger` | قرمز | خطا |
| `--color-info` | آبی | اطلاعات |

استفاده:
```tsx
className="bg-primary text-white"
className="border-border text-muted"
className="text-success"
```

---

## فونت

**IRANSans** — بارگذاری از `public/fonts/IRANSans/`

| وزن | فایل |
|-----|------|
| 300 | `IRANSansWeb_Light.woff2` |
| 400 | `IRANSansWeb_Regular.woff2` |
| 700 | `IRANSansWeb_Bold.woff2` |
| 900 | `IRANSansWeb_Black.woff2` |

در `globals.css`:
```css
html { direction: rtl; }
body { font-family: var(--font-sans); }
```

---

## RTL

**همیشه** از CSS logical properties استفاده کنید:

```tsx
// ✅ padding/margin logical
ps-pad-mol    // padding-inline-start (راست در RTL)
pe-pad-atom-md // padding-inline-end (چپ در RTL)
ms-atom       // margin-inline-start
me-atom-md    // margin-inline-end

// ✅ position logical
start-pad-atom-md  // inset-inline-start
end-0              // inset-inline-end

// ❌ physical (direction-dependent)
pl-4  pr-9  ml-2  left-3  right-0
```

---

## Spacing Tokens

توکن‌های کامل در `docs/spacing.md`.  
تعریف در `tailwind.config.ts`.

| سطح | توکن‌ها | مقدار |
|-----|---------|-------|
| Atom | `atom`، `atom-md`، `pad-atom`، `pad-atom-md`، `pad-atom-xs` | 2–12px |
| Molecule | `mol`، `mol-md`، `pad-mol`، `pad-mol-md`، `stack-mol` | 16–32px |
| Organism | `org`، `org-md`، `pad-org`، `pad-org-x`، `stack-org` | 32–80px |

---

## Atom Components

24 component در `src/components/ui/atoms/`.  
Import:
```ts
import { Button, Card, Input, Badge } from "@/components/ui";
```

### Button
```tsx
<Button variant="primary" size="md" loading={false}>
  تایید
</Button>
// variants: primary | secondary | outline | ghost | danger
// sizes: sm | md | lg
// props: startIcon، endIcon، loading، fullWidth
```

### Input
```tsx
<Input
  label="شماره موبایل"
  placeholder="09..."
  error={errors.mobile}
  startAddon={<PhoneIcon />}
  required
/>
```

### Select
```tsx
<Select
  label="صندوق"
  options={[{ value: "1", label: "طلایی" }]}
  placeholder="انتخاب کنید"
  error={errors.fund}
/>
```

### Card
```tsx
<Card padding="md"> {/* sm | md | lg */}
  <CardHeader>
    <CardTitle>عنوان</CardTitle>
    <Button variant="ghost" size="sm">ویرایش</Button>
  </CardHeader>
  <CardBody>محتوا</CardBody>
  <CardFooter>
    <Button variant="outline">لغو</Button>
    <Button>ذخیره</Button>
  </CardFooter>
</Card>
```

### StatCard
```tsx
<StatCard
  title="کل توکن"
  value="۱٬۲۵۰"
  trend={{ value: "+۱۵٪", direction: "up" }}
  icon={<TokenIcon />}
/>
```

### Table
```tsx
<Table>
  <TableHead>
    <Tr><Th>نام</Th><Th>توکن</Th></Tr>
  </TableHead>
  <TableBody>
    <Tr><Td>علی</Td><Td>۱۲۰</Td></Tr>
  </TableBody>
</Table>
```

### Modal
```tsx
<Modal open={isOpen} onClose={close} title="تأیید حذف" size="sm">
  <ModalBody>آیا مطمئن هستید؟</ModalBody>
  <ModalFooter>
    <Button variant="outline" onClick={close}>لغو</Button>
    <Button variant="danger" onClick={confirm}>حذف</Button>
  </ModalFooter>
</Modal>
```

### Toast / ToastContainer
```tsx
// در component:
const [toasts, setToasts] = useState<ToastItem[]>([]);

<ToastContainer
  toasts={toasts}
  onDismiss={(id) => setToasts(t => t.filter(x => x.id !== id))}
/>
```

### Sidebar
```tsx
<Sidebar
  items={navItems}      // SidebarNavItem[]
  header={<Logo />}
  footer={<UserProfile />}
  collapsed={isCollapsed}
/>
```

---

## قوانین کامپوننت‌ها

1. **No external margins** — `mb-*`، `mt-*` بر روی components reusable ممنوع
2. **Spacing از parent** — با `gap-*` بر روی container
3. **RTL logical properties** — نه `pl-*`، `ml-*`، `left-*`
4. **Semantic spacing only** — نه `p-4`، `gap-6`
5. **`@level` JSDoc** — در هر component file
