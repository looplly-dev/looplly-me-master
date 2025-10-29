---
id: "reputation-overview"
title: "Reputation System Documentation"
category: "Features"
description: "Overview of reputation tracking through points, streaks, and tier-based classifications"
audience: "admin"
tags: ["reputation", "streaks", "tiers", "overview"]
status: "published"
version: "1.0.0"
---

# Reputation System Documentation

## Overview
The reputation system tracks user engagement through points, daily streaks, and tier-based classifications that unlock platform benefits and earning opportunities.

## Documents in this Category

- **[STREAK_REPUTATION_SYSTEM.md](./STREAK_REPUTATION_SYSTEM.md)** - Daily streaks, multipliers, earning mechanics
- **[REP_CLASSIFICATION_SYSTEM.md](./REP_CLASSIFICATION_SYSTEM.md)** - User tier system from Explorer to Legend

## Quick Start

### For End Users
1. Start with [STREAK_REPUTATION_SYSTEM.md](./STREAK_REPUTATION_SYSTEM.md) to understand how to earn reputation
2. Review [REP_CLASSIFICATION_SYSTEM.md](./REP_CLASSIFICATION_SYSTEM.md) to see tier benefits

### For Developers
1. Implement reputation tracking using [STREAK_REPUTATION_SYSTEM.md](./STREAK_REPUTATION_SYSTEM.md)
2. Integrate tier-based features with [REP_CLASSIFICATION_SYSTEM.md](./REP_CLASSIFICATION_SYSTEM.md)

## Reputation Mechanics

### Earning Reputation Points
- Complete profile questions
- Participate in surveys
- Maintain daily streaks
- Refer new users
- Achieve badges

### Daily Streaks
- **Active Days**: Consecutive days with platform activity
- **Multipliers**: Up to 2.5x bonus at 30+ day streaks
- **Streak Protection**: Grace periods to maintain streaks
- **Reset Conditions**: Inactivity causes streak reset

### Reputation Tiers
1. **Explorer** (0-99 Rep): Entry level, basic features
2. **Builder** (100-499 Rep): Enhanced earning opportunities
3. **Champion** (500-1499 Rep): Premium features, higher rates
4. **Legend** (1500+ Rep): Maximum benefits, exclusive access

## Related Documentation
- [Profile Completion](../profiling/EARNING_RULES.md) - Reputation through profiling
- [User Classification](../../users/CLASSIFICATION.md) - How tiers are assigned
- [Analytics](../../reference/ANALYTICS.md) - Tracking reputation metrics

## Common Tasks

### Calculating User Reputation
```typescript
// See REP_CLASSIFICATION_SYSTEM.md for implementation
const tier = getUserTier(totalReputation);
```

### Tracking Streaks
```typescript
// See STREAK_REPUTATION_SYSTEM.md for streak logic
const streakMultiplier = calculateStreakBonus(consecutiveDays);
```

### Awarding Reputation Points
```typescript
// See STREAK_REPUTATION_SYSTEM.md for point allocation
await awardReputation(userId, points, reason);
```

## Need Help?
- Review [STREAK_REPUTATION_SYSTEM.md](./STREAK_REPUTATION_SYSTEM.md) for earning mechanics
- Check [REP_CLASSIFICATION_SYSTEM.md](./REP_CLASSIFICATION_SYSTEM.md) for tier benefits
- See [../../reference/RECENT_CHANGES.md](../../reference/RECENT_CHANGES.md) for reputation updates
