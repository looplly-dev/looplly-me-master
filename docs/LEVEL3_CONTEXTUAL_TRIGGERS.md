# Level 3 Contextual Triggers

## Technical Specification

This document defines the **trigger system** for Level 3 progressive profiling questions. Unlike Level 1 (mandatory signup) and Level 2 (pre-earning requirement), Level 3 questions appear **contextually** based on user behavior, time elapsed, survey categories, and milestones.

---

## Core Principles

1. **Context-Driven**: Questions appear when most relevant (e.g., car questions before automotive surveys)
2. **Non-Intrusive**: Max 5 questions per prompt, min 3-day gap between prompts
3. **User Control**: Users can skip prompts (with consequences for some trigger types)
4. **Data Quality**: Contextual questions get 3x higher completion rates than upfront questions
5. **No Reputation Rewards**: Level 3 completion does NOT award rep points (reserved for future enhancement)

---

## The 4 Trigger Types

### 1. Survey Category Triggers (Blocking)

**Definition**: Questions that appear **immediately before** a user can view a specific survey category.

**Behavior**: User clicks on automotive survey → Modal appears with 3-5 car ownership questions → User must answer or skip to proceed → If skipped, that specific survey becomes unavailable.

**Examples**:

| Survey Category | Triggered Questions | Enforcement |
|----------------|---------------------|-------------|
| Automotive | Car ownership, brand preference, purchase timeline | **Blocks survey access until answered or skipped** |
| Healthcare | Health insurance, fitness habits, chronic conditions | Blocks survey |
| Financial | Banking habits, credit card usage, investment experience | Blocks survey |
| Technology | Device ownership, OS preference, software usage | Blocks survey |

**Database Schema**:
```sql
{
  "trigger_type": "survey_category",
  "condition": {
    "survey_category": "automotive",
    "required_questions": ["car_ownership", "car_brand", "purchase_timeline"],
    "max_questions": 5
  },
  "enforcement": "block_survey_until_answered_or_skipped"
}
```

**SQL Pattern (Check if user has answered required questions)**:
```sql
SELECT 
  pq.id,
  pq.question_text,
  pa.answer_value IS NOT NULL AS is_answered
FROM profile_questions pq
LEFT JOIN profile_answers pa ON pq.id = pa.question_id AND pa.user_id = ?
WHERE pq.question_group = 'automotive'
  AND pq.level = 3
  AND pq.is_active = true
ORDER BY pq.display_order
LIMIT 5;
```

**UI Flow**:
```
[User clicks on Automotive Survey: "$15 - Car Buyers Research"]
       ↓
[Check: Has user answered automotive questions?]
       ↓
[NO] → [Show Modal: "Before viewing this survey, answer 3 quick questions about car ownership"]
       ↓
[User answers questions OR clicks "Skip this survey"]
       ↓
[If answered] → [Show survey details + "Start Survey" button]
[If skipped] → [Return to survey list, hide this survey for 7 days]
```

---

### 2. Time-Based Triggers (Gentle Prompts)

**Definition**: Questions that appear after a fixed time period since signup or last activity.

**Behavior**: Non-blocking. Appears as banner notification: "You've been with us for 7 days! Help us match you better by answering 5 lifestyle questions." User can dismiss and see again in 3 days.

**Examples**:

| Time Since Signup | Triggered Questions | Category |
|------------------|---------------------|----------|
| 7 days | Hobbies, media consumption, fitness habits | Lifestyle |
| 30 days | Banking habits, savings goals, credit cards | Finance |
| 60 days | Marital status, children, household size | Family |

**Database Schema**:
```sql
{
  "trigger_type": "time_based",
  "condition": {
    "days_since_signup": 7,
    "category": "lifestyle",
    "max_questions": 5
  },
  "enforcement": "banner_notification",
  "cooldown_days": 3
}
```

**SQL Pattern (Check if enough time has elapsed)**:
```sql
SELECT 
  p.user_id,
  p.created_at,
  EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 86400 AS days_since_signup
FROM profiles p
WHERE p.user_id = ?
  AND EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 86400 >= 7;
```

**UI Flow**:
```
[7 days after signup]
       ↓
[Banner appears at top of Dashboard]
"🎉 You've been with us for 7 days! Help us match you with better surveys by answering 5 lifestyle questions."
[Answer Now] [Remind Me Later]
       ↓
[If "Remind Me Later"] → [Hide for 3 days, then show again]
[If "Answer Now"] → [Redirect to Profile tab, show lifestyle questions]
```

---

### 3. Milestone Triggers (Reward-Based Prompts)

**Definition**: Questions that appear after user completes a specific number of surveys.

**Behavior**: Non-blocking. Appears as congratulatory modal: "Congrats on completing 5 surveys! Unlock higher-paying opportunities by answering 5 employment questions."

**Examples**:

| Milestone | Triggered Questions | Category | Benefit Messaging |
|-----------|---------------------|----------|-------------------|
| 5 surveys completed | Industry, job title, skills, certifications | Employment | "Unlock higher-paying surveys" |
| 10 surveys completed | Banking habits, investment experience | Finance | "Access exclusive financial surveys" |
| 20 surveys completed | Brand loyalty, shopping habits, price sensitivity | Shopping | "Get personalized product offers" |

**Database Schema**:
```sql
{
  "trigger_type": "milestone",
  "condition": {
    "surveys_completed": 5,
    "category": "employment",
    "max_questions": 5
  },
  "enforcement": "congratulatory_modal",
  "one_time_only": true
}
```

**SQL Pattern (Count completed surveys)**:
```sql
SELECT 
  COUNT(*) AS surveys_completed
FROM cint_survey_sessions
WHERE user_id = ?
  AND status = 'completed';
```

**UI Flow**:
```
[User completes 5th survey]
       ↓
[Check: Has user seen "5 surveys" milestone trigger?]
       ↓
[NO] → [Show Modal: "🎉 Congrats on completing 5 surveys! Unlock higher-paying opportunities by answering 5 employment questions."]
       ↓
[User clicks "Answer Now" OR "Skip"]
       ↓
[If "Answer Now"] → [Show employment questions inline]
[If "Skip"] → [Mark trigger as seen, don't show again]
```

---

### 4. Behavior-Based Triggers (Interest Signals)

**Definition**: Questions that appear based on user's browsing behavior (e.g., clicked on high-payout tech surveys 3+ times).

**Behavior**: Non-blocking. Appears as subtle banner: "We noticed you're interested in tech surveys. Answer 5 questions about your devices to see more opportunities."

**Examples**:

| User Behavior | Triggered Questions | Category | Signal |
|--------------|---------------------|----------|--------|
| Clicked 3+ tech surveys | Device ownership, OS preference, software usage | Technology | High interest in tech |
| Clicked 3+ automotive surveys | Car ownership, brand, purchase timeline | Automotive | Car buyer signal |
| Completed 2+ healthcare surveys | Health insurance, fitness, diet | Health | Health-conscious user |

**Database Schema**:
```sql
{
  "trigger_type": "behavior_based",
  "condition": {
    "behavior": "clicked_survey_category",
    "category": "technology",
    "threshold": 3,
    "max_questions": 5
  },
  "enforcement": "subtle_banner",
  "cooldown_days": 7
}
```

**SQL Pattern (Track user clicks on survey categories)**:
```sql
SELECT 
  survey_category,
  COUNT(*) AS click_count
FROM (
  -- This would come from a frontend tracking table
  SELECT metadata->>'category' AS survey_category
  FROM earning_activities
  WHERE user_id = ?
    AND activity_type = 'survey_clicked'
    AND created_at > NOW() - INTERVAL '30 days'
) AS clicks
GROUP BY survey_category
HAVING COUNT(*) >= 3;
```

**UI Flow**:
```
[User clicks on 3rd tech survey within 30 days]
       ↓
[Check: Has user answered tech questions?]
       ↓
[NO] → [Show Banner: "💡 We noticed you're interested in tech surveys. Answer 5 questions about your devices to see more opportunities."]
       ↓
[User clicks "Tell Us More" OR dismisses]
       ↓
[If "Tell Us More"] → [Show tech questions]
[If dismissed] → [Hide for 7 days]
```

---

## Enforcement Logic

### Survey Category Triggers (BLOCKING):
```javascript
// Frontend enforcement (React/TypeScript)
const canViewSurvey = (survey: Survey, userAnswers: ProfileAnswer[]) => {
  const requiredQuestions = getTriggerQuestions(survey.category);
  const answeredQuestions = userAnswers.filter(a => 
    requiredQuestions.some(q => q.id === a.question_id)
  );
  
  // User must answer OR explicitly skip
  return answeredQuestions.length >= requiredQuestions.length || 
         hasSkippedCategory(survey.category);
};

// If blocked, show modal
if (!canViewSurvey(survey, userAnswers)) {
  showModal({
    title: `Before viewing this ${survey.category} survey...`,
    questions: requiredQuestions,
    onAnswer: () => unlockSurvey(survey.id),
    onSkip: () => blockSurveyFor7Days(survey.id)
  });
}
```

### Time-Based, Milestone, Behavior Triggers (NON-BLOCKING):
```javascript
// These show as dismissible notifications
// No access is blocked, just gentle prompts

// Example: Time-based trigger check
const shouldShowTimeBasedTrigger = (user: User) => {
  const daysSinceSignup = daysBetween(user.created_at, new Date());
  const lastPromptedAt = getLastTriggerPrompt(user.id, 'time_based');
  const cooldownExpired = daysBetween(lastPromptedAt, new Date()) >= 3;
  
  return daysSinceSignup >= 7 && cooldownExpired;
};
```

---

## Pacing Strategy

### Rules to Prevent Fatigue:

1. **Max 5 Questions Per Prompt**
   - Never show more than 5 questions at once
   - If category has 10 questions, split into 2 prompts over 2 weeks

2. **Min 3-Day Gap Between Prompts**
   - If user completes employment questions on Monday, don't show lifestyle questions until Thursday
   - Exception: Survey category triggers (these block access, so no artificial delay)

3. **7-Day Grace Period After Skipping**
   - If user skips a prompt, don't re-show that specific prompt for 7 days
   - Can show different prompts (e.g., user skips lifestyle, can still see milestone employment prompt)

4. **Circuit Breaker (Auto-Pause)**
   - If skip rate >40% for 3 consecutive days, auto-pause ALL Level 3 prompts
   - Admin receives email alert: "High skip rate detected - L3 prompts paused"
   - Admin must manually review and re-enable via `/admin/level3-triggers`

### Pacing Implementation:
```sql
-- Track last trigger prompt
CREATE TABLE profile_trigger_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id),
  trigger_type TEXT NOT NULL, -- 'survey_category', 'time_based', etc.
  category TEXT NOT NULL, -- 'automotive', 'lifestyle', etc.
  shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  action TEXT NOT NULL, -- 'answered', 'skipped', 'dismissed'
  questions_shown JSONB NOT NULL, -- Array of question IDs
  questions_answered JSONB -- Array of question IDs answered
);

-- Check if user is eligible for next prompt
SELECT 
  EXTRACT(EPOCH FROM (NOW() - MAX(shown_at))) / 86400 AS days_since_last_prompt
FROM profile_trigger_history
WHERE user_id = ?
HAVING EXTRACT(EPOCH FROM (NOW() - MAX(shown_at))) / 86400 >= 3;
```

---

## Reward System

### Current State (No Rep Rewards):
**Level 3 completion does NOT award reputation points.** This is reserved for future enhancement.

**Why No Rep Rewards?**
- Level 3 is purely for **data enrichment**, not platform engagement
- Reputation should reward survey completion, referrals, streaks (core behaviors)
- Prevents "gaming" where users answer randomly just for rep points

### Intrinsic Rewards (What Users Get):
1. **Better Survey Matching**: More relevant surveys → higher completion rate → more earnings
2. **Higher CPM Opportunities**: Advertisers pay 30-50% more for users with detailed profiles
3. **Personalized Recommendations**: "Based on your answers, here are surveys tailored for you"
4. **Visual Badges**: "Profile Pro" badges for completing all 8 categories (cosmetic only)

### Future Enhancement (Not Implemented Yet):
- +5 rep per Level 3 category completion (8 categories × 5 rep = 40 rep total)
- "Data Guardian" badge for keeping profile fresh (answering stale questions within 7 days of decay alert)

---

## Database Schema

### Core Tables:

#### `profile_question_triggers` (New Table)
```sql
CREATE TABLE profile_question_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_type TEXT NOT NULL, -- 'survey_category', 'time_based', 'milestone', 'behavior_based'
  category TEXT NOT NULL, -- 'automotive', 'lifestyle', 'employment', etc.
  condition JSONB NOT NULL, -- Trigger-specific conditions (see examples above)
  enforcement TEXT NOT NULL, -- 'block_survey', 'banner_notification', 'congratulatory_modal', 'subtle_banner'
  max_questions INTEGER DEFAULT 5,
  cooldown_days INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Example row for survey category trigger
INSERT INTO profile_question_triggers (trigger_type, category, condition, enforcement) VALUES (
  'survey_category',
  'automotive',
  '{"survey_category": "automotive", "required_questions": ["car_ownership", "car_brand", "purchase_timeline"], "max_questions": 5}',
  'block_survey'
);
```

#### `profile_trigger_history` (Tracking User Interactions)
```sql
CREATE TABLE profile_trigger_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(user_id),
  trigger_id UUID NOT NULL REFERENCES profile_question_triggers(id),
  shown_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  action TEXT NOT NULL, -- 'answered', 'skipped', 'dismissed'
  questions_shown JSONB NOT NULL, -- ["q1_id", "q2_id", "q3_id"]
  questions_answered JSONB, -- ["q1_id", "q3_id"] (partial completion allowed)
  metadata JSONB DEFAULT '{}' -- Additional context (e.g., survey_id for category triggers)
);
```

---

## SQL Patterns

### 1. Get Active Triggers for User:
```sql
SELECT 
  pqt.id,
  pqt.trigger_type,
  pqt.category,
  pqt.condition,
  pqt.enforcement
FROM profile_question_triggers pqt
WHERE pqt.is_active = true
  AND NOT EXISTS (
    -- User hasn't seen this trigger recently
    SELECT 1 FROM profile_trigger_history pth
    WHERE pth.user_id = ?
      AND pth.trigger_id = pqt.id
      AND pth.shown_at > NOW() - INTERVAL '3 days'
  );
```

### 2. Check Survey Category Trigger:
```sql
-- Get unanswered automotive questions
SELECT 
  pq.id,
  pq.question_text,
  pq.question_type
FROM profile_questions pq
WHERE pq.question_group = 'automotive'
  AND pq.level = 3
  AND pq.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM profile_answers pa
    WHERE pa.question_id = pq.id
      AND pa.user_id = ?
  )
LIMIT 5;
```

### 3. Check Time-Based Trigger:
```sql
-- Has user been signed up for 7+ days?
SELECT 
  p.user_id,
  EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 86400 AS days_since_signup
FROM profiles p
WHERE p.user_id = ?
  AND EXTRACT(EPOCH FROM (NOW() - p.created_at)) / 86400 >= 7;
```

### 4. Check Milestone Trigger:
```sql
-- Has user completed 5+ surveys?
SELECT 
  COUNT(*) AS surveys_completed
FROM cint_survey_sessions css
WHERE css.user_id = ?
  AND css.status = 'completed'
HAVING COUNT(*) >= 5;
```

### 5. Calculate Skip Rate (Circuit Breaker):
```sql
SELECT 
  DATE(shown_at) AS day,
  COUNT(*) AS total_prompts,
  SUM(CASE WHEN action = 'skipped' THEN 1 ELSE 0 END) AS skipped_prompts,
  ROUND(SUM(CASE WHEN action = 'skipped' THEN 1 ELSE 0 END)::NUMERIC / COUNT(*) * 100, 2) AS skip_rate_pct
FROM profile_trigger_history
WHERE shown_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(shown_at)
ORDER BY day DESC;

-- Circuit breaker check
SELECT 
  COUNT(*) AS days_with_high_skip_rate
FROM (
  SELECT 
    DATE(shown_at) AS day,
    ROUND(SUM(CASE WHEN action = 'skipped' THEN 1 ELSE 0 END)::NUMERIC / COUNT(*) * 100, 2) AS skip_rate
  FROM profile_trigger_history
  WHERE shown_at > NOW() - INTERVAL '3 days'
  GROUP BY DATE(shown_at)
  HAVING ROUND(SUM(CASE WHEN action = 'skipped' THEN 1 ELSE 0 END)::NUMERIC / COUNT(*) * 100, 2) > 40
) AS high_skip_days;

-- If days_with_high_skip_rate >= 3, pause all triggers
```

---

## Admin Controls

### Admin Dashboard: `/admin/level3-triggers`

**Features**:
1. **View All Triggers**: Table showing trigger type, category, condition, active status, skip rate
2. **Test Trigger**: Select trigger → Enter test user ID → Preview modal as user would see it
3. **Pause/Resume Trigger**: Toggle switch to disable specific trigger without deleting
4. **View Analytics**: 
   - Skip rate per trigger (target: <30%)
   - Avg completion time per trigger (target: <2 min)
   - Conversion rate (% of users who answered vs skipped)
5. **Circuit Breaker Status**: Shows if auto-pause is active, with reason + date

**Emergency "Pause All L3 Prompts" Button**:
- Located at top of admin panel
- One-click disable of ALL Level 3 triggers
- Does NOT affect Level 1, Level 2, or user-initiated L3 portal browsing
- Use when: High skip rate, user complaints, system issues detected

---

## Monitoring & Alerts

### Key Metrics to Track:

| Metric | Target | Red Flag | Action |
|--------|--------|----------|--------|
| Skip rate per trigger | <30% | >40% for 3 days | Auto-pause trigger, admin review |
| Avg completion time | <2 min | >5 min | Reduce questions from 5 to 3 |
| Prompt frequency | Max 1 every 3 days | >2 per week | Check pacing logic, increase cooldown |
| Survey block rate | <10% | >20% | Review survey category triggers, make optional |

### Automated Alerts:
```sql
-- Daily cron job to check circuit breaker
SELECT 
  'Circuit Breaker Alert' AS alert_type,
  COUNT(*) AS days_with_high_skip_rate
FROM (
  SELECT DATE(shown_at) AS day
  FROM profile_trigger_history
  WHERE shown_at > NOW() - INTERVAL '3 days'
  GROUP BY DATE(shown_at)
  HAVING SUM(CASE WHEN action = 'skipped' THEN 1 ELSE 0 END)::NUMERIC / COUNT(*) > 0.4
) AS high_skip_days;

-- If count >= 3, send email to admin + auto-pause triggers
```

---

## User Feedback Loop

### Thumbs Up/Down on Relevance:
After user completes (or skips) a Level 3 prompt, show:
```
"Were these questions relevant to you?"
[👍 Yes, very relevant] [👎 Not really]
[Optional: Tell us why]
```

**Data Collection**:
```sql
ALTER TABLE profile_trigger_history ADD COLUMN feedback TEXT;
ALTER TABLE profile_trigger_history ADD COLUMN feedback_comment TEXT;

-- Track feedback
UPDATE profile_trigger_history
SET feedback = 'positive', feedback_comment = 'Very relevant!'
WHERE id = ?;
```

**Usage**:
- If >30% "thumbs down" on a specific trigger, flag for admin review
- Use comments to refine question wording or trigger conditions

---

## Rollout Strategy

(See `PHASED_ROLLOUT_CHECKLIST.md` for detailed plan)

**Week 1**: No Level 3 prompts (portal visible but triggers disabled)  
**Week 2**: Enable **one** trigger (milestone: 5 surveys completed)  
**Week 3-4**: Add time-based + survey category triggers  
**Week 5+**: Full rollout (all 4 trigger types)

---

## Related Documentation

- `LEVEL_PROFILING_STRATEGY.md`: Overview of 3-level system
- `PHASED_ROLLOUT_CHECKLIST.md`: Step-by-step launch plan
- `WARREN_ADMIN_GUIDE.md`: Non-technical guide for managing triggers
- `PROFILE_SYSTEM_ARCHITECTURE.md`: Database schema + decay logic
