# Supabase Configuration Management

## Overview

Managing Supabase backend configuration including database, auth, and edge functions.

## Database Configuration

### Connection Pooling
- Mode: Transaction
- Pool size: Auto-scaled

### Extensions
- pgcrypto
- uuid-ossp
- pg_trgm (for full-text search)

## Authentication Configuration

```typescript
// Auto-confirm emails for development
await supabase.auth.admin.updateAuthConfig({
  MAILER_AUTOCONFIRM: true
});
```

## Client Configuration

### Multi-Client Architecture

Looplly uses multiple Supabase clients for session isolation:

#### Main Client (`client.ts`)
```typescript
// Admin/user portal client
// Storage: localStorage
// Keys: 'admin_auth' (admin), 'auth' (users)
import { supabase } from '@/integrations/supabase/client';
```

**Configuration:**
- Detects admin routes via `pathname.startsWith('/admin')`
- Uses `storageKey: 'admin_auth'` for admin isolation
- Persists across tabs and refreshes
- Auto-refresh tokens enabled

#### Simulator Client (`simulatorClient.ts`)
```typescript
// Isolated simulator client
// Storage: sessionStorage (iframe-only)
// Key: 'simulator'
import { simulatorClient } from '@/integrations/supabase/simulatorClient';
```

**Configuration:**
- Uses `sessionStorage` for ephemeral sessions
- Isolated to simulator iframe context
- Not shared across tabs
- Destroyed when iframe closes

#### Active Client (`activeClient.ts`)
```typescript
// Path-aware client selector
// Automatically returns correct client based on route
import { getSupabaseClient } from '@/integrations/supabase/activeClient';
```

**Selection Logic:**
- Returns `simulatorClient` for `/simulator/*` routes
- Returns `supabase` (main client) for all other routes
- Used by most hooks and utilities

### When to Use Which Client

| Context | Import | Reason |
|---------|--------|--------|
| Hooks (useAuth, useProfile, etc.) | `activeClient` | Auto-selects based on context |
| Direct simulator pages | `simulatorClient` | Explicit isolation needed |
| Admin/user-specific code | `supabase` | Main client only |
| Generic utilities | `activeClient` | Works in all contexts |

### Storage Strategy Comparison

| Feature | Main Client | Simulator Client |
|---------|-------------|------------------|
| Storage | localStorage | sessionStorage |
| Key | admin_auth / auth | simulator |
| Multi-tab | Yes | No (iframe-only) |
| Persists refresh | Yes | Yes (within session) |
| Persists close | Yes | No |
| Use case | Production auth | Testing isolation |

### Critical Rules

1. **NEVER consolidate to single client** - breaks session isolation
2. **NEVER modify storage keys** - causes cross-contamination
3. **ALWAYS use activeClient in shared code** - ensures context-awareness
4. **Test simulator after any client changes** - verify no admin logout

### Troubleshooting

**Admin gets logged out during simulation:**
- Check `activeClient.ts` path detection logic
- Verify simulator pages import simulatorClient
- Confirm storageKey separation (`admin_auth` vs `simulator`)
- Review browser DevTools → Application → Storage

**Simulator session doesn't persist:**
- Verify sessionStorage in simulatorClient
- Check iframe isn't clearing storage
- Confirm session handoff in SimulatorSession.tsx

**Data shows wrong user:**
- Ensure hooks use `activeClient`, not direct `supabase` import
- Verify path-based client selection is working
- Check console logs for client selection messages

See [Simulator Architecture](SIMULATOR_ARCHITECTURE.md) for complete technical details.

## Edge Functions

Deploy via `supabase/config.toml`:

```toml
[functions.my-function]
verify_jwt = true
```

## Storage

Buckets configured for:
- Profile images
- Badge images
- Document uploads

## Related Documentation
- [Environment Setup](ENVIRONMENT_SETUP.md)
