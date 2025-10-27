# Reference Documentation

## Overview
This section contains reference materials, analytics documentation, and change logs for the Looplly platform.

## Documents in this Category

- **[ANALYTICS.md](./ANALYTICS.md)** - Analytics implementation, tracking events, and reporting
- **[RECENT_CHANGES.md](./RECENT_CHANGES.md)** - Changelog and recent platform updates

## Quick Start

### For Product Managers
1. Review [ANALYTICS.md](./ANALYTICS.md) for available metrics and dashboards
2. Check [RECENT_CHANGES.md](./RECENT_CHANGES.md) regularly for platform updates

### For Developers
1. Implement analytics tracking using patterns in [ANALYTICS.md](./ANALYTICS.md)
2. Document changes in [RECENT_CHANGES.md](./RECENT_CHANGES.md) after deployments

## Analytics Overview

### Tracked Events
- User registration and authentication
- Profile completion by level
- Survey participation and completion
- Reputation point earning
- Badge awards
- Feature usage patterns

### Analytics Tools
- **Supabase Analytics**: Built-in database analytics
- **Custom Events**: Application-specific tracking
- **User Behavior**: Session and interaction tracking

### Key Metrics
- Daily/Monthly Active Users (DAU/MAU)
- Profile completion rates
- Survey completion rates
- Revenue per user
- Feature adoption rates
- User retention and churn

## Recent Changes

### Change Log Format
Each entry includes:
- **Date**: When change was deployed
- **Type**: Feature, Enhancement, Fix, or Documentation
- **Description**: What changed
- **Impact**: Affected systems or users
- **Migration**: Required actions (if any)

### Staying Updated
- Review [RECENT_CHANGES.md](./RECENT_CHANGES.md) weekly
- Subscribe to deployment notifications
- Check before starting new development
- Reference when troubleshooting issues

## Related Documentation
- [All Features](../features/README.md) - Feature documentation
- [Technical Architecture](../technical/README.md) - System design
- [Testing](../testing/README.md) - Testing recent changes
- [Deployment](../deployment/README.md) - Deployment procedures

## Common Reference Tasks

### Implementing Analytics Tracking
```typescript
// See ANALYTICS.md for event tracking patterns
import { trackEvent } from '@/utils/analytics';

trackEvent('profile_completed', {
  level: 2,
  userId: user.id
});
```

### Checking Recent Changes
```markdown
// See RECENT_CHANGES.md for chronological updates
// Search by date, feature, or component
```

### Generating Reports
```typescript
// See ANALYTICS.md for query patterns
// Use Supabase analytics dashboard or custom queries
```

## Analytics Best Practices

### Event Naming
- Use snake_case: `profile_completed`, `survey_started`
- Be specific: `level_2_profile_completed` vs `profile_completed`
- Include context: Category, user type, feature area

### Data Collection
- Respect user privacy and GDPR
- Only collect necessary data
- Anonymize personal information
- Provide opt-out mechanisms

### Performance
- Batch analytics events when possible
- Don't block UI with analytics calls
- Use background processing for heavy analytics

## Documentation Updates

### When to Update RECENT_CHANGES.md
- New feature deployments
- Breaking changes
- Bug fixes affecting multiple users
- Configuration changes
- Security updates

### Update Format
```markdown
## YYYY-MM-DD - [Feature Name]

**Type**: Feature | Enhancement | Fix | Documentation

**Description**: 
Clear explanation of what changed and why.

**Impact**: 
Who or what is affected by this change.

**Migration Required**: 
Steps users or developers need to take (if any).
```

## Need Help?
- Review [ANALYTICS.md](./ANALYTICS.md) for tracking implementation
- Check [RECENT_CHANGES.md](./RECENT_CHANGES.md) for platform history
- Consult category-specific README files for feature documentation
- See [Master Documentation Index](../DOCUMENTATION_INDEX.md) for full documentation map
