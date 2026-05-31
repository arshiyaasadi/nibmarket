# External URLs — دسترسی‌های اینترنتی اپ

> فهرست URLهایی که **مرورگر** یا **سرور Next** در runtime به آن‌ها درخواست می‌زند.  
> برای امنیت شبکه، CSP و مستندسازی deploy.

---

## API بک‌اند (دادهٔ اپ)

| Env | URL | استفاده |
|-----|-----|---------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://api-club.nibdev.com` | همهٔ `apiClient` → `/api/v1/...` |

---

## پنل کاربری قدیمی (redirect / navigation)

| Env | URL پیش‌فرض | UI |
|-----|-------------|-----|
| `NEXT_PUBLIC_PANEL_BASE_URL` | `https://panel.nibmarket.com` | base |
| `NEXT_PUBLIC_PANEL_PROFILE_URL` | `https://panel.nibmarket.com/profile/` | منو → پروفایل |
| `NEXT_PUBLIC_PANEL_USER_ACCOUNT_URL` | `https://panel.nibmarket.com/user-account/` | منو → تنظیمات |

کد: `src/configs/panel-urls.ts`

---

## نقشه — Leaflet / OpenStreetMap

**کامپوننت:** `src/views/dashboards/manager/UserLocationMap.tsx`  
**صفحه:** `/manager/dashboard`

| نوع | URL | توضیح |
|-----|-----|--------|
| **Tile layer** | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` | تایل‌های نقشه OSM |
| Attribution | `https://www.openstreetmap.org/copyright` | لینک copyright |
| Marker icon | `https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png` | آیکون marker |
| Marker icon 2x | `https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png` | retina |
| Marker shadow | `https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png` | سایه marker |

**Subdomain `{s}`:** معمولاً `a`, `b`, `c` — درخواست GET برای هر tile در zoom/pan.

---

## CDN / assets ثابت (نمونه)

| URL | استفاده |
|-----|---------|
| `/images/*` (same origin) | آواتار تمپلیت، mock UI |

---

## افزودن URL جدید

1. ردیف در جدول مناسب همین فایل
2. اگر API club → [`schema.api-registry.md`](./schema.api-registry.md)
3. اگر env جدید → [`.env.example`](../.env.example)

### قالب ردیف

```markdown
| `<component or page>` | `https://example.com/path` | GET | توضیح کوتاه |
```

---

## DOM → URL (نمونه)

| DOM / Feature | درخواست واقعی |
|---------------|----------------|
| `leaflet-container` (نقشه مدیر) | `https://a.tile.openstreetmap.org/{z}/{x}/{y}.png` (+ b/c) |
| منوی پروفایل | `https://panel.nibmarket.com/profile/` |
| منوی تنظیمات | `https://panel.nibmarket.com/user-account/` |
| ویجت‌های داشبورد | `https://api-club.nibdev.com/api/v1/dashboard/...` |
