# Role Architecture

## Overview

Looplly implements a role-based access control (RBAC) system for office users with granular permissions.

## Roles

### Super Admin
- Full system access
- User management
- Configuration changes
- All permissions

### Content Admin
- Manage documentation
- Manage profile questions
- Manage badges
- No user access

### Support Admin
- View/edit users
- Reset passwords
- View transactions
- No system config

### Analytics Admin
- Read-only access
- View all reports
- Export data
- No modifications

## Implementation

```sql
CREATE TABLE office_user_roles (
  user_id UUID PRIMARY KEY,
  role TEXT NOT NULL,
  permissions JSONB
);
```

## Related Documentation
- [User Type Management](USER_TYPE_MANAGEMENT.md)
- [Admin Guide](WARREN_ADMIN_GUIDE.md)
