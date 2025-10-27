# Admin Portal Documentation

## Overview
This section contains documentation for administrators managing the Looplly platform, including portal guides, team management, and feature testing.

## Documents in this Category

- **[PORTAL_GUIDE.md](./PORTAL_GUIDE.md)** - Complete admin portal navigation and features guide
- **[PLATFORM_GUIDE.md](./PLATFORM_GUIDE.md)** - Admin platform guide and administrative procedures
- **[FEATURE_TESTING_CATALOG.md](./FEATURE_TESTING_CATALOG.md)** - Feature testing procedures and test case catalog

## Quick Start

### For New Administrators
1. Start with [PORTAL_GUIDE.md](./PORTAL_GUIDE.md) for portal overview
2. Review [FEATURE_TESTING_CATALOG.md](./FEATURE_TESTING_CATALOG.md) for testing workflows
3. Check [PLATFORM_GUIDE.md](./PLATFORM_GUIDE.md) for platform administration

### For Testing Teams
1. Begin with [FEATURE_TESTING_CATALOG.md](./FEATURE_TESTING_CATALOG.md)
2. Use simulator (see [../testing/SIMULATOR_GUIDE.md](../testing/SIMULATOR_GUIDE.md))
3. Follow testing strategy in [../testing/STRATEGY.md](../testing/STRATEGY.md)

## Key Admin Features

### User Management
- View and manage all platform users
- Assign roles and permissions
- Reset passwords and manage accounts
- Monitor user activity and reputation

### Team Management
- Create B2B team accounts
- Manage team members
- Configure team settings
- Undo team setups when needed

### Content Management
- Manage profile questions
- Configure earning rules
- Control badge system
- Moderate community content

### Analytics & Monitoring
- View platform analytics
- Monitor system health
- Track user engagement
- Generate reports

## Related Documentation
- [User Management](../users/README.md) - Managing users, roles, and permissions
- [Profiling Admin](../features/profiling/ADMIN_GUIDE.md) - Managing profile questions and categories
- [Testing & Simulation](../testing/README.md) - Using simulator for testing
- [Knowledge Centre Management](../features/knowledge-centre/KNOWLEDGE_CENTRE.md) - Documentation management

## Common Admin Tasks

### Adding New Admin Users
```typescript
// See PORTAL_GUIDE.md for admin account creation
// Use: Admin Portal → Users → Create Admin
```

### Managing Profile Questions
```typescript
// See ../features/profiling/ADMIN_GUIDE.md
// Use: Admin Portal → Profile Questions
```

### Testing New Features
```typescript
// See FEATURE_TESTING_CATALOG.md
// Use: Simulator for isolated testing
```

### Configuring Earning Rules
```typescript
// See PORTAL_GUIDE.md for earning configuration
// Use: Admin Portal → Earning Rules
```

## Security Notes
- All admin actions are logged in audit_logs table
- Admin accounts require auth.users authentication
- Two-factor authentication recommended
- Regular security audits required

## Need Help?
- Review [PORTAL_GUIDE.md](./PORTAL_GUIDE.md) for feature walkthroughs
- Check [FEATURE_TESTING_CATALOG.md](./FEATURE_TESTING_CATALOG.md) for testing procedures
- Consult [../reference/RECENT_CHANGES.md](../reference/RECENT_CHANGES.md) for latest admin features
