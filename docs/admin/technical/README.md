---
id: "technical-readme"
title: "Technical Documentation"
category: "Technical Reference"
description: "Technical architecture documentation including database schemas, data isolation, API patterns, and system design"
audience: "all"
tags: ["technical", "architecture", "database", "api", "overview"]
status: "published"
version: "1.0.0"
created_at: "2025-01-28"
updated_at: "2025-01-28"
---

# Technical Documentation

## Overview
This section contains technical architecture documentation, database schemas, data specifications, and system design details for the Looplly platform.

## Documents in this Category

- **[TABLE_ARCHITECTURE.md](./TABLE_ARCHITECTURE.md)** - Complete database schema, tables, and relationships
- **[PROFILE_SYSTEM_ARCHITECTURE.md](./PROFILE_SYSTEM_ARCHITECTURE.md)** - Technical design of profiling system
- **[DATA_ISOLATION.md](./DATA_ISOLATION.md)** - Multi-tenancy and data isolation implementation
- **[COUNTRY_CODE_SPECIFICATION.md](./COUNTRY_CODE_SPECIFICATION.md)** - Country code standards and usage

## Quick Start

### For Backend Developers
1. Start with [TABLE_ARCHITECTURE.md](./TABLE_ARCHITECTURE.md) for database schema
2. Review [DATA_ISOLATION.md](./DATA_ISOLATION.md) for tenant separation
3. Study [PROFILE_SYSTEM_ARCHITECTURE.md](./PROFILE_SYSTEM_ARCHITECTURE.md) for profiling implementation

### For Frontend Developers
1. Begin with [PROFILE_SYSTEM_ARCHITECTURE.md](./PROFILE_SYSTEM_ARCHITECTURE.md) for API contracts
2. Check [COUNTRY_CODE_SPECIFICATION.md](./COUNTRY_CODE_SPECIFICATION.md) for localization
3. Review database schema in [TABLE_ARCHITECTURE.md](./TABLE_ARCHITECTURE.md)

## Key Technical Concepts

### Database Architecture
- **PostgreSQL** with Supabase
- **Row-Level Security (RLS)** for data protection
- **Multi-tenant architecture** via tenant_id/session_id
- **Audit logging** for compliance and debugging

### Data Isolation Strategy
Three isolation levels:
1. **User-level**: Data tied to user_id
2. **Tenant-level**: Simulator sessions isolated by session_id
3. **Role-level**: Admin vs regular user separation

### Profile System Design
- **Progressive disclosure**: 3-level profiling (Essential, Standard, Premium)
- **Country-aware questions**: Global fallback + country-specific overrides
- **Decay system**: Automatic data freshness tracking
- **JSON storage**: Flexible schema for dynamic questions

### Country Code System
- **ISO 3166-1 alpha-2**: Standard 2-letter codes (e.g., US, GB, AU)
- **Consistent usage**: Database columns, APIs, frontend state
- **Validation**: Strict validation against supported countries list

## Database Tables Overview

### Core Tables
- `profiles`: User profile data and metadata
- `profile_questions`: Question definitions
- `profile_answers`: User responses to questions
- `profile_categories`: Question grouping and organization

### User & Auth
- `auth.users`: Supabase auth (admin/tester only)
- `profiles`: All users (includes looplly_user profiles)
- `user_types`: User type management

### Features
- `user_reputation`: Reputation points and tiers
- `user_streaks`: Daily streak tracking
- `badges`: Badge definitions and awards
- `earning_activities`: Activity logging

### System
- `audit_logs`: System activity tracking
- `simulator_sessions`: Testing environment management
- `documentation`: Knowledge Centre content

## API Patterns

### Authentication
```typescript
// See ../authentication/API_AUTHENTICATION.md
// Custom JWT for looplly_user, auth.users for admin
```

### Data Fetching
```typescript
// Always filter by tenant/user context
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', userId);
```

### RLS Policy Pattern
```sql
-- See DATA_ISOLATION.md for complete patterns
CREATE POLICY "Users can view own data"
  ON table_name FOR SELECT
  USING (auth.uid() = user_id);
```

## Related Documentation
- [Authentication Architecture](../authentication/ARCHITECTURE.md) - Auth system design
- [Profiling Architecture](../features/profiling/ARCHITECTURE.md) - Feature implementation
- [Deployment & Configuration](../deployment/README.md) - Environment setup
- [Testing](../testing/README.md) - Testing database changes

## Common Technical Tasks

### Adding a New Table
```sql
-- See TABLE_ARCHITECTURE.md for patterns
-- Always include: RLS policies, indexes, foreign keys
```

### Implementing Data Isolation
```sql
-- See DATA_ISOLATION.md for multi-tenancy patterns
-- Use: tenant_id or session_id filtering
```

### Country-Specific Features
```typescript
// See COUNTRY_CODE_SPECIFICATION.md
// Use: ISO 3166-1 alpha-2 codes consistently
```

### Profiling System Integration
```typescript
// See PROFILE_SYSTEM_ARCHITECTURE.md
// Use: hooks and services for profile operations
```

## Performance Considerations
- **Indexing**: All foreign keys and frequently queried columns
- **RLS**: Optimized policies for minimal overhead
- **Caching**: Profile data cached client-side
- **Pagination**: Large datasets paginated by default

## Security Considerations
- **RLS enabled** on all user-facing tables
- **Audit logging** for sensitive operations
- **Input validation** at API boundaries
- **Rate limiting** on authentication endpoints

## Need Help?
- Review [TABLE_ARCHITECTURE.md](./TABLE_ARCHITECTURE.md) for schema reference
- Check [DATA_ISOLATION.md](./DATA_ISOLATION.md) for tenant patterns
- Consult [../deployment/SUPABASE_MIGRATION_GUIDE.md](../deployment/SUPABASE_MIGRATION_GUIDE.md) for migrations
- See [../reference/RECENT_CHANGES.md](../reference/RECENT_CHANGES.md) for technical updates
