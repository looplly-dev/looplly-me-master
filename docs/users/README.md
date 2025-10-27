# User Management Documentation

## Overview
This section covers user classification, role management, account operations, and user type configurations within the Looplly platform.

## Documents in this Category

- **[CLASSIFICATION.md](./CLASSIFICATION.md)** - User classification system and reputation tiers
- **[TYPE_MANAGEMENT.md](./TYPE_MANAGEMENT.md)** - Managing looplly_user, admin, tester, and simulator user types
- **[ACCOUNT_MANAGEMENT.md](./ACCOUNT_MANAGEMENT.md)** - Account operations, profile management, and data control
- **[ROLE_ARCHITECTURE.md](./ROLE_ARCHITECTURE.md)** - Role-based access control (RBAC) implementation

## Quick Start

### For Administrators
1. Start with [TYPE_MANAGEMENT.md](./TYPE_MANAGEMENT.md) to understand user types
2. Review [ROLE_ARCHITECTURE.md](./ROLE_ARCHITECTURE.md) for permission management
3. Check [ACCOUNT_MANAGEMENT.md](./ACCOUNT_MANAGEMENT.md) for user operations

### For Developers
1. Begin with [CLASSIFICATION.md](./CLASSIFICATION.md) for reputation system integration
2. Study [TYPE_MANAGEMENT.md](./TYPE_MANAGEMENT.md) for user type logic
3. Implement [ROLE_ARCHITECTURE.md](./ROLE_ARCHITECTURE.md) for access control

## Key Concepts

### User Types
- **looplly_user**: Regular platform users (custom JWT)
- **admin**: System administrators (auth.users)
- **tester**: Testing and QA accounts (auth.users)
- **simulator**: Isolated simulation environment users

### User Classification Tiers
- **Explorer** (0-99 Rep)
- **Builder** (100-499 Rep)
- **Champion** (500-1499 Rep)
- **Legend** (1500+ Rep)

### Role-Based Access Control
- Permission-based access (not role-string checks)
- Hierarchical role structure
- Dynamic permission assignment

## Related Documentation
- [Authentication](../authentication/README.md) - Authentication and security systems
- [Admin Portal](../admin/README.md) - Admin tools for user management
- [Reputation System](../features/reputation/STREAK_REPUTATION_SYSTEM.md) - Reputation and tier mechanics
- [Technical Architecture](../technical/README.md) - Database schema for users

## Common Tasks

### Checking User Type
```typescript
// See TYPE_MANAGEMENT.md for implementation
// Use: useUserType() hook or database query
```

### Managing User Roles
```typescript
// See ROLE_ARCHITECTURE.md for RBAC patterns
// Use: useRole() hook for permission checks
```

### Updating User Classification
```typescript
// See CLASSIFICATION.md for tier calculation
// Automatic based on reputation points
```

## Need Help?
- Review [CLASSIFICATION.md](./CLASSIFICATION.md) for user tier logic
- Check [TYPE_MANAGEMENT.md](./TYPE_MANAGEMENT.md) for user type distinctions
- Consult [../reference/RECENT_CHANGES.md](../reference/RECENT_CHANGES.md) for latest updates
