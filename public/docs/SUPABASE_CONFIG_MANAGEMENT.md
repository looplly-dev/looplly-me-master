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
