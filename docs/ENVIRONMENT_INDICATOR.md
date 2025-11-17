# Environment Indicator Visual Guide

## Overview

The Environment Indicator is a visual banner that appears at the top of the application during development to clearly show which Supabase environment you're connected to.

## Visual Appearance

### 🟢 Local Development Mode

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🟢 LOCAL DEVELOPMENT • Connected to local Supabase • Mode: local          ▼ ✕ │
│                                               http://127.0.0.1:54321          │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Color:** Emerald Green (`bg-emerald-500`)
**Icon:** Database (pulsing animation)
**Indicates:** Safe local development environment

**When Expanded:**
```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🟢 LOCAL DEVELOPMENT • Connected to local Supabase • Mode: local          ▲ ✕ │
│                                               http://127.0.0.1:54321          │
├─────────────────────────────────────────────────────────────────────────────┤
│ Mode: local              Dev Server: Running                                │
│ Supabase URL: http://127.0.0.1:54321                                        │
│                                                                             │
│ Quick Links:  [Studio Dashboard]  [Email Testing]                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 🟠 Remote Development Mode

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 🟠 REMOTE DEVELOPMENT • ⚠️ Connected to remote Supabase                   ▼ ✕ │
│                                  https://project.supabase.co                │
├─────────────────────────────────────────────────────────────────────────────┤
│ ⚠️ Warning: You are connected to a remote Supabase instance. Changes may   │
│ affect production data. Use `npm run dev` for local development.           │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Color:** Amber/Orange (`bg-amber-500`)
**Icon:** Globe
**Indicates:** Warning - connected to production/remote environment

## Component Location

**File:** `src/components/layout/EnvironmentIndicator.tsx`

**Integration:** Added to `src/App.tsx` at the root level, before all routes.

## Features

### 1. Automatic Environment Detection

The indicator automatically detects the environment based on the `VITE_SUPABASE_URL`:
- Contains `127.0.0.1` or `localhost` → **Local Mode**
- Contains anything else → **Remote Mode**

### 2. Expandable Details Panel

Click the chevron (▼/▲) to expand/collapse additional information:
- Current mode (local/development/production)
- Dev server status
- Full Supabase URL
- Quick links (local mode only)

### 3. Dismissible

Click the X button to dismiss the banner for **1 hour**:
- Uses localStorage to persist dismissal state
- Automatically reappears after 1 hour
- Session-based (clears on manual localStorage clear)

### 4. Production Safety

The indicator is **automatically hidden** in production:
```typescript
if (import.meta.env.MODE === "production") {
  return null;
}
```

### 5. Responsive Design

- **Mobile:** Stacked layout, essential info only
- **Tablet:** Horizontal layout, URL truncated
- **Desktop:** Full layout with URL and quick links

## Quick Links (Local Mode Only)

When connected to local Supabase, the expanded view provides quick access to:

1. **Studio Dashboard** (`http://127.0.0.1:54323`)
   - View and manage database
   - Run SQL queries
   - Inspect tables and RLS policies

2. **Email Testing** (`http://127.0.0.1:54324`)
   - View emails sent by the application
   - Test email templates
   - Inbucket email capture interface

## Styling Details

### Color Scheme

**Local Development:**
- Background: `bg-emerald-500` (Emerald 500)
- Border: `border-emerald-600` (Emerald 600)
- Text: `text-white`

**Remote Development:**
- Background: `bg-amber-500` (Amber 500)
- Border: `border-amber-600` (Amber 600)
- Text: `text-white`

### Animations

- **Icon:** Pulsing animation (`animate-pulse`)
- **Hover:** Subtle background darkening on buttons
- **Transitions:** Smooth expand/collapse

## Configuration

### Hide Duration

To change how long the banner stays hidden after dismissal, modify the `handleDismiss` function:

```typescript
const handleDismiss = () => {
  // Change duration here (in milliseconds)
  const oneHourFromNow = Date.now() + (60 * 60 * 1000); // 1 hour
  localStorage.setItem(STORAGE_KEY, oneHourFromNow.toString());
  setIsVisible(false);
};
```

### Storage Key

The localStorage key used to track dismissal state:
```typescript
const STORAGE_KEY = "looplly_env_indicator_hidden";
```

## Testing

### Test Local Mode
```bash
# Ensure .env has local Supabase URL
echo "VITE_SUPABASE_URL=http://127.0.0.1:54321" > .env
npm run dev

# Expected: Green banner with "LOCAL DEVELOPMENT"
```

### Test Remote Mode
```bash
# Ensure .env has remote Supabase URL
echo "VITE_SUPABASE_URL=https://project.supabase.co" > .env
npm run dev:remote

# Expected: Amber banner with "REMOTE DEVELOPMENT" and warning
```

### Test Production Mode
```bash
npm run build
npm run preview

# Expected: No banner visible
```

## Accessibility

- **ARIA Labels:** All interactive elements have descriptive labels
- **Role:** Banner has `role="banner"`
- **Keyboard:** Fully keyboard accessible (Tab, Enter, Escape)
- **Screen Readers:** Announces environment status
- **Focus:** Visible focus indicators on interactive elements

## Browser Compatibility

- **Modern Browsers:** Chrome, Firefox, Safari, Edge (latest versions)
- **Mobile:** iOS Safari, Chrome Mobile
- **Fallback:** Gracefully degrades without localStorage support

## Troubleshooting

### Banner Not Appearing

1. Check environment mode:
   ```typescript
   console.log(import.meta.env.MODE); // Should not be "production"
   ```

2. Verify Supabase URL is set:
   ```typescript
   console.log(import.meta.env.VITE_SUPABASE_URL);
   ```

3. Check if dismissed:
   ```typescript
   localStorage.removeItem("looplly_env_indicator_hidden");
   ```

### Wrong Environment Detected

1. Check `.env` file:
   ```bash
   cat .env | grep VITE_SUPABASE_URL
   ```

2. Clear Vite cache:
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

### Banner Overlapping Content

The banner uses `position: sticky` and `z-index: 50`. If content overlaps:
- Ensure content below has lower z-index
- Check for conflicting CSS
- Verify sticky positioning support

## Related Files

- `src/components/layout/EnvironmentIndicator.tsx` - Main component
- `src/App.tsx` - Integration point
- `.env.local` - Local environment config
- `docs/LOCAL_DEVELOPMENT.md` - Complete local dev guide

## Future Enhancements

Potential improvements to consider:
- [ ] Show Git branch name
- [ ] Display last migration timestamp
- [ ] Add connection status indicator (real-time)
- [ ] Show edge function deployment status
- [ ] Add keyboard shortcut to toggle (e.g., Ctrl+Shift+E)
- [ ] Persist expanded/collapsed state
- [ ] Add custom dismissal durations (1h, 4h, 8h, 24h)
