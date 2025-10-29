---
id: "reputation-streaks"
title: "Streak & Reputation System"
category: "Reputation & Rewards"
description: "Daily streaks, multipliers, and reputation rewards for consistent platform engagement"
audience: "admin"
tags: ["reputation", "streaks", "engagement", "rewards"]
status: "published"
version: "1.0"
created_at: "2024-01-15"
updated_at: "2024-01-15"
---

# Streak & Reputation System

## Overview

The Streak System rewards consistent daily engagement on Looplly, integrating with the Reputation System to unlock features and boost earnings.

## Streak Mechanics

### Daily Streak

A streak is maintained by completing qualifying actions on consecutive calendar days.

**Qualifying Actions:**
- Complete at least 1 survey
- Answer at least 3 profile questions
- Make at least 2 community posts/comments

**Streak Rules:**
- Resets at midnight (user's local timezone)
- 24-hour grace period if no action taken
- Freeze available with streak shields (see below)

### Streak Levels

| Streak Days | Level | Badge | Reputation Bonus |
|-------------|-------|-------|------------------|
| 1-6 | Warming Up | 🔥 | No bonus |
| 7-13 | Week Warrior | 🔥🔥 | +50 points |
| 14-29 | Fortnight Fighter | 🔥🔥🔥 | +150 points |
| 30-59 | Monthly Master | ⭐ | +300 points |
| 60-89 | Dedicated | ⭐⭐ | +500 points |
| 90+ | Unstoppable | 💎 | +1000 points |

### Streak Multipliers

Active streaks multiply earning rates:

| Streak Days | Earning Multiplier |
|-------------|-------------------|
| 1-6 | 1.0x (no bonus) |
| 7-13 | 1.05x (+5%) |
| 14-29 | 1.10x (+10%) |
| 30-59 | 1.15x (+15%) |
| 60-89 | 1.25x (+25%) |
| 90+ | 1.50x (+50%) |

**Example:**
- Base survey reward: 100 points
- User has 45-day streak
- Actual reward: 100 × 1.15 = 115 points

## Streak Shields (Freeze Mechanism)

### Earning Shields

Users can earn streak shields to protect their streaks:

| Action | Shields Earned |
|--------|----------------|
| Complete 30-day streak | 1 shield |
| Complete 60-day streak | 2 shields |
| Complete 90-day streak | 3 shields |
| Purchase with reputation points | 1 shield per 500 points |

### Using Shields

- Shields auto-activate if no action taken within 24 hours
- Each shield protects streak for 1 day
- Maximum 5 shields can be held
- Shields don't expire

## Database Schema

### User Streaks Table

```sql
CREATE TABLE user_streaks (
  user_id UUID PRIMARY KEY REFERENCES profiles(user_id),
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  streak_shields INTEGER DEFAULT 0,
  total_streaks_lost INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Streak History

```sql
CREATE TABLE streak_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id),
  streak_length INTEGER NOT NULL,
  started_at DATE NOT NULL,
  ended_at DATE NOT NULL,
  end_reason TEXT, -- 'broken', 'maintained', 'shielded'
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Daily Activity Log

```sql
CREATE TABLE daily_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(user_id),
  activity_date DATE NOT NULL,
  activity_type TEXT NOT NULL, -- 'survey', 'profile', 'community'
  activity_count INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, activity_date, activity_type)
);
```

## Streak Logic Implementation

### Check and Update Streak

```typescript
// src/utils/streakService.ts

export async function checkAndUpdateStreak(userId: string) {
  const { data: streak } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (!streak) return;
  
  const today = new Date().toISOString().split('T')[0];
  const lastActivityDate = streak.last_activity_date;
  const daysSinceLastActivity = daysBetween(lastActivityDate, today);
  
  if (daysSinceLastActivity === 0) {
    // Already logged activity today
    return;
  }
  
  if (daysSinceLastActivity === 1) {
    // Consecutive day - increment streak
    const newStreak = streak.current_streak + 1;
    await updateStreak(userId, newStreak, today);
    
    // Check for milestone bonuses
    await checkStreakMilestones(userId, newStreak);
  } else if (daysSinceLastActivity === 2 && streak.streak_shields > 0) {
    // Use shield to maintain streak
    await useStreakShield(userId);
    toast.success('Streak shield activated! Your streak is protected.');
  } else {
    // Streak broken
    await breakStreak(userId, streak.current_streak);
    toast.error(`Your ${streak.current_streak}-day streak was broken.`);
  }
}

async function updateStreak(
  userId: string, 
  newStreak: number, 
  date: string
) {
  const { data: current } = await supabase
    .from('user_streaks')
    .select('longest_streak')
    .eq('user_id', userId)
    .single();
  
  const longestStreak = Math.max(
    current?.longest_streak || 0,
    newStreak
  );
  
  await supabase
    .from('user_streaks')
    .update({
      current_streak: newStreak,
      longest_streak: longestStreak,
      last_activity_date: date,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
}

async function breakStreak(userId: string, streakLength: number) {
  // Record history
  const { data: streak } = await supabase
    .from('user_streaks')
    .select('last_activity_date')
    .eq('user_id', userId)
    .single();
  
  await supabase
    .from('streak_history')
    .insert({
      user_id: userId,
      streak_length: streakLength,
      started_at: calculateStartDate(streak.last_activity_date, streakLength),
      ended_at: streak.last_activity_date,
      end_reason: 'broken'
    });
  
  // Reset streak
  await supabase
    .from('user_streaks')
    .update({
      current_streak: 0,
      total_streaks_lost: supabase.rpc('increment', { 
        column: 'total_streaks_lost' 
      }),
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);
}

async function useStreakShield(userId: string) {
  await supabase
    .from('user_streaks')
    .update({
      streak_shields: supabase.rpc('decrement', { 
        column: 'streak_shields' 
      }),
      last_activity_date: new Date().toISOString().split('T')[0]
    })
    .eq('user_id', userId);
  
  // Log shield usage
  await supabase
    .from('daily_activities')
    .insert({
      user_id: userId,
      activity_date: new Date().toISOString().split('T')[0],
      activity_type: 'shield_used',
      activity_count: 1
    });
}
```

### Check Milestone Bonuses

```typescript
async function checkStreakMilestones(userId: string, streak: number) {
  const milestones = [
    { days: 7, points: 50, shields: 0 },
    { days: 14, points: 150, shields: 0 },
    { days: 30, points: 300, shields: 1 },
    { days: 60, points: 500, shields: 2 },
    { days: 90, points: 1000, shields: 3 }
  ];
  
  const milestone = milestones.find(m => m.days === streak);
  
  if (milestone) {
    // Award reputation points
    await awardReputationPoints(
      userId,
      milestone.points,
      'streak_milestone',
      `${streak}-day streak milestone achieved`
    );
    
    // Award shields
    if (milestone.shields > 0) {
      await supabase
        .from('user_streaks')
        .update({
          streak_shields: supabase.rpc('increment', {
            column: 'streak_shields',
            amount: milestone.shields
          })
        })
        .eq('user_id', userId);
    }
    
    // Show celebration
    toast.success(
      `🎉 ${streak}-day milestone! +${milestone.points} points` +
      (milestone.shields ? ` + ${milestone.shields} shields` : '')
    );
  }
}
```

## Frontend Components

### Streak Display

```typescript
// src/components/ui/streak-progress.tsx

interface StreakProgressProps {
  currentStreak: number;
  longestStreak: number;
  shields: number;
}

export function StreakProgress({ 
  currentStreak, 
  longestStreak, 
  shields 
}: StreakProgressProps) {
  const nextMilestone = getNextMilestone(currentStreak);
  const progress = ((currentStreak % nextMilestone) / nextMilestone) * 100;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔥 {currentStreak}-Day Streak
        </CardTitle>
        <CardDescription>
          Keep it going! Next milestone: {nextMilestone} days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="mb-4" />
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Longest Streak</p>
            <p className="text-2xl font-bold">{longestStreak}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Streak Shields</p>
            <p className="text-2xl font-bold">🛡️ {shields}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

### Activity Calendar

```typescript
// src/components/ui/activity-calendar.tsx

export function ActivityCalendar({ userId }: { userId: string }) {
  const { data: activities } = useQuery({
    queryKey: ['daily-activities', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('daily_activities')
        .select('activity_date, activity_type, activity_count')
        .eq('user_id', userId)
        .gte('activity_date', getDateMonthsAgo(3))
        .order('activity_date', { ascending: false });
      
      return data;
    }
  });
  
  return (
    <div className="activity-calendar">
      {/* Render heatmap-style calendar showing activity */}
      {/* Green squares for active days, gray for inactive */}
    </div>
  );
}
```

## Integration with Reputation System

### Combined Multipliers

Streak multipliers stack with reputation tier bonuses:

**Example:**
- Base survey: 100 points
- User tier: Regular (Tier 4) = +10% bonus
- User streak: 45 days = +15% bonus
- **Combined**: 100 × 1.10 × 1.15 = **126.5 points**

### Tier Progression Boost

Streaks accelerate tier progression:

```typescript
function calculateEffectivePoints(
  basePoints: number,
  tier: number,
  streak: number
): number {
  const tierMultiplier = getTierMultiplier(tier);
  const streakMultiplier = getStreakMultiplier(streak);
  
  return Math.round(basePoints * tierMultiplier * streakMultiplier);
}
```

## Notifications

### Streak Reminders

Send reminders if user hasn't completed qualifying action:

```typescript
// Scheduled job runs at 8 PM daily
async function sendStreakReminders() {
  const { data: users } = await supabase
    .from('user_streaks')
    .select('user_id, current_streak, last_activity_date')
    .neq('current_streak', 0);
  
  const today = new Date().toISOString().split('T')[0];
  
  for (const user of users) {
    if (user.last_activity_date !== today) {
      // User hasn't logged activity today
      await sendPushNotification(user.user_id, {
        title: '🔥 Don\'t break your streak!',
        body: `You have a ${user.current_streak}-day streak. Complete a survey to keep it going!`
      });
    }
  }
}
```

## Analytics

### Streak Metrics

```sql
-- Average streak length
SELECT AVG(current_streak) as avg_streak
FROM user_streaks
WHERE current_streak > 0;

-- Streak distribution
SELECT 
  CASE 
    WHEN current_streak BETWEEN 1 AND 6 THEN '1-6 days'
    WHEN current_streak BETWEEN 7 AND 13 THEN '7-13 days'
    WHEN current_streak BETWEEN 14 AND 29 THEN '14-29 days'
    WHEN current_streak BETWEEN 30 AND 59 THEN '30-59 days'
    WHEN current_streak >= 60 THEN '60+ days'
  END as streak_range,
  COUNT(*) as user_count
FROM user_streaks
WHERE current_streak > 0
GROUP BY streak_range;

-- Most active users
SELECT 
  p.full_name,
  us.current_streak,
  us.longest_streak
FROM user_streaks us
JOIN profiles p ON p.user_id = us.user_id
ORDER BY us.current_streak DESC
LIMIT 10;
```

## Related Documentation

- [Reputation Classification](REP_CLASSIFICATION_SYSTEM.md)
- [Earning Rules](PROFILING/EARNING_RULES.md)
- [User Engagement](docs/USER_ENGAGEMENT.md)
