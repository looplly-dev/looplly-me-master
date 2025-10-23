# Phase 1: Multi-Tenancy Foundation - Setup Instructions

## Overview
Phase 1 implements the foundational multi-tenancy infrastructure, Badge Service API, and audit logging system.

## Step 1: Run Database Migration

1. Open Lovable Cloud → SQL Editor
2. Copy and paste the migration from: `supabase/migrations/20250111000000_multi_tenancy_foundation.sql`
3. Execute the migration
4. Verify tables were created:
   - `tenants`
   - `audit_logs`
   - `badge_catalog`
   - `user_badges`

## Step 2: Get Your Internal Tenant API Key

After running the migration, retrieve your internal tenant API key:

```sql
SELECT api_key, name, slug 
FROM public.tenants 
WHERE slug = 'looplly-internal';
```

**IMPORTANT:** Save this API key securely - external companies will use similar keys to access the Badge Service API.

## Step 3: Test the Badge Service API

### Using Internal Authentication (JWT)

The Badge Service API can be called using your normal authentication token:

```typescript
// Generate a badge image
const { data, error } = await supabase.functions.invoke('badge-service-api/generate', {
  body: {
    badgeName: 'Network Pioneer',
    tier: 'Bronze',
    category: 'Social',
    iconTheme: 'connected people and network nodes',
    type: 'badge'
  }
});
```

### Using External API Key (for external companies)

External companies can call the API using their tenant API key:

```bash
curl -X POST https://tnczbttpbstbzxcisnzr.supabase.co/functions/v1/badge-service-api/generate \
  -H "x-tenant-api-key: YOUR_TENANT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "badgeName": "Network Pioneer",
    "tier": "Bronze",
    "category": "Social",
    "iconTheme": "connected people and network nodes",
    "type": "badge"
  }'
```

## Step 4: Verify Audit Logging

After generating a badge, check that audit logs are being created:

```sql
SELECT * FROM public.audit_logs 
ORDER BY created_at DESC 
LIMIT 10;
```

You should see entries with:
- `action`: 'badge.generate'
- `resource_type`: 'badge'
- `metadata`: Contains badge details

## What's New

### 1. Multi-Tenancy Infrastructure
- **Tenants Table**: Manages different companies/organizations
- **Tenant ID Columns**: Added to profiles, user_roles, earning_activities, transactions
- **API Key Authentication**: External companies can use API keys
- **Tenant Isolation**: RLS policies ensure data isolation

### 2. Badge Service API
- **Modular API**: Standalone edge function at `badge-service-api`
- **Multiple Actions**:
  - `/generate`: Generate badge images using AI
  - `/list`: List all badges for a tenant
  - `/award`: Award badges to users
  - `/user-badges`: Get user's earned badges
- **Dual Authentication**: Supports both JWT (internal) and API key (external)

### 3. Audit Logging System
- **Comprehensive Tracking**: All admin actions are logged
- **Tenant-Scoped**: Logs are associated with tenants
- **Metadata Rich**: Captures action details, IP, user agent
- **Client SDK**: `auditLogger` utility for easy logging

### 4. Badge Catalog System
- **Centralized Badge Definitions**: All badges stored in database
- **Tenant-Specific**: Each tenant can have custom badges
- **User Badges**: Track which users earned which badges

## API Endpoints

### Badge Service API Routes

All routes are prefixed with `badge-service-api/`

#### 1. Generate Badge Image
**POST** `/badge-service-api/generate`

```typescript
{
  badgeName: string;
  tier: string;
  category: string;
  iconTheme: string;
  type?: 'badge' | 'tier-icon';
}
```

#### 2. List Badges
**GET** `/badge-service-api/list`

Returns all active badges for the tenant.

#### 3. Award Badge
**POST** `/badge-service-api/award`

```typescript
{
  targetUserId: string;
  badgeId: string;
}
```

#### 4. Get User Badges
**GET** `/badge-service-api/user-badges?userId={userId}`

Returns all badges earned by a user.

## Usage Examples

### Client-Side (Internal Use)

```typescript
import { auditActions } from '@/utils/auditLogger';

// Generate badge and log
const { data } = await supabase.functions.invoke('badge-service-api/generate', {
  body: { /* badge params */ }
});

// Log the action
await auditActions.badgeAward(adminUserId, targetUserId, badgeId, badgeName);
```

### External Company Integration

```typescript
// External company's backend service
const response = await fetch(
  'https://tnczbttpbstbzxcisnzr.supabase.co/functions/v1/badge-service-api/award',
  {
    method: 'POST',
    headers: {
      'x-tenant-api-key': 'their-tenant-api-key',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      targetUserId: 'user-uuid',
      badgeId: 'badge-uuid'
    })
  }
);
```

## Next Steps

After Phase 1 is complete and tested:

1. **Create Tenant for First External Company**:
   ```sql
   INSERT INTO public.tenants (name, slug, api_key, settings)
   VALUES (
     'Partner Company Name',
     'partner-company-slug',
     encode(gen_random_bytes(32), 'hex'),
     '{}'::jsonb
   );
   ```

2. **Provide API Documentation**: Share the API endpoints and authentication method
3. **Monitor Audit Logs**: Check logs regularly for security and usage patterns
4. **Move to Phase 2**: User Management Service API

## Troubleshooting

### Badge Generation Fails
- Check LOVABLE_API_KEY is configured in Lovable Cloud secrets
- Verify rate limits haven't been exceeded (429 error)
- Check credits are available (402 error)

### Authentication Fails
- For JWT: Ensure user is logged in and token is valid
- For API key: Verify the key exists in tenants table and is_active = true

### Audit Logs Not Appearing
- Check RLS policies allow authenticated users to insert
- Verify tenant_id and user_id are being passed correctly
- Check console for any errors

## Security Notes

- **API Keys**: Treat tenant API keys like passwords - they provide full access
- **RLS Policies**: All tables have RLS enabled for tenant isolation
- **Audit Logs**: Critical actions are logged immediately, others are batched
- **Rate Limiting**: Consider implementing rate limiting per tenant in Phase 2

## Related Documentation

- [Profile System Admin Guide](docs/PROFILING/ADMIN_GUIDE.md) - Managing profile questions and badges
- [Profiling System Docs](docs/PROFILING/README.md) - Complete profiling documentation

## Support

For issues or questions:
1. Check audit logs for detailed error information
2. Review edge function logs in Lovable Cloud
3. Verify database migration completed successfully
