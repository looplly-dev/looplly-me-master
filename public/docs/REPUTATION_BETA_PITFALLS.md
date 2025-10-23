# Reputation System Beta Pitfalls & Resolutions

## Document Purpose
This document serves as:
- **Technical reference** for avoiding common reputation system mistakes
- **Onboarding guide** for new developers working on the Rep system
- **Audit trail** for design decisions and their justifications
- **Troubleshooting checklist** for debugging Rep-related issues

---

## Critical Pitfalls (Must Fix Before Beta Launch)

### Pitfall #1: Conflicting Tier Calculation Logic

**Problem:**  
Two different tier calculation systems exist in the codebase:
1. **Database tier** (`user_reputation.tier`) - Auto-updated via score thresholds
2. **Client-side tier** (`RepTab.tsx` lines 84-91) - `getLevel()` function calculates from score

This causes:
- Users see different tiers in different UI sections
- UI shows \"Silver Apprentice\" while database says \"Bronze\"
- Admin panel and user dashboard display mismatched data

**Impact:** High - Confuses users, breaks trust, creates support tickets

**Root Cause:**  
Legacy code from initial implementation before database tier was added. The client-side function was never removed after database tier became source of truth.

**Resolution:**

**Step 1:** Remove client-side tier calculation from `RepTab.tsx`

```typescript
// ❌ REMOVE THIS (lines 84-91 in RepTab.tsx):
const getLevel = (score: number) => {
  if (score >= 2000) return 'Diamond';
  if (score >= 1000) return 'Platinum';
  if (score >= 500) return 'Gold';
  if (score >= 200) return 'Silver';
  return 'Bronze';
};

// ✅ REPLACE WITH:
const currentTier = reputation?.tier || 'Bronze';
const currentLevel = reputation?.level || 'Bronze Novice';
```

**Step 2:** Ensure database tier auto-updates

The `user_reputation` table already has tier logic, but verify it's working:
- Tier updates should happen automatically when `score` changes
- Use database trigger or application logic in `addReputationPoints()`

**Step 3:** Update all UI components to use `reputation.tier`

Files to audit:
- `src/components/dashboard/RepTab.tsx`
- `src/components/dashboard/SimplifiedEarnTab.tsx`
- `src/pages/AdminUsers.tsx`

**Verification Test:**
```typescript
// Test: Tier consistency across UI
test('tier displays consistently', async () => {
  const user = await createTestUser();
  await addReputationPoints(user.id, 300); // Should be Silver tier
  
  const repTab = await getRepTabTier(user.id);
  const earnTab = await getEarnTabTier(user.id);
  const dbTier = await getDbTier(user.id);
  
  expect(repTab).toBe('Silver');
  expect(earnTab).toBe('Silver');
  expect(dbTier).toBe('Silver');
});
```

**Status:** ⚠️ **Not Started**  
**Priority:** P0 - Critical  
**Effort:** 2 hours  
**Owner:** Unassigned

---

### Pitfall #2: Auto-Creation Race Condition

**Problem:**  
`useUserReputation.ts` (lines 52-74) creates reputation records client-side when none exist:

```typescript
if (!data) {
  const { error: insertError } = await supabase
    .from('user_reputation')
    .insert({ user_id: userId, score: 0, tier: 'Bronze' });
}
```

This causes race conditions for new users:
1. User signs up
2. Multiple components call `useUserReputation()` simultaneously
3. Each component tries to create reputation record
4. Database throws unique constraint violation OR one succeeds and others fail silently
5. Some components see reputation data, others don't

**Impact:** High - New users experience broken UI, missing Rep data

**Symptoms:**
- Error in console: `duplicate key value violates unique constraint \"user_reputation_user_id_key\"`
- RepTab shows loading spinner indefinitely
- New users have no Rep score displayed

**Resolution:**

**Step 1:** Remove auto-create logic from `useUserReputation.ts`

```typescript
// ❌ REMOVE lines 52-74 from useUserReputation.ts

// ✅ REPLACE WITH: Simple fetch, no auto-creation
const { data: reputation, isLoading } = useQuery({
  queryKey: ['user-reputation', userId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('user_reputation')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },
  enabled: !!userId,
});
```

**Step 2:** Create database trigger for auto-creation

```sql
-- Create trigger function
CREATE OR REPLACE FUNCTION handle_new_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_reputation (
    user_id, 
    score, 
    tier, 
    level,
    beta_cohort, 
    cohort_joined_at
  )
  VALUES (
    NEW.user_id, 
    0, 
    'Bronze', 
    'Bronze Novice',
    true, 
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to profiles table
CREATE TRIGGER on_profile_created_reputation
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_reputation();
```

**Step 3:** Add migration to create trigger

Use `supabase--migration` tool with the SQL above.

**Benefits:**
- ✅ No race conditions (database handles atomicity)
- ✅ Reputation created exactly once per user
- ✅ Simpler client code (no error handling for creation)
- ✅ Consistent with existing `handle_new_user_balance()` pattern

**Verification Test:**
```typescript
// Test: Reputation auto-created on signup
test('reputation created automatically on signup', async () => {
  const newUser = await signupTestUser();
  
  // Wait for trigger to fire
  await sleep(100);
  
  const { data: reputation } = await supabase
    .from('user_reputation')
    .select('*')
    .eq('user_id', newUser.id)
    .single();
  
  expect(reputation).toBeDefined();
  expect(reputation.score).toBe(0);
  expect(reputation.tier).toBe('Bronze');
  expect(reputation.beta_cohort).toBe(true);
});
```

**Status:** ⚠️ **Not Started**  
**Priority:** P0 - Critical  
**Effort:** 3 hours  
**Owner:** Unassigned

---

### Pitfall #3: Missing Beta Cohort Tracking

**Problem:**  
No mechanism exists to distinguish Beta users from Post-Beta users. When earning penalties are enabled, ALL users would be penalized, including:
- Beta users who joined when penalties didn't exist
- Users who built strategies around \"no penalties\" promise
- Early adopters who trusted the platform

This violates the principle of **not changing rules retroactively**.

**Impact:** Critical - Destroys user trust, unfair penalty application

**Example Scenario:**
1. Alice joins during Beta, earns 500 Rep through surveys (no penalties)
2. Post-Beta rollout enables survey rejection penalties (-50 Rep)
3. Alice gets rejected once → loses 50 Rep → drops from Silver to Bronze
4. Alice loses access to higher-paying jobs she relied on
5. Alice feels betrayed and churns

**Resolution:**

**Step 1:** Add cohort tracking columns to `user_reputation`

```sql
ALTER TABLE user_reputation
ADD COLUMN beta_cohort BOOLEAN DEFAULT true,
ADD COLUMN cohort_joined_at TIMESTAMPTZ DEFAULT NOW();

-- Add index for admin filtering
CREATE INDEX idx_user_reputation_beta_cohort 
ON user_reputation(beta_cohort);

-- Add index for cohort analytics
CREATE INDEX idx_user_reputation_cohort_joined 
ON user_reputation(cohort_joined_at);
```

**Step 2:** Update trigger to set `beta_cohort = true` during Beta

```sql
-- Modify handle_new_user_reputation() function
CREATE OR REPLACE FUNCTION handle_new_user_reputation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_reputation (
    user_id, 
    score, 
    tier, 
    level,
    beta_cohort,        -- Set to true during Beta phase
    cohort_joined_at
  )
  VALUES (
    NEW.user_id, 
    0, 
    'Bronze', 
    'Bronze Novice',
    true,               -- TODO: Change to false when exiting Beta
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Step 3:** Implement conditional penalty logic

```typescript
// In addReputationPoints() mutation
const applyPenalty = (user: UserReputation, points: number) => {
  // Beta users are exempt from penalties
  if (user.beta_cohort) {
    // Only apply gains, ignore penalties
    return points > 0 ? points : 0;
  }
  
  // Post-Beta users get full penalty system
  return points;
};
```

**Step 4:** Admin toggle for Beta phase exit

Add to `AdminReputationConfig.tsx`:
```typescript
const exitBetaPhase = async () => {
  // Update trigger to set beta_cohort = false for new users
  await supabase.rpc('set_beta_phase_status', { is_beta: false });
  
  // Send 30-day notice to all Beta users
  await sendPenaltyNotice();
  
  toast.success('Beta phase ended. New users will have penalties enabled.');
};
```

**Grandfathering Rules:**
- Beta users (`beta_cohort = true`) are **exempt from penalties for 60 days** after Post-Beta transition
- After 60 days, Beta users receive penalties at **50% severity** for another 30 days (gradual transition)
- After 90 days, Beta users receive full penalties

**Verification Test:**
```typescript
// Test: Beta users exempt from penalties
test('beta users do not lose rep from penalties', async () => {
  const betaUser = await createBetaUser();
  const postBetaUser = await createPostBetaUser();
  
  // Simulate survey rejection (-50 Rep penalty)
  await addReputationPoints(betaUser.id, -50);
  await addReputationPoints(postBetaUser.id, -50);
  
  const betaRep = await getReputation(betaUser.id);
  const postBetaRep = await getReputation(postBetaUser.id);
  
  expect(betaRep.score).toBe(0); // No penalty applied
  expect(postBetaRep.score).toBe(-50); // Full penalty applied
});
```

**Status:** ⚠️ **Not Started**  
**Priority:** P0 - Critical  
**Effort:** 4 hours  
**Owner:** Unassigned

---

### Pitfall #6: Incomplete Reputation History Schema

**Problem:**  
Current `ReputationHistory` interface (in `useUserReputation.ts`) only tracks:
```typescript
interface ReputationHistory {
  action: string;
  points: number;
  date: string;
}
```

This is insufficient for:
- **Admin debugging**: Can't trace which survey caused a penalty
- **User transparency**: \"You lost 50 Rep\" without explanation
- **Audit compliance**: Can't verify Rep adjustments were legitimate
- **Rep Statement UI**: Can't filter by category or show transaction details

**Impact:** High - Poor UX, admin inefficiency, audit risk

**Resolution:**

**Step 1:** Expand `ReputationHistory` interface

```typescript
// Update in src/hooks/useUserReputation.ts
export interface ReputationHistory {
  transaction_id: string;        // UUID for admin lookup
  action: string;                // e.g., \"Survey Completed\"
  points: number;                // +50 or -10
  date: string;                  // ISO 8601 timestamp
  category: 'survey' | 'streak' | 'badge' | 'profile' | 'referral' | 'admin';
  description: string;           // Human-readable explanation
  metadata?: {
    survey_id?: string;          // Link to earning_activities
    badge_id?: string;           // Link to badge_catalog
    streak_days?: number;        // Milestone info
    reason?: string;             // Admin adjustment reason
    admin_note?: string;         // Internal note (admin only)
  };
  type: 'gain' | 'loss' | 'adjustment';
}
```

**Step 2:** Update `addReputationPoints()` to use new schema

```typescript
const addReputationPoints = useMutation({
  mutationFn: async ({ 
    points, 
    action, 
    category, 
    description, 
    metadata 
  }: AddRepPointsParams) => {
    const transaction_id = crypto.randomUUID();
    
    const newHistoryEntry: ReputationHistory = {
      transaction_id,
      action,
      points,
      date: new Date().toISOString(),
      category,
      description,
      metadata,
      type: points > 0 ? 'gain' : (points < 0 ? 'loss' : 'adjustment')
    };
    
    // Append to history array
    const updatedHistory = [...(reputation.history || []), newHistoryEntry];
    
    // Update database
    await supabase
      .from('user_reputation')
      .update({ 
        score: newScore,
        history: updatedHistory 
      })
      .eq('user_id', userId);
  }
});
```

**Step 3:** Migrate existing history data

```sql
-- Add default fields to existing history entries
UPDATE user_reputation
SET history = (
  SELECT jsonb_agg(
    entry || jsonb_build_object(
      'transaction_id', gen_random_uuid()::text,
      'category', 'unknown',
      'description', entry->>'action',
      'type', CASE 
        WHEN (entry->>'points')::int > 0 THEN 'gain'
        WHEN (entry->>'points')::int < 0 THEN 'loss'
        ELSE 'adjustment'
      END
    )
  )
  FROM jsonb_array_elements(history) AS entry
)
WHERE history IS NOT NULL;
```

**Benefits:**
- ✅ Full audit trail for compliance
- ✅ Admin can search by transaction ID
- ✅ Users get clear explanations
- ✅ Rep Statement UI can filter/group by category

**Verification Test:**
```typescript
// Test: Complete history tracking
test('reputation history includes all metadata', async () => {
  const user = await createTestUser();
  
  await addReputationPoints({
    userId: user.id,
    points: 50,
    action: 'Survey Completed',
    category: 'survey',
    description: 'Completed 10-minute market research survey',
    metadata: { 
      survey_id: 'survey-123',
      duration_minutes: 12 
    }
  });
  
  const { data: reputation } = await supabase
    .from('user_reputation')
    .select('history')
    .eq('user_id', user.id)
    .single();
  
  const latestEntry = reputation.history[reputation.history.length - 1];
  
  expect(latestEntry.transaction_id).toBeDefined();
  expect(latestEntry.category).toBe('survey');
  expect(latestEntry.description).toContain('market research');
  expect(latestEntry.metadata.survey_id).toBe('survey-123');
  expect(latestEntry.type).toBe('gain');
});
```

**Status:** ⚠️ **Not Started**  
**Priority:** P1 - High  
**Effort:** 3 hours  
**Owner:** Unassigned

---

## High Priority Pitfalls (Should Fix for Good UX)

### Pitfall #4: Missing Rep Onboarding

**Problem:**  
New users are thrown into the Rep system with zero context:
- No explanation of what Rep is or why it matters
- No guided tour to earn first Rep points
- No visible connection between Rep and earning opportunities
- Users stumble upon Rep tab randomly without motivation

**Impact:** Medium - Poor adoption, confused users, support tickets

**Symptoms:**
- Users ask \"What is Rep?\" in support channels
- Low engagement with Rep-earning activities
- Users don't understand why they can't access certain jobs

**Resolution:**

**Step 1:** Create interactive onboarding component

File: `src/components/ui/rep-quickstart-tour.tsx`

```typescript
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, User, Bell, Zap, Award } from 'lucide-react';
import { useUserReputation } from '@/hooks/useUserReputation';
import { cn } from '@/lib/utils';

interface Step {
  title: string;
  description: string;
  icon: any;
  action?: 'profile_complete' | 'whatsapp_enable' | 'view_rep_tab';
  repReward?: number;
}

const steps: Step[] = [
  {
    title: \"Welcome to Reputation\",
    description: \"The more Rep you earn, the more opportunities you unlock. Let's get you started!\",
    icon: Trophy,
    action: undefined
  },
  {
    title: \"Complete Your Profile\",
    description: \"Earn +100 Rep instantly by completing your profile. This shows you're a real person.\",
    icon: User,
    action: 'profile_complete',
    repReward: 100
  },
  {
    title: \"Enable WhatsApp\",
    description: \"Quick +5 Rep boost! Communication preferences help us match you with better opportunities.\",
    icon: Bell,
    action: 'whatsapp_enable',
    repReward: 5
  },
  {
    title: \"Build Your Streak\",
    description: \"Log in daily to earn +5 Rep per day. 7-day streak? +25 Rep bonus!\",
    icon: Zap,
    action: undefined
  },
  {
    title: \"Unlock Earning Power\",
    description: \"Higher Rep = Access to exclusive, higher-paying jobs. Start earning now!\",
    icon: Award,
    action: 'view_rep_tab'
  }
];

export function RepQuickstartTour({ 
  onComplete, 
  onSkip 
}: { 
  onComplete: () => void; 
  onSkip: () => void; 
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const { reputation } = useUserReputation();
  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className=\"sm:max-w-md\">
        <DialogHeader>
          <div className=\"mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4\">
            <Icon className=\"h-6 w-6 text-primary\" />
          </div>
          <DialogTitle className=\"text-center\">{currentStepData.title}</DialogTitle>
          <DialogDescription className=\"text-center\">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        {/* Animated Rep Counter */}
        <div className=\"text-center py-6\">
          <div className=\"text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent\">
            {reputation?.score || 0}
          </div>
          <p className=\"text-sm text-muted-foreground mt-2\">Current Reputation</p>
          {currentStepData.repReward && (
            <p className=\"text-xs text-green-600 mt-1\">
              +{currentStepData.repReward} Rep when you complete this step
            </p>
          )}
        </div>

        {/* Progress Dots */}
        <div className=\"flex justify-center gap-2\">
          {steps.map((_, index) => (
            <div
              key={index}
              className={cn(
                \"h-2 w-2 rounded-full transition-all\",
                index === currentStep ? \"bg-primary w-8\" : \"bg-muted\"
              )}
            />
          ))}
        </div>

        <DialogFooter className=\"flex-row gap-2 sm:gap-0\">
          <Button variant=\"ghost\" onClick={onSkip} className=\"flex-1\">
            Skip Tour
          </Button>
          <Button onClick={handleNext} className=\"flex-1\">
            {currentStep < steps.length - 1 ? \"Next\" : \"Get Started\"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2:** Trigger tour after profile completion

In `MultiStepProfileSetup.tsx`, add:

```typescript
const [showRepTour, setShowRepTour] = useState(false);

const handleProfileComplete = async () => {
  await completeProfile(formData);
  setShowRepTour(true);
};

return (
  <>
    {/* Existing profile setup form */}
    
    {showRepTour && (
      <RepQuickstartTour
        onComplete={() => {
          setShowRepTour(false);
          navigate('/dashboard?tab=rep');
        }}
        onSkip={() => {
          setShowRepTour(false);
          navigate('/dashboard');
        }}
      />
    )}
  </>
);
```

**Status:** ⚠️ **Not Started**  
**Priority:** P1 - High  
**Effort:** 4 hours  
**Owner:** Unassigned

---

### Pitfall #5: Quality Metrics Hidden

**Problem:**  
Quality metrics are tracked silently in `user_reputation.quality_metrics` but never shown to users. This causes:
- Users don't know they're building bad habits (speeding through surveys)
- No feedback loop to improve behavior
- Confusion when penalties are suddenly enabled Post-Beta
- Users feel blindsided by penalty system

**Impact:** Medium - Poor user behavior, future penalty shock

**Resolution:**

**Step 1:** Add \"Quality Score\" card to RepTab

In `src/components/dashboard/RepTab.tsx`, add after Reputation Score card:

```typescript
<Card className=\"border-dashed border-primary/50\">
  <CardHeader>
    <CardTitle className=\"flex items-center gap-2\">
      <Target className=\"h-5 w-5\" />
      Quality Score (Beta Preview)
      <Badge variant=\"secondary\" className=\"ml-auto\">🧪 Coming Soon</Badge>
    </CardTitle>
    <CardDescription>
      These metrics don't affect your Rep yet, but will unlock bonuses in the future. Build good habits now!
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div className=\"grid grid-cols-2 gap-4\">
      <div className=\"flex flex-col\">
        <p className=\"text-3xl font-bold\">
          {reputation?.quality_metrics?.surveysCompleted || 0}
        </p>
        <p className=\"text-sm text-muted-foreground mt-1\">Surveys Completed</p>
      </div>
      
      <div className=\"flex flex-col\">
        <p className={cn(
          \"text-3xl font-bold\",
          (reputation?.quality_metrics?.surveysRejected || 0) === 0 && \"text-green-600\",
          (reputation?.quality_metrics?.surveysRejected || 0) > 0 && \"text-yellow-600\"
        )}>
          {reputation?.quality_metrics?.surveysRejected || 0}
        </p>
        <p className=\"text-sm text-muted-foreground mt-1\">Rejections</p>
      </div>
      
      <div className=\"flex flex-col\">
        <p className={cn(
          \"text-3xl font-bold\",
          (reputation?.quality_metrics?.consistencyScore || 0) >= 90 && \"text-green-600\",
          (reputation?.quality_metrics?.consistencyScore || 0) >= 70 && (reputation?.quality_metrics?.consistencyScore || 0) < 90 && \"text-yellow-600\",
          (reputation?.quality_metrics?.consistencyScore || 0) < 70 && \"text-red-600\"
        )}>
          {reputation?.quality_metrics?.consistencyScore || 0}%
        </p>
        <p className=\"text-sm text-muted-foreground mt-1\">Consistency</p>
      </div>
      
      <div className=\"flex flex-col\">
        <p className={cn(
          \"text-3xl font-bold\",
          (reputation?.quality_metrics?.speedingRate || 0) < 5 && \"text-green-600\",
          (reputation?.quality_metrics?.speedingRate || 0) >= 5 && (reputation?.quality_metrics?.speedingRate || 0) < 15 && \"text-yellow-600\",
          (reputation?.quality_metrics?.speedingRate || 0) >= 15 && \"text-red-600\"
        )}>
          {reputation?.quality_metrics?.speedingRate || 0}%
        </p>
        <p className=\"text-sm text-muted-foreground mt-1\">Speeding Rate</p>
      </div>
    </div>
    
    <div className=\"mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20\">
      <p className=\"text-sm font-medium flex items-center gap-2\">
        <Info className=\"h-4 w-4\" />
        What are quality metrics?
      </p>
      <ul className=\"text-xs text-muted-foreground mt-2 space-y-1 ml-6 list-disc\">
        <li><strong>Consistency:</strong> % of surveys completed without rejection</li>
        <li><strong>Speeding:</strong> % of surveys completed too quickly (possible random answers)</li>
        <li><strong>Future Benefit:</strong> High quality = +10 to +50 Rep bonuses per survey</li>
      </ul>
    </div>
  </CardContent>
</Card>
```

**Status:** ⚠️ **Not Started**  
**Priority:** P1 - High  
**Effort:** 2 hours  
**Owner:** Unassigned

---

### Pitfall #7: No Rep Cap for Beta

**Problem:**  
Unlimited Rep gains during Beta could lead to:
- **Hyperinflation**: Power users with 5000+ Rep dominate
- **Tier imbalance**: Everyone reaches Diamond tier, making tiers meaningless
- **Post-Beta shock**: When penalties are enabled, high-Rep users have \"too much\" Rep to lose

**Impact:** Medium - System balance issues, future recalibration needed

**Resolution:**

**Step 1:** Add soft cap column to database

```sql
ALTER TABLE user_reputation
ADD COLUMN beta_rep_cap INTEGER DEFAULT 1000;
```

**Step 2:** Implement diminishing returns formula

In `useUserReputation.ts`, update `addReputationPoints()`:

```typescript
const addReputationPoints = useMutation({
  mutationFn: async ({ points, action, category, description, metadata }) => {
    // Apply soft cap for Beta users above 500 Rep
    let actualPoints = points;
    
    if (reputation.beta_cohort && reputation.score > 500 && points > 0) {
      const softCapMultiplier = 1 - (reputation.score / reputation.beta_rep_cap);
      actualPoints = Math.round(points * Math.max(softCapMultiplier, 0.1)); // Min 10% gain
      
      console.log(`Soft cap applied: ${points} -> ${actualPoints} (${Math.round(softCapMultiplier * 100)}% efficiency)`);
    }
    
    const newScore = Math.max(0, reputation.score + actualPoints);
    
    // Rest of mutation logic...
  }
});
```

**Soft Cap Behavior:**
| Current Rep | Base Gain | Actual Gain | Efficiency |
|-------------|-----------|-------------|------------|
| 400 Rep     | +100      | +100        | 100%       |
| 600 Rep     | +100      | +80         | 80%        |
| 800 Rep     | +100      | +40         | 40%        |
| 950 Rep     | +100      | +10         | 10% (floor)|

**Status:** ⚠️ **Not Started**  
**Priority:** P2 - Medium  
**Effort:** 2 hours  
**Owner:** Unassigned

---

### Pitfall #8: Missing Admin Visibility

**Problem:**  
Admins have no way to:
- View user Rep scores in AdminUsers panel
- Manually adjust Rep (e.g., Beta tester bonuses, bug compensation)
- Monitor quality metrics across user base
- Filter users by tier or Beta cohort

This causes:
- Support inefficiency (can't debug user Rep issues)
- No way to reward Beta testers
- No visibility into system health

**Impact:** Medium - Admin inefficiency, poor support

**Resolution:**

**Step 1:** Add Rep columns to `AdminUsers.tsx`

```typescript
// Add to UserListTable columns
{
  header: \"Rep Score\",
  accessor: \"reputation.score\",
  sortable: true,
  render: (user) => (
    <div className=\"flex items-center gap-2\">
      <span className=\"font-mono\">{user.reputation?.score || 0}</span>
      <Badge variant={getTierVariant(user.reputation?.tier)}>
        {user.reputation?.tier || 'Bronze'}
      </Badge>
    </div>
  )
},
{
  header: \"Quality\",
  accessor: \"reputation.quality_metrics.consistencyScore\",
  render: (user) => {
    const score = user.reputation?.quality_metrics?.consistencyScore || 0;
    return (
      <div className={cn(
        \"text-sm font-medium\",
        score >= 90 && \"text-green-600\",
        score >= 70 && score < 90 && \"text-yellow-600\",
        score < 70 && \"text-red-600\"
      )}>
        {score}%
      </div>
    );
  }
}
```

**Status:** ⚠️ **Not Started**  
**Priority:** P2 - Medium  
**Effort:** 3 hours  
**Owner:** Unassigned

---

## Status Tracking Table

| Pitfall | Priority | Status | Owner | Target Date |
|---------|----------|--------|-------|-------------|
| #1: Conflicting Tier Calculation | P0 - Critical | ⚠️ Not Started | Unassigned | Week 1 |
| #2: Auto-Creation Race Condition | P0 - Critical | ⚠️ Not Started | Unassigned | Week 1 |
| #3: Missing Beta Cohort Tracking | P0 - Critical | ⚠️ Not Started | Unassigned | Week 1 |
| #6: Incomplete History Schema | P1 - High | ⚠️ Not Started | Unassigned | Week 1 |
| #4: Missing Rep Onboarding | P1 - High | ⚠️ Not Started | Unassigned | Week 2 |
| #5: Quality Metrics Hidden | P1 - High | ⚠️ Not Started | Unassigned | Week 2 |
| #7: No Rep Cap for Beta | P2 - Medium | ⚠️ Not Started | Unassigned | Week 2 |
| #8: Missing Admin Visibility | P2 - Medium | ⚠️ Not Started | Unassigned | Week 2 |

---

## Future Risks to Monitor

### Post-Beta Transition Risks
1. **Mass user confusion** when penalties are suddenly enabled
   - Mitigation: 30-day advance notice, gradual rollout
2. **Rep score inflation** requiring recalibration
   - Mitigation: Soft cap during Beta, tier threshold adjustments
3. **Beta user backlash** if grandfathering isn't clear
   - Mitigation: Explicit communication, visible Beta cohort badge

### Technical Debt
1. **JSONB history array** may become slow at scale (10,000+ entries)
   - Mitigation: Consider separate `reputation_transactions` table if history > 1000 entries
2. **Client-side tier display** still exists in multiple components
   - Mitigation: Create shared `<TierBadge>` component, centralize tier logic

---

## Resolution Verification Checklist

Before marking a pitfall as \"Resolved\":
- [ ] Code changes implemented and deployed
- [ ] Unit tests written and passing
- [ ] Manual testing completed
- [ ] Documentation updated
- [ ] Stakeholders notified
- [ ] Status table updated with completion date

---

## Related Documentation
- `docs/REPUTATION_BETA_STRATEGY.md` - High-level Beta strategy
- `docs/REP_CLASSIFICATION_SYSTEM.md` - Tier system design
- `docs/STREAK_REPUTATION_SYSTEM.md` - Rep source integration
- `docs/REPUTATION_FAIRNESS_VALIDATION.md` - Data-driven penalty calibration
