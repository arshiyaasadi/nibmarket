# Map Viewport Users Table Implementation

## ✅ Implementation Complete

A dynamic table has been added below the UserLocationMap that displays users visible in the current map viewport. The table automatically updates as the user pans or zooms the map.

## 📁 Files Created/Modified

### 1. Type Definitions - **UPDATED**
**File:** `src/types/location.ts`

Added user details to location types:
- `fullName: string` - User's full name in Persian
- `joinDate: string` - ISO date string of when user joined
- `subordinates: number` - Number of subordinates in network
- `capital: number` - User's capital amount in TWIN

### 2. Mock Data Generator - **UPDATED**
**File:** `src/data/user-locations.ts`

Enhanced data generation with:
- Persian name arrays (20 first names, 20 last names)
- Random name generation function
- Random join date (within last 2 years)
- Random subordinates (0-50, exponential distribution)
- Random capital (100-100,000 TWIN, log-normal distribution)

### 3. Location Privacy Utility - **UPDATED**
**File:** `src/utils/location-privacy.ts`

Updated obfuscation to preserve all user fields while maintaining location privacy.

### 4. New ViewportUsersTable Component - **CREATED**
**File:** `src/views/dashboards/manager/ViewportUsersTable.tsx`

**Features:**
- Displays users currently visible in map viewport
- Sortable by capital (descending by default)
- Paginated table (5, 10, 25, 50 rows per page)
- Persian date formatting
- Persian number formatting with thousands separators
- Color-coded indicators:
  - Subordinates: Green (>20), Blue (>10), Gray (≤10)
  - Capital: Green (>50k), Blue (>20k), Default (≤20k)
- Shows percentage of visible users vs total users
- Empty state when no users in viewport

**Columns:**
1. ردیف (Row number)
2. نام و نام خانوادگی (Full name)
3. تاریخ عضویت (Join date)
4. تعداد زیرمجموعه (Subordinates count)
5. سرمایه (Capital in TWIN)

### 5. UserLocationMap Component - **UPDATED**
**File:** `src/views/dashboards/manager/UserLocationMap.tsx`

**New Features:**
- Added `BoundsTracker` component that monitors map viewport changes
- Tracks map bounds on `moveend` and `zoomend` events
- Filters locations based on current map bounds
- Enhanced marker popups with user details:
  - Full name
  - Subordinates count
  - Capital amount
- Table component integrated below map
- Wrapped in fragment to return both map card and table

**Key Functions:**
- `handleBoundsChange()` - Updates map bounds state
- `visibleLocations` - Computed array of users in viewport
- Uses Leaflet's `bounds.contains()` for efficient filtering

## 🎨 UI/UX Features

### Table Features
- **Responsive Design**: Adapts to all screen sizes
- **Hover Effects**: Row highlighting on hover
- **Color Coding**: Visual indicators for high performers
- **RTL Support**: Full Persian language support
- **Pagination**: Customizable rows per page
- **Empty States**: Helpful message when no users visible

### Map Integration
- **Real-time Updates**: Table updates instantly on map interaction
- **Performance**: Efficient filtering using memoization
- **Visual Feedback**: Shows percentage of visible users
- **User Details**: Enhanced popups with full information

## 📊 Data Flow

```
User Locations (1000 users)
     ↓
Obfuscated for Privacy
     ↓
Displayed on Map with Clustering
     ↓
Map Viewport Bounds Change
     ↓
Filter Locations in Viewport
     ↓
ViewportUsersTable Updates
     ↓
Display Sorted & Paginated Results
```

## 🚀 How It Works

1. **Initial Load**: 
   - 1000 mock users generated with Persian names, join dates, subordinates, and capital
   - Locations obfuscated for privacy (~500m precision)
   - Map displays all locations with clustering

2. **Map Interaction**:
   - User pans or zooms the map
   - `BoundsTracker` detects viewport change
   - Updates `mapBounds` state
   - Triggers `visibleLocations` recalculation

3. **Filtering**:
   - Uses Leaflet's `bounds.contains([lat, lng])`
   - Filters obfuscated locations array
   - Returns only users within current viewport

4. **Table Display**:
   - Receives filtered users
   - Sorts by capital (highest first)
   - Applies pagination
   - Renders with Persian formatting

## 🎯 Technical Highlights

1. **Performance Optimization**:
   - Uses `useMemo` for expensive computations
   - Efficient bounds checking
   - Pagination prevents rendering thousands of rows

2. **React Best Practices**:
   - Proper state management
   - Memoized calculations
   - Clean separation of concerns

3. **Type Safety**:
   - Full TypeScript support
   - Strict type checking
   - No `any` types

4. **Accessibility**:
   - Semantic HTML
   - ARIA labels
   - Keyboard navigation support

## 📍 Access the Feature

Navigate to: **داشبورد مدیر → داشبورد کلی**

Or directly: `/manager/dashboard`

Scroll down to the map section to see the viewport-synchronized table below it.

## 🔍 Example Usage

1. Load the manager dashboard
2. See the map with all 1000 users clustered
3. Zoom into Tehran area
4. Table automatically shows only users visible in Tehran
5. Pan to Isfahan
6. Table updates to show Isfahan users
7. Use pagination to browse through visible users
8. Click markers to see individual user details

---

**Implementation Date**: December 26, 2024
**Status**: ✅ Complete - All Features Working


