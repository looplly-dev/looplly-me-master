# Rep-Based Job Classification System

## Overview

This document outlines the implementation plan for a reputation-based job classification system in Looplly. The system enables progressive unlocking of earning opportunities based on user reputation scores, replacing the artificial "premium" vs "regular" survey distinction.

## Current State Analysis

### What Exists

- Mock reputation data in `src/data/mockData.ts`
- `earning_activities` table in database (lacks classification fields)
- `cint_survey_sessions` table for tracking survey participation
- User profiles with basic demographic data
- Mock Cint surveys in `src/hooks/useCintSurveys.ts`

### Problems to Solve

1. **No systematic classification**: Jobs are artificially split into "premium" vs "regular" in UI only
2. **No rep requirements**: All users see all jobs regardless of reputation
3. **No progression system**: Users can't unlock better opportunities by building reputation
4. **Provider-dependent**: Classification should be controlled by Looplly, not external providers

## Database Schema Changes

### 1. Update `earning_activities` Table

Add classification columns to the existing `earning_activities` table:

```sql
-- Add classification fields to earning_activities
ALTER TABLE public.earning_activities
ADD COLUMN tier text CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
ADD COLUMN min_rep_required integer NOT NULL DEFAULT 0,
ADD COLUMN max_rep_suggested integer,
ADD COLUMN classification_metadata jsonb DEFAULT '{}'::jsonb;

-- Add index for faster filtering
CREATE INDEX idx_earning_activities_tier ON public.earning_activities(tier);
CREATE INDEX idx_earning_activities_rep_required ON public.earning_activities(min_rep_required);

-- Add comment for documentation
COMMENT ON COLUMN public.earning_activities.tier IS 'Job tier: bronze, silver, gold, platinum, diamond';
COMMENT ON COLUMN public.earning_activities.min_rep_required IS 'Minimum reputation score needed to access this job';
COMMENT ON COLUMN public.earning_activities.max_rep_suggested IS 'Upper reputation limit for optimal matching';
COMMENT ON COLUMN public.earning_activities.classification_metadata IS 'Additional classification data: difficulty, target_audience, quality_requirements';
```

### 2. Create `user_reputation` Table

Track user reputation separate from profiles:

```sql
-- Create user reputation tracking table
CREATE TABLE public.user_reputation (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  current_score integer NOT NULL DEFAULT 0,
  lifetime_score integer NOT NULL DEFAULT 0,
  tier text NOT NULL DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  quality_score numeric(5,2) NOT NULL DEFAULT 100.0,
  level integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own reputation"
  ON public.user_reputation
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own reputation"
  ON public.user_reputation
  FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all reputation"
  ON public.user_reputation
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_user_reputation_user_id ON public.user_reputation(user_id);
CREATE INDEX idx_user_reputation_tier ON public.user_reputation(tier);

-- Trigger for auto-updating tier based on score
CREATE OR REPLACE FUNCTION public.update_reputation_tier()
RETURNS TRIGGER AS $$
BEGIN
  NEW.tier := CASE
    WHEN NEW.current_score >= 5000 THEN 'diamond'
    WHEN NEW.current_score >= 2000 THEN 'platinum'
    WHEN NEW.current_score >= 1000 THEN 'gold'
    WHEN NEW.current_score >= 500 THEN 'silver'
    ELSE 'bronze'
  END;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_reputation_tier_trigger
  BEFORE INSERT OR UPDATE ON public.user_reputation
  FOR EACH ROW
  EXECUTE FUNCTION public.update_reputation_tier();

-- Auto-create reputation record when profile is created
CREATE OR REPLACE FUNCTION public.handle_new_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_reputation (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_reputation
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_reputation();
```

## Tier System Definition

### Tier Thresholds

| Tier         | Rep Range | Icon | Description                    | Access Level                              |
| ------------ | --------- | ---- | ------------------------------ | ----------------------------------------- |
| **Bronze**   | 0-499     | 🥉   | New users, basic opportunities | Entry-level surveys, simple tasks         |
| **Silver**   | 500-999   | 🥈   | Established users              | Moderate complexity surveys, video tasks  |
| **Gold**     | 1000-1999 | 🥇   | Experienced users              | Premium surveys, focus groups             |
| **Platinum** | 2000-4999 | 💎   | High performers                | Exclusive opportunities, high-paying jobs |
| **Diamond**  | 5000+     | 💠   | Elite users                    | Highest-tier jobs, VIP opportunities      |

### Tier Benefits

Each tier unlocks:

- **Higher-paying jobs**: Better rewards for higher tiers
- **Exclusive opportunities**: Some jobs only available to certain tiers
- **Priority matching**: Higher-tier users get preference in survey matching
- **Better completion rates**: Tier-appropriate jobs match user skill level

## Classification Logic Rules

### Job Assignment Rules

**For Cint API Surveys** (when API is connected):

```typescript
// Classification based on qualification_score
if (qualification_score >= 90) {
  tier = reward_amount > 5 ? 'silver' : 'bronze';
  min_rep_required = tier === 'silver' ? 200 : 0;
}
else if (qualification_score >= 75) {
  tier = reward_amount > 10 ? 'gold' : 'silver';
  min_rep_required = tier === 'gold' ? 500 : 200;
}
else if (qualification_score >= 60) {
  tier = reward_amount > 15 ? 'platinum' : 'gold';
  min_rep_required = tier === 'platinum' ? 1000 : 500;
}
else {
  tier = 'diamond';
  min_rep_required = 2000;
}

// Adjust based on difficulty metadata
if (metadata.difficulty_level === 'hard') {
  min_rep_required += 500;
}
```

**For Other Job Types**:

| Activity Type   | Default Tier  | Min Rep   | Reasoning                 |
| --------------- | ------------- | --------- | ------------------------- |
| Video watching  | Bronze        | 0         | Low barrier, passive      |
| App downloads   | Bronze-Silver | 0-200     | Simple completion         |
| Micro tasks     | Silver-Gold   | 200-500   | Varies by complexity      |
| Data sharing    | All tiers     | 0         | Passive income            |
| Focus groups    | Gold-Diamond  | 1000-2000 | Exclusive, high-paying    |
| Product testing | Gold-Platinum | 1000-1500 | Requires quality feedback |

### Matching Algorithm

```typescript
// User sees jobs where:
// 1. user_rep >= min_rep_required (REQUIRED)
// 2. user_rep <= max_rep_suggested (OPTIMAL) OR max_rep_suggested is null
// 3. Sorted by: Match score + Tier proximity

function getVisibleJobs(userRep: number, allJobs: Job[]): Job[] {
  return allJobs
    .filter(job => userRep >= job.min_rep_required)
    .sort((a, b) => {
      // Primary: Match/qualification score
      const scoreSort = b.qualification_score - a.qualification_score;
      if (scoreSort !== 0) return scoreSort;

      // Secondary: Tier proximity (jobs at user's tier first)
      const aTierDiff = Math.abs(getTierValue(a.tier) - getTierValue(userTier));
      const bTierDiff = Math.abs(getTierValue(b.tier) - getTierValue(userTier));
      return aTierDiff - bTierDiff;
    });
}

// Show locked jobs (1-2 tiers above) as motivation
function getLockedJobs(userRep: number, userTier: string, allJobs: Job[]): Job[] {
  const nextTierValue = getTierValue(userTier) + 1;
  const nextNextTierValue = getTierValue(userTier) + 2;

  return allJobs
    .filter(job =>
      userRep < job.min_rep_required &&
      (getTierValue(job.tier) === nextTierValue ||
       getTierValue(job.tier) === nextNextTierValue)
    )
    .slice(0, 3); // Show max 3 locked jobs as preview
}
```

## Code Changes Required

### 1. Update Type Definitions

**File: `src/types/cint.ts`**

```typescript
export interface CintSurvey {
  id: string;
  title: string;
  description: string;
  reward_amount: number;
  time_estimate: number;
  category: string;
  provider: 'cint';
  qualification_score: number;
  completion_rate: number;
  status: 'available' | 'qualification_required' | 'full';

  // ADD THESE FIELDS:
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  min_rep_required: number;
  max_rep_suggested?: number;

  metadata: {
    target_audience?: string;
    difficulty_level?: 'easy' | 'medium' | 'hard';
    survey_type?: 'consumer' | 'b2b' | 'medical' | 'political';
  };
}
```

**File: `src/hooks/useEarningActivities.ts`**

```typescript
export interface EarningActivity {
  id: string;
  activity_type: 'survey' | 'video' | 'task' | 'app_download' | 'game_play';
  title: string;
  description?: string;
  reward_amount: number;
  time_estimate?: number;
  status: 'available' | 'in_progress' | 'completed' | 'expired';
  external_id?: string;
  provider?: string;
  metadata: any;
  completed_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;

  // ADD THESE FIELDS:
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  min_rep_required?: number;
  max_rep_suggested?: number;
  classification_metadata?: {
    difficulty?: 'easy' | 'medium' | 'hard';
    target_audience?: string;
    quality_requirements?: string;
  };
}
```

### 2. Create Reputation Hook

**New File: `src/hooks/useReputation.ts`**

```typescript
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface UserReputation {
  id: string;
  user_id: string;
  current_score: number;
  lifetime_score: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  quality_score: number;
  level: number;
  created_at: string;
  updated_at: string;
}

export const useReputation = () => {
  const [reputation, setReputation] = useState<UserReputation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();

  const fetchReputation = async () => {
    if (!authState.user?.id) {
      setReputation(null);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_reputation')
        .select('*')
        .eq('user_id', authState.user.id)
        .single();

      if (error) {
        console.error('Error fetching reputation:', error);
        setReputation(null);
      } else {
        setReputation(data as UserReputation);
      }
    } catch (error) {
      console.error('Error fetching reputation:', error);
      setReputation(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReputation();
  }, [authState.user?.id]);

  return {
    reputation,
    isLoading,
    refetch: fetchReputation
  };
};
```

### 3. Update SimplifiedEarnTab UI

**File: `src/components/dashboard/SimplifiedEarnTab.tsx`**

Major changes needed:

1. Remove separate "Cint Premium Surveys" section (lines 410-459)
2. Merge all jobs into unified display
3. Add tier badges and rep requirement displays
4. Add locked job preview section
5. Add tier filter dropdown

Key UI elements:

```tsx
// Tier badge component
<Badge variant={getTierVariant(job.tier)}>
  {getTierIcon(job.tier)} {job.tier}
</Badge>

// Rep requirement display
{job.min_rep_required > 0 && (
  <div className="text-sm text-muted-foreground">
    Requires {job.min_rep_required} rep
  </div>
)}

// Locked job display
<div className="opacity-60 relative">
  <Lock className="absolute top-2 right-2 h-4 w-4" />
  <div className="text-sm font-medium text-destructive">
    Unlock at {job.min_rep_required} rep
  </div>
</div>
```

## UI/UX Specifications

### Tier Badges

**Visual Design**:

- Bronze: Copper/brown color scheme
- Silver: Gray/silver metallic
- Gold: Yellow/gold shine
- Platinum: Blue-white diamond look
- Diamond: Cyan/blue crystal appearance

**Component Structure**:

```tsx
<Badge className={cn(
  "font-semibold",
  tier === 'bronze' && "bg-orange-100 text-orange-700 border-orange-300",
  tier === 'silver' && "bg-gray-100 text-gray-700 border-gray-300",
  tier === 'gold' && "bg-yellow-100 text-yellow-700 border-yellow-300",
  tier === 'platinum' && "bg-blue-100 text-blue-700 border-blue-300",
  tier === 'diamond' && "bg-cyan-100 text-cyan-700 border-cyan-300"
)}>
  {getTierIcon(tier)} {tier.toUpperCase()}
</Badge>
```

### Job Card Layout

```
┌─────────────────────────────────────────┐
│ 📄 [Job Title]              🥇 GOLD     │
│ [Description]                           │
│ ⭐ Match: 85%  ⏱️ 10 min  💰 $5.00     │
│ Requires 500 rep                        │
└─────────────────────────────────────────┘
```

### Locked Job Preview

```
┌─────────────────────────────────────────┐
│ 🔒 [Job Title]              💎 PLATINUM │
│ [Blurred description]                   │
│ Unlock at 2000 rep (You have 1500)     │
│ [Progress bar showing 75% complete]     │
└─────────────────────────────────────────┘
```

## Migration Strategy

### Phase 1: Database Setup (Week 1)

- [ ] Run migration to add classification columns to `earning_activities`
- [ ] Create `user_reputation` table
- [ ] Create trigger functions for auto-tier assignment
- [ ] Backfill existing users with default reputation (0 rep, bronze tier)

### Phase 2: Data Classification (Week 1-2)

- [ ] Create admin function to bulk-classify existing jobs
- [ ] Manually review and adjust tier assignments for all existing jobs
- [ ] Set appropriate `min_rep_required` values based on job complexity
- [ ] Update mock data with classification fields

### Phase 3: Backend Logic (Week 2)

- [ ] Create `useReputation()` hook
- [ ] Update `useEarningActivities()` to include classification filtering
- [ ] Add reputation calculation logic (earned from completed jobs)
- [ ] Create API for fetching filtered jobs based on user rep

### Phase 4: UI Implementation (Week 3)

- [ ] Remove fake "premium" vs "regular" split
- [ ] Add tier badges to all job cards
- [ ] Implement locked job preview section
- [ ] Add tier filter dropdown
- [ ] Update job card styling with rep requirements

### Phase 5: Testing & Refinement (Week 3-4)

- [ ] Test job visibility for users at different rep levels
- [ ] Verify tier progression works correctly
- [ ] User acceptance testing
- [ ] Adjust tier thresholds based on feedback

### Phase 6: Cint API Integration (Future)

- [ ] Connect to actual Cint API
- [ ] Implement automatic classification for incoming surveys
- [ ] Set up webhook for real-time survey updates
- [ ] Monitor classification accuracy

## Admin Controls

### Admin Panel Features

**Location**: Create new section in `src/pages/AdminEarningClassification.tsx`

**Features**:

1. **Job Classification Manager**
   - View all jobs with current tier/rep requirements
   - Bulk edit classifications
   - Filter by tier, provider, status
   - Search by job title

2. **Tier Distribution Dashboard**
   - Chart showing % of jobs in each tier
   - Rep requirement histogram
   - Average reward by tier

3. **User Progression Analytics**
   - Users by tier distribution
   - Average time to tier-up
   - Completion rates by tier

4. **Manual Override Tools**
   - Force-assign tier to specific job
   - Adjust rep requirements
   - Add/remove jobs from visibility

5. **Classification Rules Engine**
   - Configure automatic classification rules
   - Set thresholds for tier assignment
   - Test rules against existing data

## Testing Checklist

### Unit Tests

- [ ] Test tier assignment based on rep score
- [ ] Test job filtering logic
- [ ] Test reputation calculation
- [ ] Test tier progression trigger

### Integration Tests

- [ ] Test new user reputation creation
- [ ] Test job visibility for different rep levels
- [ ] Test reputation updates after job completion
- [ ] Test locked job preview generation

### E2E Tests

- [ ] Bronze user sees only bronze/silver jobs
- [ ] Completing jobs increases reputation
- [ ] Tier-up unlocks new jobs
- [ ] Locked jobs show correct unlock requirements
- [ ] Admin can modify job classifications

## Success Metrics

### Key Performance Indicators

1. **User Engagement**
   - % of users who tier-up within first month
   - Average jobs completed per tier
   - Retention rate by tier

2. **Job Completion**
   - Completion rate by tier (should increase with tier-appropriate matching)
   - Average time to complete by tier
   - Quality score by tier

3. **Revenue Impact**
   - Revenue per user by tier
   - Tier distribution over time
   - Average job value by tier

4. **System Health**
   - Job distribution across tiers (should be balanced)
   - User progression rate (not too slow/fast)
   - Classification accuracy (manual reviews needed)

## Future Enhancements

### V2 Features

- **Dynamic tier thresholds**: Adjust based on user base size
- **Specialty tiers**: Medical surveys tier, B2B tier, etc.
- **Seasonal tiers**: Holiday bonus tiers
- **Team/group tiers**: Shared reputation for teams

### V3 Features

- **Machine learning classification**: Auto-assign tiers based on completion patterns
- **Personalized matching**: Beyond tier, match based on user interests
- **Reputation decay**: Inactive users gradually lose rep
- **Reputation insurance**: Protect against unfair quality score drops

## Rollback Plan

If issues arise during rollout:

1. **Immediate Rollback** (if critical bug):
   - Revert UI changes to show all jobs to all users
   - Keep database changes (they're additive, not breaking)
   - Fix bug in development environment
2. **Partial Rollback** (if tier distribution is wrong):
   - Temporarily set all `min_rep_required` to 0
   - Recalculate tier assignments
   - Gradually re-enable tier restrictions

3. **Data Preservation**:
   - All new columns are nullable or have defaults
   - No data loss from rollback
   - Reputation scores persist for future re-launch

## Questions & Decisions Needed

- [ ] What should happen to users with negative quality scores?
- [ ] Should admins be able to manually award bonus rep?
- [ ] Should there be a rep decay for inactive users?
- [ ] Should locked jobs show blurred or full details?
- [ ] Should there be a "rep history" view for users?
- [ ] What's the appeals process if a user disputes their tier?

## Resources & References

- Current mock data: `src/data/mockData.ts`
- Cint survey types: `src/types/cint.ts`
- Current earn tab: `src/components/dashboard/SimplifiedEarnTab.tsx`
- Database schema: `supabase/migrations/`
- Auth/profile system: `src/components/auth/`

---

**Document Version**: 1.0  
**Created**: 2025-01-XX  
**Last Updated**: 2025-01-XX  
**Owner**: Looplly Product Team - Nadia Gaspari
**Status**: Planning Phase
