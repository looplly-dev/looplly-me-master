# Streak & Reputation System Documentation

## Table of Contents
1. [Overview & Purpose](#overview--purpose)
2. [Database Schema](#database-schema)
3. [Streak Tracking Mechanics](#streak-tracking-mechanics)
4. [Milestone System](#milestone-system)
5. [Reputation Point Rewards](#reputation-point-rewards)
6. [React Hooks Documentation](#react-hooks-documentation)
7. [UI Components](#ui-components)
8. [User Flow & Triggers](#user-flow--triggers)
9. [Database Queries & RLS Policies](#database-queries--rls-policies)
10. [Integration Points](#integration-points)
11. [Toast Notifications](#toast-notifications)
12. [Mock Data Files](#mock-data-files)
13. [Environment Configuration](#environment-configuration)
14. [Testing Checklist](#testing-checklist)
15. [Performance Considerations](#performance-considerations)
16. [Future Enhancements](#future-enhancements)
17. [Troubleshooting Guide](#troubleshooting-guide)
18. [Related Documentation](#related-documentation)

---

## Overview & Purpose

The **Streak & Reputation System** is a gamification layer designed to encourage daily user engagement and reward consistent participation in the Looplly platform. The system tracks consecutive days of activity and awards reputation points that contribute to a user's overall standing and unlock access to higher-tier earning opportunities.

### Key Features:
- **Daily Streak Tracking**: Automatically records consecutive days of user activity
- **Milestone Achievements**: Special badges and bonuses for reaching 7, 30, 90, and 365-day streaks
- **Reputation Point Rewards**: Scaling daily bonuses based on current streak length
- **Automatic Tier Progression**: Reputation score determines user tier (Bronze → Silver → Gold → Platinum → Diamond)
- **Quality Metrics**: Survey completion rates and consistency scores that influence reputation

### Business Goals:
1. **Increase Daily Active Users (DAU)**: Streaks incentivize daily logins
2. **Improve User Retention**: Longer streaks = higher emotional investment
3. **Fair Job Distribution**: Reputation gates access to premium opportunities
4. **Reduce Fraud**: Quality metrics help identify low-quality users

---

## Database Schema

### Table: `user_streaks`

Tracks daily activity streaks and milestone achievements for each user.

```sql
CREATE TABLE public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_started_at TIMESTAMP WITH TIME ZONE,
  milestones JSONB DEFAULT '{
    "weekly": {"achieved": false, "count": 0},
    "monthly": {"achieved": false, "count": 0},
    "quarterly": {"achieved": false, "count": 0},
    "yearly": {"achieved": false, "count": 0}
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_streaks_user_id ON public.user_streaks(user_id);
```

#### Column Descriptions:
- **`current_streak`**: Number of consecutive days with activity (0 = no activity yet, 1+ = active streak)
- **`longest_streak`**: Personal record for consecutive days (never decreases)
- **`last_activity_date`**: ISO date string (YYYY-MM-DD) of last recorded activity
- **`streak_started_at`**: Timestamp when the current streak began
- **`milestones`**: JSONB object tracking achievement status and repeat counts for each milestone tier

### Table: `user_reputation`

Tracks reputation scores, tier levels, history, and quality metrics for each user.

```sql
CREATE TABLE public.user_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  level TEXT DEFAULT 'Bronze Novice',
  tier TEXT DEFAULT 'Bronze',
  prestige INTEGER DEFAULT 0,
  next_level_threshold INTEGER DEFAULT 100,
  history JSONB DEFAULT '[]',
  quality_metrics JSONB DEFAULT '{
    "surveysCompleted": 0,
    "surveysRejected": 0,
    "averageTime": "0 min",
    "consistencyScore": 0,
    "speedingRate": 0
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_reputation_user_id ON public.user_reputation(user_id);
CREATE INDEX idx_user_reputation_tier ON public.user_reputation(tier);
```

#### Column Descriptions:
- **`score`**: Total reputation points earned (determines tier)
- **`level`**: Human-readable level name (e.g., "Silver Elite")
- **`tier`**: Category for job access (Bronze, Silver, Gold, Platinum, Diamond)
- **`prestige`**: Number of times user has "prestiged" (future feature)
- **`next_level_threshold`**: Points needed to reach next tier
- **`history`**: Array of last 50 reputation-earning actions with points and timestamps
- **`quality_metrics`**: Survey performance data used for quality scoring

---

## Streak Tracking Mechanics

### Daily Tracking Logic

The system uses **ISO date strings** (YYYY-MM-DD) to determine consecutive days, avoiding timezone complexity.

#### When `updateStreak()` is Called:
1. **Get today's date**: `const today = new Date().toISOString().split('T')[0];`
2. **Check last activity date**:
   - **If `last_activity_date === today`**: No change (already recorded today)
   - **If `last_activity_date === yesterday`**: Increment `current_streak` by 1
   - **If `last_activity_date` is older than yesterday**: Reset `current_streak` to 1 (streak broken)
3. **Update longest streak**: `longest_streak = Math.max(longest_streak, current_streak)`
4. **Save to database** with `last_activity_date = today`

### Streak Breaking vs Resetting

- **Broken Streak**: Missing 1+ days → `current_streak` resets to `1` (not `0`)
- **New User**: First activity → `current_streak` starts at `1`
- **Grace Period**: Currently **NOT implemented** (future feature)

### Example Scenarios

| Scenario | Last Activity | Current Streak (Before) | Current Streak (After) |
|----------|---------------|------------------------|----------------------|
| First visit | `null` | 0 | 1 |
| Daily consecutive | Yesterday | 5 | 6 |
| Same day (duplicate) | Today | 5 | 5 (no change) |
| Missed 1 day | 2 days ago | 10 | 1 (broken) |
| Missed 7 days | 7 days ago | 30 | 1 (broken) |

---

## Milestone System

Milestones are special achievements awarded at specific streak thresholds. Each milestone awards a **one-time reputation bonus** and a **collectible badge**.

### Milestone Definitions

| Milestone | Streak Threshold | Emoji | Badge Name | Rep Award | Repeatable |
|-----------|-----------------|-------|------------|----------|------------|
| **Weekly** | 7 days | ⚡ | Week Warrior | +25 Rep | Yes (every 7 days) |
| **Monthly** | 30 days | 🌙 | Monthly Master | +50 Rep | Yes (every 30 days) |
| **Quarterly** | 90 days | 🌟 | Quarter Champion | +150 Rep | Yes (every 90 days) |
| **Yearly** | 365 days | 👑 | Annual Legend | +500 Rep | Yes (every 365 days) |

### Milestone JSONB Structure

```json
{
  "weekly": {
    "achieved": true,    // Has this milestone been reached at least once?
    "count": 12          // Number of times achieved (for repeatable milestones)
  },
  "monthly": {
    "achieved": true,
    "count": 2
  },
  "quarterly": {
    "achieved": false,
    "count": 0
  },
  "yearly": {
    "achieved": false,
    "count": 0
  }
}
```

### Milestone Detection Logic

When `current_streak` reaches a milestone threshold:
1. Check if milestone is already `achieved` for this streak cycle
2. If not achieved:
   - Set `achieved: true`
   - Increment `count` (for analytics)
   - Call `updateMilestones()` to persist
   - Call `addReputationPoints({ points: milestoneReward, action: 'Milestone: Week Warrior' })`
   - Display celebratory toast notification

---

## Reputation Point Rewards

Reputation points are the primary currency of the system, determining a user's tier and access to earning opportunities.

### Daily Streak Bonuses

Users earn reputation points **automatically** when their daily streak is updated. The bonus scales with streak length:

| Streak Range | Daily Rep Bonus | Badge Color | Icon |
|--------------|----------------|-------------|------|
| 1-6 days | +5 Rep | Gray | 🔥 |
| 7-13 days | +10 Rep | Orange | ⚡ |
| 14-29 days | +15 Rep | Yellow | 🌙 |
| 30+ days | +25 Rep | Purple | 👑 |

#### Example Calculation:
- User with 3-day streak visits today → Earns **+5 Rep**
- User with 15-day streak visits today → Earns **+15 Rep**
- User with 100-day streak visits today → Earns **+25 Rep**

### Milestone Bonuses

In addition to daily bonuses, reaching milestone thresholds awards **one-time bonus Rep**:

```typescript
const milestoneRewards = {
  weekly: 25,      // 7-day streak
  monthly: 50,     // 30-day streak
  quarterly: 150,  // 90-day streak
  yearly: 500      // 365-day streak
};
```

### Other Reputation Sources

| Action | Rep Award | Trigger |
|--------|----------|---------|
| Survey Completion | +50 Rep | `earning_activities` status = 'completed' |
| Profile Completion | +100 Rep | `kyc_verifications` verified = true |
| Successful Referral | +50 Rep | `user_referrals` status = 'qualified' |
| Daily Streak | +5 to +25 Rep | `updateStreak()` called |
| Milestone Achievement | +25 to +500 Rep | Milestone threshold reached |

### Reputation Tier Thresholds

See `docs/REP_CLASSIFICATION_SYSTEM.md` for full tier system details.

| Tier | Score Range | Icon | Access Level |
|------|-------------|------|--------------|
| Bronze | 0-499 | 🥉 | Basic jobs |
| Silver | 500-1999 | 🥈 | Intermediate jobs |
| Gold | 2000-4999 | 🥇 | Advanced jobs |
| Platinum | 5000-9999 | 💎 | Premium jobs |
| Diamond | 10000+ | 👑 | Exclusive jobs |

---

## React Hooks Documentation

### `useUserStreaks()`

**Location**: `src/hooks/useUserStreaks.ts`

#### Purpose
Fetches and manages user streak data from the `user_streaks` table. Automatically initializes a new streak record if none exists.

#### Usage
```typescript
import { useUserStreaks } from '@/hooks/useUserStreaks';

const { streak, isLoading, updateStreak, updateMilestones } = useUserStreaks();
```

#### Returns
- **`streak`**: `UserStreak | null` - Current streak data or null if loading
- **`isLoading`**: `boolean` - Loading state for initial fetch
- **`updateStreak`**: `() => void` - Function to increment daily streak
- **`updateMilestones`**: `(milestones: Milestones) => void` - Function to update milestone achievements

#### Type Definitions
```typescript
export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_started_at: string | null;
  milestones: {
    weekly: { achieved: boolean; count: number };
    monthly: { achieved: boolean; count: number };
    quarterly: { achieved: boolean; count: number };
    yearly: { achieved: boolean; count: number };
  };
  created_at: string;
  updated_at: string;
}
```

#### Auto-Initialization Logic
If no streak record exists for the user, the hook automatically creates one:
```typescript
if (!data) {
  const { data: newStreak, error: insertError } = await supabase
    .from('user_streaks')
    .insert({
      user_id: authState.user.id,
      current_streak: 0,
      longest_streak: 0,
      milestones: {
        weekly: { achieved: false, count: 0 },
        monthly: { achieved: false, count: 0 },
        quarterly: { achieved: false, count: 0 },
        yearly: { achieved: false, count: 0 }
      }
    })
    .select()
    .single();
  return newStreak;
}
```

#### Query Key
- **Key**: `['user-streak', userId]`
- **Enabled**: Only when `authState.user?.id` exists
- **Stale Time**: Default (0ms, refetch on window focus)

#### Mutations

##### `updateStreak()`
Updates the user's daily streak based on last activity date.

**Logic**:
1. Compares `last_activity_date` with today's date
2. If last activity was yesterday → increment streak
3. If last activity was earlier → reset to 1
4. Updates `longest_streak` if needed
5. Invalidates query cache on success
6. Shows toast notification

**Error Handling**: Displays error toast on failure

##### `updateMilestones(milestones)`
Persists milestone achievement data to the database.

**Parameters**:
- `milestones`: Updated milestone object with `achieved` and `count` fields

**Side Effects**: Invalidates `['user-streak', userId]` query

---

### `useUserReputation()`

**Location**: `src/hooks/useUserReputation.ts`

#### Purpose
Fetches and manages user reputation data from the `user_reputation` table. Handles reputation point awards, tier calculations, and quality metrics.

#### Usage
```typescript
import { useUserReputation } from '@/hooks/useUserReputation';

const { 
  reputation, 
  isLoading, 
  addReputationPoints, 
  updateQualityMetrics 
} = useUserReputation();
```

#### Returns
- **`reputation`**: `UserReputation | null` - Current reputation data or null if loading
- **`isLoading`**: `boolean` - Loading state for initial fetch
- **`addReputationPoints`**: `({ points, action }) => void` - Function to award Rep
- **`updateQualityMetrics`**: `(metrics: QualityMetrics) => void` - Function to update quality data

#### Type Definitions
```typescript
export interface UserReputation {
  id: string;
  user_id: string;
  score: number;
  level: string;
  tier: string;
  prestige: number;
  next_level_threshold: number;
  history: ReputationHistory[];
  quality_metrics: QualityMetrics;
  created_at: string;
  updated_at: string;
}

export interface ReputationHistory {
  action: string;
  points: number;
  date: string;
}

export interface QualityMetrics {
  surveysCompleted: number;
  surveysRejected: number;
  averageTime: string;
  consistencyScore: number;
  speedingRate: number;
}
```

#### Auto-Initialization Logic
Creates a default reputation record if none exists:
```typescript
if (!data) {
  const { data: newReputation } = await supabase
    .from('user_reputation')
    .insert({
      user_id: authState.user.id,
      score: 0,
      level: 'Bronze Novice',
      tier: 'Bronze',
      next_level_threshold: 100,
      history: [],
      quality_metrics: {
        surveysCompleted: 0,
        surveysRejected: 0,
        averageTime: '0 min',
        consistencyScore: 0,
        speedingRate: 0
      }
    })
    .select()
    .single();
  return newReputation;
}
```

#### Mutations

##### `addReputationPoints({ points, action })`
Awards reputation points and updates tier/level accordingly.

**Parameters**:
- `points`: `number` - Amount of Rep to award
- `action`: `string` - Description of the action (e.g., "Survey completion")

**Logic**:
1. Calculates new score: `newScore = currentScore + points`
2. Determines new tier based on score thresholds
3. Calculates `next_level_threshold` for progress bar
4. Appends action to `history` array (keeps last 50 entries)
5. Updates database with new values
6. Shows toast notification with level info

**Example**:
```typescript
addReputationPoints({ 
  points: 50, 
  action: 'Survey completion' 
});
```

##### `updateQualityMetrics(metrics)`
Updates survey performance metrics without changing score.

**Parameters**:
- `metrics`: `QualityMetrics` - Updated quality metrics object

**Usage**:
```typescript
updateQualityMetrics({
  surveysCompleted: 127,
  surveysRejected: 3,
  averageTime: "8.5 min",
  consistencyScore: 94,
  speedingRate: 2
});
```

---

## UI Components

### `StreakProgress` Component

**Location**: `src/components/ui/streak-progress.tsx`

#### Purpose
Displays the user's current and longest streaks, progress toward the next milestone, and milestone achievement badges.

#### Props
```typescript
interface StreakProgressProps {
  currentStreak: number;          // Current consecutive days
  longestStreak: number;          // Personal record
  daysUntilMonthlyMilestone: number;  // Calculated: 30 - (currentStreak % 30)
  monthsUntilYearly: number;      // Calculated: Math.floor((365 - currentStreak) / 30)
  milestones: {
    weekly: { achieved: boolean; count: number };
    monthly: { achieved: boolean; count: number };
    quarterly: { achieved: boolean; count: number };
    yearly: { achieved: boolean; count: number };
  };
}
```

#### Visual Features

##### Current Streak Display
- Large flame emoji (🔥)
- Bold number showing current streak
- Daily Rep reward based on streak length
- Example: **"14 🔥 DAYS"** → **"+15 Rep Daily"**

##### Longest Streak Display
- Trophy emoji (🏆)
- Personal record number
- Subtle text styling

##### Next Milestone Progress
- Circular progress indicator
- Color-coded by milestone tier
- Shows remaining days
- Displays Rep reward amount
- Example: **"23 days until Monthly Master +50 Rep"**

##### Milestone Badges
Grid layout showing all four milestone tiers:

| Badge | Threshold | Icon | Achieved Color | Locked Color |
|-------|-----------|------|----------------|--------------|
| Week Warrior | 7 days | ⚡ | Green (success) | Gray (muted) |
| Monthly Master | 30 days | 🌙 | Yellow | Gray |
| Quarter Champion | 90 days | 🌟 | Purple | Gray |
| Annual Legend | 365 days | 👑 | Gold | Gray |

#### Responsive Design
- **Mobile**: Single column, stacked layout
- **Tablet**: 2-column grid for milestone badges
- **Desktop**: Full grid with sidebar-friendly sizing

#### Helper Functions

##### `getStreakReward(streak: number): number`
Returns the daily Rep bonus based on current streak length:
```typescript
if (streak >= 30) return 25;
if (streak >= 14) return 15;
if (streak >= 7) return 10;
return 5;
```

##### `getNextMilestone()`
Calculates and returns details about the next upcoming milestone:
```typescript
return {
  name: "Monthly Master",
  emoji: "🌙",
  target: 30,
  reward: 50,
  progress: (currentStreak / 30) * 100,
  remaining: 30 - currentStreak,
  color: "text-yellow-500"
};
```

---

### `RepTab` Component Integration

**Location**: `src/components/dashboard/RepTab.tsx`

#### Current State (Using Mock Data)
Currently displays data from `src/mock_data/pages/rep.json`:
```typescript
const userStats = {
  reputation: {
    score: 1850,
    level: "Silver Elite",
    history: [...]
  },
  streaks: {
    currentStreak: 14,
    longestStreak: 30,
    milestones: {...}
  }
};
```

#### Planned Integration (Real Database)
Will be refactored to use hooks:
```typescript
const { streak, isLoading: streakLoading, updateStreak } = useUserStreaks();
const { reputation, isLoading: repLoading, addReputationPoints } = useUserReputation();

// Auto-update streak on page load
useEffect(() => {
  if (streak && authState.user) {
    updateStreak();
  }
}, [streak, authState.user]);
```

#### Loading States
- Show `<Skeleton />` components while data fetches
- Combine loading states: `const isLoading = streakLoading || repLoading;`
- Display partial UI if one hook loads faster than the other

#### Error Handling
- Toast notifications for mutation errors
- Fallback UI if data fetch fails
- Retry logic via React Query's built-in refetch

---

## User Flow & Triggers

### Automatic Streak Updates

#### Flow:
1. **User logs in** → `authState.user` is set
2. **User navigates to `/rep` route** → `RepTab` component mounts
3. **`useEffect` fires** → Calls `updateStreak()`
4. **Hook logic executes**:
   - Compares `last_activity_date` with today
   - If yesterday → increment `current_streak`
   - If older → reset to 1
   - If today → no change
5. **Database updates** → New streak value persisted
6. **Query invalidation** → UI re-renders with fresh data
7. **Toast notification** → "Streak Updated!"

#### Code Example:
```typescript
useEffect(() => {
  if (streak && authState.user) {
    const today = new Date().toISOString().split('T')[0];
    if (streak.last_activity_date !== today) {
      updateStreak();
    }
  }
}, [streak, authState.user, updateStreak]);
```

---

### Milestone Achievement Flow

#### Detection Logic:
```typescript
const checkMilestones = () => {
  if (currentStreak >= 7 && !milestones.weekly.achieved) {
    // Award Weekly Milestone
    const newMilestones = {
      ...milestones,
      weekly: { achieved: true, count: milestones.weekly.count + 1 }
    };
    updateMilestones(newMilestones);
    addReputationPoints({ points: 25, action: 'Milestone: Week Warrior' });
    toast({
      title: '🎉 Milestone Unlocked!',
      description: "You've earned the Week Warrior badge! +25 Rep",
      duration: 5000,
    });
  }
  // Repeat for monthly, quarterly, yearly...
};
```

#### Reset Logic for Repeatable Milestones:
When a user breaks their streak and starts over:
1. `current_streak` resets to 1
2. `milestones.weekly.achieved` resets to `false` (ready to earn again)
3. `milestones.weekly.count` remains unchanged (historical record)

---

### Quality Metrics Integration

#### Survey Completion Trigger:
```typescript
// In EarnTab or survey completion handler
const handleSurveyComplete = async (surveyId: string) => {
  // Mark activity as complete in earning_activities table
  await supabase
    .from('earning_activities')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', surveyId);

  // Award reputation points
  addReputationPoints({ points: 50, action: 'Survey completion' });

  // Update quality metrics
  const newMetrics = {
    ...reputation.quality_metrics,
    surveysCompleted: reputation.quality_metrics.surveysCompleted + 1,
    consistencyScore: calculateConsistency(reputation.quality_metrics)
  };
  updateQualityMetrics(newMetrics);
};
```

#### Metrics Calculation:
```typescript
const calculateConsistency = (metrics: QualityMetrics) => {
  const total = metrics.surveysCompleted + metrics.surveysRejected;
  if (total === 0) return 0;
  return Math.round((metrics.surveysCompleted / total) * 100);
};
```

---

## Database Queries & RLS Policies

### Table: `user_streaks`

#### RLS Policies:
```sql
-- Users can view their own streaks
CREATE POLICY "Users can view own streaks"
ON public.user_streaks
FOR SELECT
USING (user_id = auth.uid());

-- Users can insert their own streaks
CREATE POLICY "Users can insert own streaks"
ON public.user_streaks
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own streaks
CREATE POLICY "Users can update own streaks"
ON public.user_streaks
FOR UPDATE
USING (user_id = auth.uid());

-- Admins can view all streaks
CREATE POLICY "Admins can view all streaks"
ON public.user_streaks
FOR SELECT
USING (has_role(auth.uid(), 'admin'));
```

#### Common Queries:

##### Fetch User Streak:
```typescript
const { data, error } = await supabase
  .from('user_streaks')
  .select('*')
  .eq('user_id', userId)
  .maybeSingle();
```

##### Update Streak:
```typescript
const { error } = await supabase
  .from('user_streaks')
  .update({
    current_streak: newCurrentStreak,
    longest_streak: newLongestStreak,
    last_activity_date: today,
    streak_started_at: streak.streak_started_at || new Date().toISOString()
  })
  .eq('user_id', userId);
```

##### Update Milestones:
```typescript
const { error } = await supabase
  .from('user_streaks')
  .update({ milestones: newMilestones })
  .eq('user_id', userId);
```

---

### Table: `user_reputation`

#### RLS Policies:
```sql
-- Users can view their own reputation
CREATE POLICY "Users can view own reputation"
ON public.user_reputation
FOR SELECT
USING (user_id = auth.uid());

-- All authenticated users can view others' reputation scores (leaderboard)
CREATE POLICY "All authenticated users can view others reputation scores"
ON public.user_reputation
FOR SELECT
USING (auth.role() = 'authenticated');

-- Users can insert their own reputation
CREATE POLICY "Users can insert own reputation"
ON public.user_reputation
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Users can update their own reputation
CREATE POLICY "Users can update own reputation"
ON public.user_reputation
FOR UPDATE
USING (user_id = auth.uid());

-- Admins can view all reputation
CREATE POLICY "Admins can view all reputation"
ON public.user_reputation
FOR SELECT
USING (has_role(auth.uid(), 'admin'));
```

#### Common Queries:

##### Fetch User Reputation:
```typescript
const { data, error } = await supabase
  .from('user_reputation')
  .select('*')
  .eq('user_id', userId)
  .maybeSingle();
```

##### Add Reputation Points:
```typescript
const newScore = currentScore + points;
const newTier = calculateTier(newScore);
const newHistory = [
  { action, points, date: new Date().toISOString() },
  ...history.slice(0, 49) // Keep last 50 entries
];

const { error } = await supabase
  .from('user_reputation')
  .update({
    score: newScore,
    tier: newTier,
    level: `${newTier} Elite`,
    next_level_threshold: calculateNextThreshold(newScore),
    history: newHistory
  })
  .eq('user_id', userId);
```

##### Update Quality Metrics:
```typescript
const { error } = await supabase
  .from('user_reputation')
  .update({ quality_metrics: newMetrics })
  .eq('user_id', userId);
```

---

## Integration Points

### Connection with Earning Activities

**Trigger**: When `earning_activities.status` changes to `'completed'`

```typescript
// In survey completion handler
const handleSurveyComplete = async (activityId: string) => {
  // 1. Mark activity as complete
  await supabase
    .from('earning_activities')
    .update({ 
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', activityId);

  // 2. Award reputation points
  addReputationPoints({ 
    points: 50, 
    action: 'Survey completion' 
  });

  // 3. Update quality metrics
  const currentMetrics = reputation.quality_metrics;
  updateQualityMetrics({
    ...currentMetrics,
    surveysCompleted: currentMetrics.surveysCompleted + 1
  });
};
```

---

### Connection with KYC Verification

**Trigger**: When `kyc_verifications.verified` changes to `true`

```typescript
// In KYC verification handler
const handleKycVerified = async () => {
  // Award one-time bonus for profile completion
  addReputationPoints({ 
    points: 100, 
    action: 'Profile completion' 
  });

  // Update profile flag
  await supabase
    .from('profiles')
    .update({ profile_complete: true })
    .eq('user_id', authState.user.id);
};
```

---

### Connection with Referrals

**Trigger**: When `user_referrals.status` changes to `'qualified'`

```typescript
// In referral qualification handler
const handleReferralQualified = async (referralId: string) => {
  // Get referrer user ID
  const { data: referral } = await supabase
    .from('user_referrals')
    .select('referrer_user_id')
    .eq('id', referralId)
    .single();

  // Award referrer reputation points
  if (referral?.referrer_user_id) {
    addReputationPoints({ 
      points: 50, 
      action: 'Successful referral' 
    });
  }
};
```

---

## Toast Notifications

### Streak Update Success
```typescript
toast({
  title: 'Streak Updated',
  description: 'Your daily streak has been recorded!',
});
```

### Milestone Achievement
```typescript
toast({
  title: '🎉 Milestone Unlocked!',
  description: `You've earned the ${milestoneName} badge! +${reward} Rep`,
  duration: 5000,
});
```

### Reputation Level Up
```typescript
toast({
  title: 'Reputation Updated',
  description: `You earned ${points} reputation points! Current level: ${level}`,
});
```

### Error Handling
```typescript
toast({
  title: 'Error',
  description: error.message,
  variant: 'destructive',
});
```

---

## Mock Data Files

### `src/mock_data/features/user-streaks.json`

Provides default streak data for development and testing:

```json
{
  "defaultStreak": {
    "currentStreak": 14,
    "longestStreak": 30,
    "lastActivityDate": "2024-01-18",
    "streakStartedAt": "2024-01-05T00:00:00Z",
    "milestones": {
      "weekly": { "achieved": true, "count": 12 },
      "monthly": { "achieved": true, "count": 2 },
      "quarterly": { "achieved": false, "count": 0 },
      "yearly": { "achieved": false, "count": 0 }
    }
  }
}
```

**Usage**: Currently used in `RepTab` component as fallback data.

**Important**: In production, this file is NOT used. The hooks make real database calls.

---

### `src/mock_data/features/user-reputation.json`

Provides default reputation data for development and testing:

```json
{
  "defaultReputation": {
    "score": 1850,
    "level": "Silver Elite",
    "tier": "Silver",
    "prestige": 2,
    "nextLevelThreshold": 2000,
    "history": [
      { "action": "Survey completion", "points": 50, "date": "2024-01-18" },
      { "action": "Daily streak bonus", "points": 25, "date": "2024-01-17" }
    ],
    "qualityMetrics": {
      "surveysCompleted": 127,
      "surveysRejected": 3,
      "averageTime": "8.5 min",
      "consistencyScore": 94,
      "speedingRate": 2
    }
  }
}
```

---

## Environment Configuration

### Development (Lovable Cloud)

**File**: `.env`
```env
VITE_SUPABASE_URL=https://kzqcfrubjccxrwfkkrze.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_PROJECT_ID=kzqcfrubjccxrwfkkrze
```

**Behavior**:
- Hooks connect to Lovable Cloud Supabase project
- Data persists between sessions
- RLS policies enforced
- Good for testing and development

---

### Production (External Supabase)

**File**: `.env.production`
```env
VITE_SUPABASE_URL=https://chlqpvzreztzxmjjdjpk.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[your-production-key]
VITE_SUPABASE_PROJECT_ID=chlqpvzreztzxmjjdjpk
```

**Migration Steps**:
1. Export data from Lovable Cloud project
2. Run migrations on production project
3. Import data to production
4. Update `.env` file with production credentials
5. Verify RLS policies match
6. Test all functionality in production

---

## Testing Checklist

### Streak Logic Tests
- [ ] New user gets `current_streak: 0` on first visit
- [ ] Visiting on consecutive days increments streak correctly
- [ ] Missing a day resets streak to 1 (not 0)
- [ ] `longest_streak` updates when current exceeds it
- [ ] Timezone handling works correctly (uses ISO date strings)
- [ ] Multiple visits in same day don't increment streak

### Milestone Tests
- [ ] 7-day streak awards Week Warrior milestone
- [ ] 30-day streak awards Monthly Master milestone
- [ ] 90-day streak awards Quarter Champion milestone
- [ ] 365-day streak awards Annual Legend milestone
- [ ] Milestone `count` increments for repeatable achievements
- [ ] Milestone Rep bonuses are awarded correctly

### Reputation Tests
- [ ] New user starts with 0 rep, Bronze Novice tier
- [ ] `addReputationPoints()` increases score correctly
- [ ] Tier auto-updates when thresholds are crossed
- [ ] History array maintains last 50 entries only
- [ ] Quality metrics update independently of score
- [ ] Toast notifications appear for rep changes

### UI Component Tests
- [ ] `StreakProgress` displays current and longest streaks
- [ ] Circular progress indicator shows correct percentage
- [ ] Milestone badges show achieved/locked states
- [ ] Daily Rep bonus updates based on streak length
- [ ] Next milestone calculation is accurate
- [ ] Color coding matches tier/milestone status

### Integration Tests
- [ ] Survey completion triggers rep point award
- [ ] KYC verification triggers bonus rep
- [ ] Referral qualification triggers rep for referrer
- [ ] Streak update triggers on Rep tab load
- [ ] Data persists between sessions
- [ ] RLS policies prevent unauthorized access

### Performance Tests
- [ ] Initial load time < 500ms
- [ ] Query cache reduces redundant fetches
- [ ] Mutations update UI optimistically (future)
- [ ] No infinite loops or memory leaks
- [ ] Works on mobile/tablet/desktop

---

## Performance Considerations

### Query Optimization
- **Indexed Fields**: `user_id` columns have indexes for fast lookups
- **Single-Row Queries**: Use `.maybeSingle()` for user-specific data
- **Avoid N+1 Queries**: Fetch related data with joins when possible

### Caching Strategy
- **React Query Cache Keys**:
  - `['user-streak', userId]`
  - `['user-reputation', userId]`
- **Stale Time**: Default 0ms (refetch on window focus)
- **Cache Invalidation**: Manual invalidation after mutations

### Optimistic Updates (Future)
```typescript
// Not yet implemented, but planned for V2
const { mutate } = useMutation({
  mutationFn: updateStreak,
  onMutate: async () => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['user-streak', userId]);
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['user-streak', userId]);
    
    // Optimistically update UI
    queryClient.setQueryData(['user-streak', userId], (old) => ({
      ...old,
      current_streak: old.current_streak + 1
    }));
    
    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['user-streak', userId], context.previous);
  }
});
```

### Lazy Loading
- Hooks only fetch when `authState.user?.id` exists
- Components show loading states during fetch
- No data fetching on unauthenticated routes

---

## Future Enhancements

### V2 Features (Next 3-6 Months)

#### Streak Grace Period
- Allow 1 missed day without breaking streak (with penalty)
- Deduct 3 days from current streak instead of full reset
- Show warning toast: "Streak saved! -3 day penalty applied"

#### Streak Freeze Items
- Let users "save" a streak for 1 day (purchasable with Rep)
- Cost: 50 Rep per freeze (max 3 per month)
- Useful for planned absences

#### Leaderboards
- Global leaderboard for longest current streaks
- Tier-based leaderboards (top Bronze, Silver, etc.)
- Weekly/Monthly/All-Time tabs
- Social features (follow friends, challenge others)

#### Seasonal Events
- Double Rep weekends
- Holiday bonus milestones (e.g., "25 days in December")
- Limited-time badges

#### Streak Challenges
- "Complete 3 surveys during a 7-day streak for +100 Rep"
- "Reach 30-day streak without missing quality threshold"
- Challenge progress tracking

---

### V3 Features (6-12 Months)

#### Social Streaks
- Team/group streaks with friends
- Shared milestone goals
- Team leaderboards

#### Streak Recovery
- Pay 100 Rep to restore a recently broken streak (within 48 hours)
- One-time use per month

#### Dynamic Milestones
- Personalized milestones based on user behavior
- Adaptive difficulty scaling
- Machine learning-based predictions

#### Streak Predictions
- AI-powered notifications: "You're at risk of breaking your streak!"
- Remind users 2 hours before day ends
- Suggest quick actions to maintain streak

#### Historical Analytics
- Charts showing streak patterns over time
- Heatmap of activity days (like GitHub contributions)
- Insights: "You're most active on Tuesdays"

---

## Troubleshooting Guide

### Issue: Streak Not Incrementing

**Symptoms**: User visits daily but `current_streak` stays the same

**Possible Causes**:
1. `last_activity_date` already set to today (duplicate call)
2. RLS policy blocking update (user not authenticated)
3. Timezone mismatch (ISO date string comparison failing)

**Solutions**:
- Check browser console for Supabase errors
- Verify `authState.user?.id` is not null
- Inspect `last_activity_date` value in database:
  ```sql
  SELECT user_id, current_streak, last_activity_date 
  FROM user_streaks 
  WHERE user_id = '[user-id]';
  ```
- Test date comparison logic:
  ```typescript
  const today = new Date().toISOString().split('T')[0];
  console.log('Today:', today);
  console.log('Last Activity:', streak.last_activity_date);
  ```

---

### Issue: Milestones Not Triggering

**Symptoms**: User reaches 7-day streak but doesn't receive Week Warrior badge

**Possible Causes**:
1. Milestone detection logic not running
2. `updateMilestones()` not called after detection
3. Rep point award function failing silently

**Solutions**:
- Add console logs to milestone detection:
  ```typescript
  console.log('Current streak:', currentStreak);
  console.log('Weekly achieved?', milestones.weekly.achieved);
  ```
- Verify milestone JSONB structure in database:
  ```sql
  SELECT milestones FROM user_streaks WHERE user_id = '[user-id]';
  ```
- Check toast notifications are enabled
- Test manually by calling:
  ```typescript
  updateMilestones({
    ...milestones,
    weekly: { achieved: true, count: 1 }
  });
  ```

---

### Issue: Reputation Not Updating

**Symptoms**: Survey completed but Rep score doesn't increase

**Possible Causes**:
1. `addReputationPoints()` mutation not triggered
2. RLS policy blocking update
3. History array constraint error (exceeds size limit)

**Solutions**:
- Check mutation status:
  ```typescript
  console.log('Mutation loading:', isLoading);
  console.log('Mutation error:', error);
  ```
- Verify RLS policies allow updates:
  ```sql
  SELECT * FROM user_reputation WHERE user_id = auth.uid();
  ```
- Trim history array to 50 entries:
  ```typescript
  const newHistory = [
    { action, points, date },
    ...history.slice(0, 49)
  ];
  ```
- Test tier calculation manually:
  ```typescript
  const tier = calculateTier(score);
  console.log('Tier for score', score, ':', tier);
  ```

---

### Issue: Mock Data vs Real Data Confusion

**Symptoms**: Changes to database don't reflect in UI

**Possible Causes**:
1. Component still using mock data instead of hooks
2. `.env` file points to wrong Supabase project
3. Query cache not invalidating

**Solutions**:
- Verify hooks are imported and used:
  ```typescript
  const { streak } = useUserStreaks(); // ✅ Real data
  const mockStreak = userStats.streaks; // ❌ Mock data
  ```
- Check `.env` file:
  ```bash
  cat .env | grep VITE_SUPABASE_URL
  ```
- Inspect network requests in browser DevTools (should see Supabase API calls)
- Force refetch:
  ```typescript
  queryClient.invalidateQueries(['user-streak', userId]);
  ```

---

## Related Documentation

- **[REP_CLASSIFICATION_SYSTEM.md](./REP_CLASSIFICATION_SYSTEM.md)**: Job tier system and reputation-based access control
- **[src/README-tests.md](../src/README-tests.md)**: Testing setup and guidelines
- **[ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md)**: Environment configuration and deployment
- **[PHASE1_SETUP_INSTRUCTIONS.md](../PHASE1_SETUP_INSTRUCTIONS.md)**: Initial database setup and migration

---

## Appendix

### Quick Reference: Rep Point Values

| Action | Rep Award |
|--------|----------|
| Daily visit (1-6 days) | +5 |
| Daily visit (7-13 days) | +10 |
| Daily visit (14-29 days) | +15 |
| Daily visit (30+ days) | +25 |
| Week Warrior milestone | +25 |
| Monthly Master milestone | +50 |
| Quarter Champion milestone | +150 |
| Annual Legend milestone | +500 |
| Survey completion | +50 |
| Profile completion (KYC) | +100 |
| Successful referral | +50 |

### Quick Reference: Tier Thresholds

| Tier | Min Score | Max Score |
|------|-----------|-----------|
| Bronze | 0 | 499 |
| Silver | 500 | 1999 |
| Gold | 2000 | 4999 |
| Platinum | 5000 | 9999 |
| Diamond | 10000+ | ∞ |

---

**Last Updated**: 2025-01-18  
**Version**: 1.0.0  
**Maintainer**: Looplly Development Team
