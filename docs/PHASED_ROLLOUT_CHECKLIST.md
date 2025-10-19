# Phased Rollout Checklist

## Executive Summary

This document outlines the **step-by-step launch plan** for the 3-level progressive profiling system. The phased approach prevents overwhelming users and allows for iterative refinement based on real-world data.

**Key Principle**: Start simple (Level 1 + Level 2 only), monitor metrics, then gradually introduce Level 3 contextual prompts.

---

## Rollout Timeline

| Phase | Duration | Users | Features | Success Metrics |
|-------|----------|-------|----------|-----------------|
| **Pre-Launch (Week 0)** | Setup | Internal testing | Database seeding, admin tools | All tables populated, zero errors |
| **Week 1: Soft Launch** | 7 days | 100 users | Level 1 + Level 2 only | L1: >90%, L2: >80% completion |
| **Week 2: First L3 Trigger** | 7 days | 200 users | Milestone trigger (5 surveys) | <30% skip rate |
| **Week 3-4: Expand Triggers** | 14 days | 500 users | Time + Survey category triggers | <25% skip rate |
| **Week 5+: Full Rollout** | Ongoing | All users | All 4 trigger types | <20% skip rate, 60% L3 completion |

---

## Pre-Launch (Week 0): Development & Staging Setup

### Objective:
Prepare database, seed initial data, test flows with fake users before exposing to real users.

---

### ✅ Task 1: Seed Level 1 Questions (5 Questions)

**Location**: `profile_questions` table, `level = 1`

**Questions to Seed**:
1. **First Name** (text)
   - `question_key`: `first_name`
   - `question_type`: `text`
   - `is_required`: `true`
   - `is_immutable`: `false`
   - `validation_rules`: `{"min_length": 2, "max_length": 50}`

2. **Last Name** (text)
   - `question_key`: `last_name`
   - `question_type`: `text`
   - `is_required`: `true`
   - `is_immutable`: `false`

3. **Mobile** (phone)
   - `question_key`: `mobile`
   - `question_type`: `phone`
   - `is_required`: `true`
   - `is_immutable`: `false`
   - `validation_rules`: `{"format": "E.164"}`

4. **Email** (email)
   - `question_key`: `email`
   - `question_type`: `email`
   - `is_required`: `true`
   - `is_immutable`: `false`

5. **Address** (address autocomplete)
   - `question_key`: `address`
   - `question_type`: `address_autocomplete`
   - `is_required`: `true`
   - `is_immutable`: `true` (critical for fraud prevention)
   - `help_text`: "We use this for location-based surveys and fraud prevention"

**SQL**:
```sql
INSERT INTO profile_questions (category_id, level, question_key, question_text, question_type, is_required, is_immutable, display_order)
SELECT 
  (SELECT id FROM profile_categories WHERE name = 'basic_info'),
  1,
  unnest(ARRAY['first_name', 'last_name', 'mobile', 'email', 'address']),
  unnest(ARRAY['First Name', 'Last Name', 'Mobile Number', 'Email Address', 'Home Address']),
  unnest(ARRAY['text', 'text', 'phone', 'email', 'address_autocomplete']),
  true,
  unnest(ARRAY[false, false, false, false, true]), -- Only address is immutable
  unnest(ARRAY[1, 2, 3, 4, 5]);
```

**Verification**:
```sql
SELECT question_key, question_text, is_required, is_immutable 
FROM profile_questions 
WHERE level = 1 
ORDER BY display_order;

-- Expected: 5 rows
```

---

### ✅ Task 2: Seed Level 2 Questions (10-15 per Country)

**Location**: `profile_questions` table, `level = 2`

**Questions to Seed (Nigeria Example)**:
1. **Gender** (single-select)
   - Options: Male, Female, Non-binary, Prefer not to say
   - `decay_config_key`: `immutable` (never expires)

2. **Date of Birth** (date)
   - Validation: Must be 18+
   - `decay_config_key`: `immutable`

3. **Household Income** (single-select, NGN)
   - Options: ₦0-100k, ₦100k-250k, ₦250k-500k, ₦500k-1M, ₦1M+
   - `decay_config_key`: `occasional` (180 days)

4. **Socioeconomic Status (SEM)** (single-select, Nigeria)
   - Options: Upper Class, Middle Class, Lower-Middle Class, Lower Class
   - `decay_config_key`: `occasional` (180 days)

**SQL**:
```sql
-- Gender question
INSERT INTO profile_questions (category_id, level, question_key, question_text, question_type, options, is_required, decay_config_key, display_order)
VALUES (
  (SELECT id FROM profile_categories WHERE name = 'demographics'),
  2,
  'gender',
  'What is your gender?',
  'single_select',
  '["Male", "Female", "Non-binary", "Prefer not to say"]'::jsonb,
  true,
  'immutable',
  1
);

-- Income question (Nigeria)
INSERT INTO profile_questions (category_id, level, question_key, question_text, question_type, is_required, decay_config_key, country_codes, display_order)
VALUES (
  (SELECT id FROM profile_categories WHERE name = 'demographics'),
  2,
  'household_income',
  'What is your household income?',
  'single_select',
  true,
  'occasional',
  ARRAY['NG'],
  3
);

-- Add country-specific income options
INSERT INTO country_question_options (question_id, country_code, options, is_global)
VALUES (
  (SELECT id FROM profile_questions WHERE question_key = 'household_income'),
  'NG',
  '[
    {"value": "0_100k", "label": "₦0 - ₦100,000/month"},
    {"value": "100k_250k", "label": "₦100,000 - ₦250,000/month"},
    {"value": "250k_500k", "label": "₦250,000 - ₦500,000/month"},
    {"value": "500k_1m", "label": "₦500,000 - ₦1,000,000/month"},
    {"value": "1m_plus", "label": "₦1,000,000+/month"}
  ]'::jsonb,
  false
);
```

**Repeat for Other Countries**:
- South Africa (ZAR income ranges)
- Kenya (KES income ranges)
- India (INR income ranges)

**Verification**:
```sql
SELECT question_key, question_text, country_codes 
FROM profile_questions 
WHERE level = 2 
ORDER BY display_order;

-- Expected: 10-15 rows per country
```

---

### ✅ Task 3: Seed Profile Decay Config

**Location**: `profile_decay_config` table

**Decay Intervals**:

| Config Key | Interval Type | Interval Days | Description |
|------------|---------------|---------------|-------------|
| `immutable` | Immutable | NULL | Never expires (DOB, gender, address) |
| `rare` | Rare | 365 | Annually (lifestyle, hobbies) |
| `occasional` | Occasional | 180 | Biannually (income, job title) |
| `frequent` | Frequent | 90 | Quarterly (brands, shopping habits) |

**SQL**:
```sql
INSERT INTO profile_decay_config (config_key, interval_type, interval_days, description, is_active)
VALUES 
  ('immutable', 'immutable', NULL, 'Never expires (DOB, gender, address)', true),
  ('rare', 'rare', 365, 'Annually (lifestyle, hobbies)', true),
  ('occasional', 'occasional', 180, 'Biannually (income, job title)', true),
  ('frequent', 'frequent', 90, 'Quarterly (brands, shopping habits)', true);
```

**Verification**:
```sql
SELECT config_key, interval_type, interval_days 
FROM profile_decay_config 
WHERE is_active = true
ORDER BY interval_days NULLS FIRST;

-- Expected: 4 rows
```

---

### ✅ Task 4: Create Level 3 Categories (8 Categories)

**Location**: `profile_categories` table, `level = 3`

**Categories**:
1. Employment
2. Lifestyle
3. Automotive
4. Technology
5. Health
6. Finance
7. Shopping
8. Family

**SQL**:
```sql
INSERT INTO profile_categories (level, name, display_name, description, icon, display_order, default_decay_config_key)
VALUES 
  (3, 'employment', 'Employment', 'Work, industry, skills', 'briefcase', 1, 'occasional'),
  (3, 'lifestyle', 'Lifestyle', 'Hobbies, interests, media', 'smile', 2, 'rare'),
  (3, 'automotive', 'Automotive', 'Car ownership, preferences', 'car', 3, 'frequent'),
  (3, 'technology', 'Technology', 'Devices, software, usage', 'cpu', 4, 'frequent'),
  (3, 'health', 'Health', 'Fitness, insurance, diet', 'heart', 5, 'occasional'),
  (3, 'finance', 'Finance', 'Banking, investments, savings', 'dollar-sign', 6, 'occasional'),
  (3, 'shopping', 'Shopping', 'Brands, habits, loyalty', 'shopping-cart', 7, 'frequent'),
  (3, 'family', 'Family', 'Marital status, children, pets', 'users', 8, 'rare');
```

**Verification**:
```sql
SELECT display_name, default_decay_config_key 
FROM profile_categories 
WHERE level = 3 
ORDER BY display_order;

-- Expected: 8 rows
```

---

### ✅ Task 5: Seed Initial Level 3 Questions (20-30 Questions)

**Example: Employment Category (5 questions)**:

1. **Employment Status** (single-select)
   - Options: Employed full-time, Employed part-time, Self-employed, Unemployed, Student, Retired
   - `question_group`: `employment`

2. **Industry** (single-select)
   - Options: Technology, Finance, Healthcare, Education, Retail, Manufacturing, Other
   - `question_group`: `employment`

3. **Job Title** (text)
   - `question_group`: `employment`

4. **Workplace Size** (single-select)
   - Options: 1-10, 11-50, 51-200, 201-500, 500+
   - `question_group`: `employment`

5. **Skills** (multi-select)
   - Options: Project Management, Data Analysis, Sales, Marketing, Engineering, Design, Other
   - `question_group`: `employment`

**SQL Example (Employment Status)**:
```sql
INSERT INTO profile_questions (category_id, level, question_key, question_text, question_type, question_group, options, display_order, decay_config_key)
VALUES (
  (SELECT id FROM profile_categories WHERE name = 'employment'),
  3,
  'employment_status',
  'What is your current employment status?',
  'single_select',
  'employment',
  '["Employed full-time", "Employed part-time", "Self-employed", "Unemployed", "Student", "Retired"]'::jsonb,
  1,
  'occasional'
);
```

**Repeat for All 8 Categories** (3-5 questions per category = 24-40 questions total)

**Verification**:
```sql
SELECT category_id, COUNT(*) 
FROM profile_questions 
WHERE level = 3 
GROUP BY category_id;

-- Expected: 8 rows (one per category) with 3-5 questions each
```

---

### ✅ Task 6: Test Address Autocomplete (Google Places API)

**Prerequisites**:
- Google Places API key configured in Supabase secrets
- Address autocomplete component (`src/components/ui/address-autocomplete.tsx`)

**Test Steps**:
1. Create fake user on staging
2. Navigate to signup flow
3. Type "123 Main Street, Lagos, Nigeria" in address field
4. Verify dropdown shows suggestions
5. Select address from dropdown
6. Verify address components are stored in `address_components` table:
   - `formatted_address`
   - `locality` (Lagos)
   - `administrative_area_level_1` (Lagos State)
   - `country` (Nigeria)
   - `latitude`, `longitude`

**Verification SQL**:
```sql
SELECT formatted_address, locality, country, latitude, longitude
FROM address_components
WHERE user_id = ?;

-- Expected: 1 row with all fields populated
```

---

### ✅ Task 7: Test Level 2 Completion Modal

**Test Steps**:
1. Create fake user on staging (with Level 1 complete, Level 2 incomplete)
2. Log in as user
3. Verify alert banner appears: "Complete Your Profile to Start Earning"
4. Verify pulsing badge on "Profile" tab
5. Navigate to "Earn" tab
6. Verify progress bar blocks access: "2/3 Levels Complete - Finish Level 2 to unlock earning"
7. Click "Complete Profile"
8. Answer all Level 2 questions
9. Verify "Earn" tab unlocks
10. Verify alert banner disappears

**Verification**:
```sql
SELECT profile_level, profile_complete
FROM profiles
WHERE user_id = ?;

-- Expected: profile_level = 2, profile_complete = true (after answering all L2 questions)
```

---

## Week 1: Soft Launch (Level 1 + Level 2 Only)

### Objective:
Launch to 100 early adopters with **only Level 1 and Level 2** enabled. No Level 3 contextual prompts yet.

---

### ✅ Configuration:

**Enable**:
- Level 1 signup flow (5 questions including address)
- Level 2 pre-earning modal (gender, DOB, income, SEC/SEM)
- Visual indicators (alert banner, pulsing badge, progress bar)

**Disable**:
- All Level 3 contextual triggers (no prompts)
- Level 3 portal remains visible (users can browse and answer voluntarily)

**How to Disable L3 Triggers**:
```sql
UPDATE profile_question_triggers
SET is_active = false;

-- Verify all triggers are disabled
SELECT * FROM profile_question_triggers WHERE is_active = true;
-- Expected: 0 rows
```

---

### 📊 Metrics to Monitor (Week 1):

| Metric | Target | Red Flag | Action |
|--------|--------|----------|--------|
| **Level 1 Completion Rate** | >90% | <80% | Simplify questions, reduce fields |
| **Level 2 Completion Rate** | >80% | <70% | Review question wording, add help text |
| **Time to Complete L1+L2** | <5 min | >10 min | Reduce questions, improve UX |
| **Skip Rate per Question** | <20% | >30% | Identify problematic questions, rephrase |
| **Address Autocomplete Errors** | <5% | >10% | Check API quota, improve error handling |
| **User Complaints** | <5% | >10% | Review feedback, adjust messaging |

---

### 🔍 Daily Checks (Week 1):

**SQL Queries for Warren**:

1. **Level 2 Completion Rate**:
```sql
SELECT 
  COUNT(CASE WHEN profile_level >= 2 THEN 1 END)::NUMERIC / COUNT(*) * 100 AS l2_completion_pct
FROM profiles
WHERE created_at > '2025-10-19'; -- Week 1 start date

-- Target: >80%
```

2. **Average Time to Complete L1+L2**:
```sql
SELECT 
  AVG(EXTRACT(EPOCH FROM (last_profile_update - created_at)) / 60) AS avg_time_minutes
FROM profiles
WHERE profile_level >= 2
  AND created_at > '2025-10-19';

-- Target: <5 minutes
```

3. **Skip Rate per Question**:
```sql
SELECT 
  pq.question_text,
  COUNT(CASE WHEN pa.answer_value = 'prefer_not_to_say' THEN 1 END)::NUMERIC / COUNT(*) * 100 AS skip_rate_pct
FROM profile_questions pq
LEFT JOIN profile_answers pa ON pq.id = pa.question_id
WHERE pq.level = 2
GROUP BY pq.question_text
ORDER BY skip_rate_pct DESC;

-- Flag questions with >30% skip rate
```

---

### ⚠️ Red Flags & Actions (Week 1):

**Red Flag 1**: Level 2 completion rate <70%
- **Action**: Review question wording, add contextual help text, consider removing non-essential questions

**Red Flag 2**: Time to complete >10 minutes
- **Action**: Reduce questions from 15 to 10, simplify UI, add progress indicator

**Red Flag 3**: Address autocomplete errors >10%
- **Action**: Check Google Places API quota, improve error messaging, add manual fallback

**Red Flag 4**: High skip rate on income question (>30%)
- **Action**: Add "This helps us match you with relevant surveys" help text, consider broader income brackets

---

## Week 2: Introduce First Level 3 Trigger

### Objective:
Enable **one Level 3 trigger** (milestone: 5 surveys completed) to test user response to contextual prompts.

---

### ✅ Configuration:

**Enable**:
- Milestone trigger: "After 5 completed surveys"
- Category: Employment
- Max 3 questions

**SQL**:
```sql
-- Create milestone trigger
INSERT INTO profile_question_triggers (trigger_type, category, condition, enforcement, max_questions, is_active)
VALUES (
  'milestone',
  'employment',
  '{"surveys_completed": 5, "max_questions": 3}'::jsonb,
  'congratulatory_modal',
  3,
  true
);

-- Verify trigger is active
SELECT * FROM profile_question_triggers WHERE is_active = true;
-- Expected: 1 row
```

---

### 📊 Metrics to Monitor (Week 2):

| Metric | Target | Red Flag | Action |
|--------|--------|----------|--------|
| **Skip Rate (L3 Prompt)** | <30% | >40% | Review question relevance, reduce to 2 questions |
| **Avg Completion Time** | <2 min | >5 min | Simplify questions, improve UI |
| **User Feedback (Thumbs Up/Down)** | >70% positive | <50% positive | Review feedback comments, adjust trigger |

---

### 🔍 Daily Checks (Week 2):

**SQL Queries**:

1. **Skip Rate for Milestone Trigger**:
```sql
SELECT 
  COUNT(CASE WHEN action = 'skipped' THEN 1 END)::NUMERIC / COUNT(*) * 100 AS skip_rate_pct
FROM profile_trigger_history
WHERE trigger_id = (SELECT id FROM profile_question_triggers WHERE trigger_type = 'milestone' AND category = 'employment')
  AND shown_at > '2025-10-26'; -- Week 2 start date

-- Target: <30%
```

2. **User Feedback**:
```sql
SELECT 
  feedback,
  COUNT(*) AS count
FROM profile_trigger_history
WHERE trigger_id = (SELECT id FROM profile_question_triggers WHERE trigger_type = 'milestone')
  AND feedback IS NOT NULL
GROUP BY feedback;

-- Expected: >70% 'positive'
```

---

### ⚠️ Actions Based on Metrics (Week 2):

**If skip rate >40%**:
- Reduce questions from 3 to 2
- Change timing (maybe 10 surveys instead of 5)
- Add benefit messaging: "Unlock higher-paying surveys"

**If completion time >5 min**:
- Simplify question wording
- Remove multi-select questions (too time-consuming)

---

## Week 3-4: Expand Triggers

### Objective:
Add 2 more triggers (time-based + survey category) to test multiple trigger types.

---

### ✅ Configuration (Week 3):

**Enable**:
- Time-based trigger: "7 days after signup" → Lifestyle questions (max 5)
- Survey category trigger: "Before automotive survey" → Car questions (max 3)

**SQL**:
```sql
-- Time-based trigger
INSERT INTO profile_question_triggers (trigger_type, category, condition, enforcement, max_questions, cooldown_days, is_active)
VALUES (
  'time_based',
  'lifestyle',
  '{"days_since_signup": 7, "max_questions": 5}'::jsonb,
  'banner_notification',
  5,
  3,
  true
);

-- Survey category trigger (BLOCKING)
INSERT INTO profile_question_triggers (trigger_type, category, condition, enforcement, max_questions, is_active)
VALUES (
  'survey_category',
  'automotive',
  '{"survey_category": "automotive", "required_questions": ["car_ownership", "car_brand", "purchase_timeline"], "max_questions": 3}'::jsonb,
  'block_survey',
  3,
  true
);
```

---

### 📊 Metrics to Monitor (Week 3-4):

| Metric | Target | Red Flag |
|--------|--------|----------|
| **Skip Rate (Time-Based)** | <25% | >35% |
| **Skip Rate (Survey Category)** | <20% | >30% |
| **Survey Block Rate** | <10% | >20% (users blocked from surveys due to skipping) |

---

### 🔍 Daily Checks (Week 3-4):

**Survey Block Rate**:
```sql
SELECT 
  COUNT(CASE WHEN action = 'skipped' AND metadata->>'survey_id' IS NOT NULL THEN 1 END)::NUMERIC / COUNT(*) * 100 AS block_rate_pct
FROM profile_trigger_history
WHERE trigger_type = 'survey_category'
  AND shown_at > '2025-11-02'; -- Week 3 start date

-- Target: <10% (most users should answer, not skip)
```

---

### ⚠️ Actions Based on Metrics (Week 3-4):

**If survey block rate >20%**:
- Make survey category triggers optional (don't block access)
- Or reduce questions from 3 to 2

---

## Week 5+: Full Rollout

### Objective:
Enable all 4 trigger types for all users.

---

### ✅ Configuration:

**Enable**:
- Milestone triggers (5, 10, 20 surveys)
- Time-based triggers (7, 30, 60 days)
- Survey category triggers (automotive, healthcare, finance, tech)
- Behavior-based triggers (clicked 3+ tech surveys)

**SQL**:
```sql
-- Enable all triggers
UPDATE profile_question_triggers
SET is_active = true;

-- Verify all 10-15 triggers are active
SELECT trigger_type, category, is_active 
FROM profile_question_triggers 
ORDER BY trigger_type, category;
```

---

### 📊 Long-Term Metrics (Month 1+):

| Metric | Target (Month 1) | Target (Month 3) |
|--------|------------------|------------------|
| **Level 3 Completion Rate** | 20% (contextual prompts) | 60% (all sources) |
| **Overall Skip Rate** | <25% | <20% |
| **Stale Data %** | <15% | <10% |
| **Cross-Country Leaks** | 0 | 0 |
| **User Satisfaction** | >4/5 | >4.5/5 |

---

## Safety Mechanisms

### 1. Circuit Breaker (Auto-Pause):

**Trigger**: Skip rate >40% for 3 consecutive days  
**Action**: Auto-pause ALL Level 3 prompts  
**Notification**: Email to admin with link to `/admin/level3-triggers`

**SQL (Daily Cron Job)**:
```sql
-- Check for 3 consecutive days with skip rate >40%
SELECT 
  COUNT(*) AS high_skip_days
FROM (
  SELECT 
    DATE(shown_at) AS day,
    ROUND(SUM(CASE WHEN action = 'skipped' THEN 1 ELSE 0 END)::NUMERIC / COUNT(*) * 100, 2) AS skip_rate
  FROM profile_trigger_history
  WHERE shown_at > NOW() - INTERVAL '3 days'
  GROUP BY DATE(shown_at)
  HAVING ROUND(SUM(CASE WHEN action = 'skipped' THEN 1 ELSE 0 END)::NUMERIC / COUNT(*) * 100, 2) > 40
) AS high_skip_days;

-- If high_skip_days >= 3, disable all triggers
UPDATE profile_question_triggers
SET is_active = false
WHERE (SELECT COUNT(*) FROM high_skip_days) >= 3;
```

---

### 2. Admin "Pause All L3 Prompts" Button:

**Location**: `/admin/level3-triggers`  
**Action**: Instantly disable all contextual prompts (Level 1, Level 2, and user-initiated L3 portal remain active)

**SQL**:
```sql
-- Pause all L3 triggers
UPDATE profile_question_triggers
SET is_active = false;
```

---

### 3. User Feedback Loop:

After each prompt, ask:
```
"Were these questions relevant to you?"
[👍 Yes] [👎 No]
[Optional: Tell us why]
```

**Track in Database**:
```sql
ALTER TABLE profile_trigger_history ADD COLUMN feedback TEXT;
ALTER TABLE profile_trigger_history ADD COLUMN feedback_comment TEXT;
```

**Usage**:
- If >30% "thumbs down" on a specific trigger → flag for admin review
- Use comments to refine question wording

---

## Related Documentation

- `LEVEL_PROFILING_STRATEGY.md`: Overview of 3-level system
- `LEVEL3_CONTEXTUAL_TRIGGERS.md`: Technical spec for L3 triggers
- `WARREN_ADMIN_GUIDE.md`: Plain-English admin guide
- `GLOBAL_VS_LOCAL_BRANDS.md`: Managing global vs local options
- `DATA_ISOLATION_QUICK_REFERENCE.md`: SQL patterns for country filtering
