---
id: "reputation-system"
title: "Reputation Classification System"
category: "Reputation & Rewards"
description: "Gamified user reputation and tier progression system"
audience: "all"
tags: ["reputation", "gamification", "tiers", "points"]
status: "published"
---

# Reputation Classification System

## Overview

The Looplly Reputation System is a gamified progression framework that rewards user engagement and quality contributions across the platform.

## Reputation Tiers

### Tier Structure

| Tier | Min Points | Max Points | Title | Benefits |
|------|-----------|-----------|-------|----------|
| 1 | 0 | 99 | Newcomer | Basic access |
| 2 | 100 | 499 | Explorer | Standard surveys |
| 3 | 500 | 1,499 | Contributor | Priority matching |
| 4 | 1,500 | 3,999 | Regular | Premium surveys |
| 5 | 4,000 | 9,999 | Veteran | All features |
| 6 | 10,000 | 24,999 | Expert | Priority support |
| 7 | 25,000 | 49,999 | Master | Exclusive surveys |
| 8 | 50,000 | 99,999 | Champion | VIP treatment |
| 9 | 100,000 | 249,999 | Legend | Special rewards |
| 10 | 250,000+ | ∞ | Elite | Ultimate access |

## Earning Reputation Points

### Profile Completion

| Action | Points | Notes |
|--------|--------|-------|
| Complete Level 1 Profile | +50 | Automatic on activation |
| Complete Level 2 Profile | +150 | One-time bonus |
| Complete Level 3 Profile | +300 | One-time bonus |
| Refresh Stale Profile Data | +10 | Per question updated |

### Daily Engagement

| Action | Points | Limit |
|--------|--------|-------|
| Daily Login | +5 | Once per day |
| Complete Daily Survey | +20 | Once per day |
| Maintain Streak (7 days) | +50 | Weekly bonus |
| Maintain Streak (30 days) | +200 | Monthly bonus |

### Survey Completion

| Action | Points | Notes |
|--------|--------|-------|
| Complete Short Survey (<5 min) | +15 | Per survey |
| Complete Medium Survey (5-10 min) | +30 | Per survey |
| Complete Long Survey (>10 min) | +50 | Per survey |
| Quality Response Bonus | +10 | For detailed answers |
| Survey Speed Bonus | +5 | Complete within time limit |

### Referrals

| Action | Points | Notes |
|--------|--------|-------|
| Successful Referral | +100 | When referee completes Level 1 |
| Referee Completes Level 2 | +50 | Additional bonus |
| Referee Completes Level 3 | +100 | Additional bonus |
| 5 Active Referrals | +250 | Milestone bonus |

### Community Engagement

| Action | Points | Limit |
|--------|--------|-------|
| Post in Community | +5 | 3 per day |
| Comment on Post | +2 | 10 per day |
| Receive Upvote | +1 | No limit |
| Helpful Response Badge | +25 | Moderator awarded |

### Special Activities

| Action | Points | Notes |
|--------|--------|-------|
| Beta Test New Feature | +100 | One-time |
| Submit Feedback | +25 | Once per feature |
| Report Bug | +50 | If confirmed |
| Content Contribution | +200 | Approved guides/content |

## Tier Benefits

### Tier 1: Newcomer (0-99 points)
- **Survey Access**: Basic surveys only (10-20% of available)
- **Payout**: Standard rates
- **Support**: Community support only
- **Features**: Core platform features

### Tier 2: Explorer (100-499 points)
- **Survey Access**: Standard surveys (30-40%)
- **Payout**: Standard rates
- **Support**: Email support (48h response)
- **Features**: Community access unlocked

### Tier 3: Contributor (500-1,499 points)
- **Survey Access**: Most surveys (50-60%)
- **Payout**: +5% bonus on all earnings
- **Support**: Email support (24h response)
- **Features**: Referral program unlocked

### Tier 4: Regular (1,500-3,999 points)
- **Survey Access**: Premium surveys (70-80%)
- **Payout**: +10% bonus on all earnings
- **Support**: Priority email support (12h response)
- **Features**: All standard features + badges

### Tier 5: Veteran (4,000-9,999 points)
- **Survey Access**: All surveys (100%)
- **Payout**: +15% bonus on all earnings
- **Support**: Priority email + chat support (6h response)
- **Features**: Profile verification badge

### Tier 6: Expert (10,000-24,999 points)
- **Survey Access**: All surveys + early access to new surveys
- **Payout**: +20% bonus on all earnings
- **Support**: Priority support (3h response)
- **Features**: Expert badge + profile highlighting

### Tier 7: Master (25,000-49,999 points)
- **Survey Access**: Exclusive high-value surveys
- **Payout**: +25% bonus on all earnings
- **Support**: VIP support (1h response)
- **Features**: Master badge + monthly bonus surveys

### Tier 8: Champion (50,000-99,999 points)
- **Survey Access**: All surveys + VIP invitations
- **Payout**: +30% bonus on all earnings
- **Support**: Dedicated support agent
- **Features**: Champion badge + quarterly rewards

### Tier 9: Legend (100,000-249,999 points)
- **Survey Access**: Premium exclusive surveys
- **Payout**: +40% bonus on all earnings
- **Support**: Direct line to support team
- **Features**: Legend badge + special events access

### Tier 10: Elite (250,000+ points)
- **Survey Access**: Ultra-premium surveys
- **Payout**: +50% bonus on all earnings
- **Support**: Personal account manager
- **Features**: Elite badge + invitation to advisory board

## Reputation Decay

### Inactivity Penalty

Points decay with prolonged inactivity to encourage engagement:

| Inactive Period | Decay Rate |
|----------------|-----------|
| 0-30 days | No decay |
| 31-60 days | -1% per week |
| 61-90 days | -2% per week |
| 91-180 days | -5% per week |
| 180+ days | -10% per week |

**Example:**
- User has 10,000 points
- Inactive for 45 days (7 weeks at -1%)
- Loses ~700 points → 9,300 points

### Reactivation Bonus

Users who return after inactivity receive bonus points:
- **30-60 days inactive**: +50 points on first survey
- **60-90 days inactive**: +100 points on first survey
- **90+ days inactive**: +200 points on first survey

## Database Schema

### User Reputation Table

```sql
CREATE TABLE user_reputation (
  user_id UUID PRIMARY KEY REFERENCES profiles(user_id),
  reputation_points INTEGER DEFAULT 0,
  current_tier INTEGER DEFAULT 1,
  lifetime_points INTEGER DEFAULT 0, -- Never decays
  points_earned_this_month INTEGER DEFAULT 0,
  last_activity TIMESTAMP DEFAULT NOW(),
  tier_achieved_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Reputation Transactions

```sql
CREATE TABLE reputation_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id),
  points_change INTEGER NOT NULL, -- Can be negative for penalties
  transaction_type TEXT NOT NULL, -- 'survey', 'referral', 'profile', 'decay', etc.
  description TEXT,
  metadata JSONB, -- Additional context
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tier Configuration

```sql
CREATE TABLE reputation_tiers (
  tier_number INTEGER PRIMARY KEY,
  tier_name TEXT NOT NULL,
  min_points INTEGER NOT NULL,
  max_points INTEGER,
  survey_access_percentage INTEGER,
  earning_bonus_percentage INTEGER,
  support_response_hours INTEGER,
  features JSONB -- Array of unlocked features
);
```

## Frontend Implementation

### Reputation Display Component

```typescript
// src/components/ui/reputation-badge.tsx
interface ReputationBadgeProps {
  points: number;
  tier: number;
}

export function ReputationBadge({ points, tier }: ReputationBadgeProps) {
  const tierConfig = getTierConfig(tier);
  const progressToNext = calculateProgressToNextTier(points, tier);
  
  return (
    <div className="reputation-badge">
      <div className="tier-icon">{tierConfig.icon}</div>
      <div className="tier-info">
        <h3>{tierConfig.name}</h3>
        <p>{points.toLocaleString()} points</p>
      </div>
      <Progress value={progressToNext} className="tier-progress" />
    </div>
  );
}
```

### Hook for Reputation Data

```typescript
// src/hooks/useUserReputation.ts
export function useUserReputation() {
  return useQuery({
    queryKey: ['user-reputation'],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('user_reputation')
        .select('*')
        .eq('user_id', user.user.id)
        .single();
      
      if (error) throw error;
      return data;
    }
  });
}
```

### Award Points Function

```typescript
// src/utils/reputationService.ts
export async function awardReputationPoints(
  userId: string,
  points: number,
  type: string,
  description: string,
  metadata?: object
) {
  // 1. Insert transaction record
  const { error: txnError } = await supabase
    .from('reputation_transactions')
    .insert({
      user_id: userId,
      points_change: points,
      transaction_type: type,
      description,
      metadata
    });
  
  if (txnError) throw txnError;
  
  // 2. Update user reputation
  const { data: current } = await supabase
    .from('user_reputation')
    .select('reputation_points, lifetime_points')
    .eq('user_id', userId)
    .single();
  
  const newPoints = (current?.reputation_points || 0) + points;
  const newLifetime = (current?.lifetime_points || 0) + Math.max(0, points);
  const newTier = calculateTier(newPoints);
  
  const { error: updateError } = await supabase
    .from('user_reputation')
    .update({
      reputation_points: newPoints,
      lifetime_points: newLifetime,
      current_tier: newTier,
      last_activity: new Date().toISOString()
    })
    .eq('user_id', userId);
  
  if (updateError) throw updateError;
  
  // 3. Check if tier changed (trigger celebration)
  if (newTier > (current?.current_tier || 1)) {
    await triggerTierUpNotification(userId, newTier);
  }
}
```

## Gamification Elements

### Progress Visualization

Display progress to next tier:

```typescript
function calculateProgressToNextTier(points: number, tier: number): number {
  const currentTierMin = TIER_THRESHOLDS[tier];
  const nextTierMin = TIER_THRESHOLDS[tier + 1];
  
  if (!nextTierMin) return 100; // Max tier reached
  
  const range = nextTierMin - currentTierMin;
  const progress = points - currentTierMin;
  
  return Math.min(100, (progress / range) * 100);
}
```

### Tier-Up Celebration

```typescript
function triggerTierUpNotification(userId: string, newTier: number) {
  const tierConfig = getTierConfig(newTier);
  
  // Show modal/toast
  toast({
    title: `🎉 Tier ${newTier} Unlocked!`,
    description: `You're now a ${tierConfig.name}! ${tierConfig.benefits}`,
    duration: 10000
  });
  
  // Award badge
  awardBadge(userId, `tier_${newTier}`);
  
  // Send email
  sendEmail(userId, 'tier_up', { tier: newTier });
}
```

## Related Documentation

- [Earning Rules](PROFILING/EARNING_RULES.md)
- [Streak System](STREAK_REPUTATION_SYSTEM.md)
- [User Classification](USER_CLASSIFICATION.md)
- [Badge System](docs/BADGE_SYSTEM.md)
