# Country-Specific Question Management Guide

## Overview

This guide explains how to create and manage profile questions that vary by country, such as income ranges with different currencies or local brand preferences.

## When to Use Country-Specific Questions

**Use `country_specific` applicability for:**
- Income/financial questions (different currencies and scales)
- Local classifications (SEC in South Africa, NCCS in India)
- Brand preferences (different brands available per country)
- Regulatory questions (data protection laws vary by country)

**Use `global` applicability for:**
- Universal demographics (gender, date of birth, ethnicity)
- Name fields (first_name, last_name)
- Universal preferences (email notifications, privacy settings)

## Step-by-Step: Creating a Country-Specific Question

### 1. Create Base Question

Navigate to `/admin/profile-questions` and click "Create Question".

**Fill in basic fields:**
- Question Key: `household_income` (unique identifier)
- Question Text: "What is your household income?"
- Question Type: `select` (dropdown)
- Level: `2` (required before earning)
- Category: Select appropriate category (e.g., "Financial")
- Is Required: `true` (if mandatory)

### 2. Set Applicability

- Select **"Country-Specific"** radio button
- Multi-select countries: ZA, NG, KE, GB, IN
- Assign Targeting Tags: `income`, `financial`, `targeting_core`
- Set Question Group: `household_income_group`

### 3. Define Country Options

Click **"Manage Country Options"** button.

**For each country tab:**

#### **South Africa (ZA)**

**Options JSON:**
```json
[
  {"value": "0-50000", "label": "R0 - R50,000"},
  {"value": "50001-100000", "label": "R50,001 - R100,000"},
  {"value": "100001-200000", "label": "R100,001 - R200,000"},
  {"value": "200001-500000", "label": "R200,001 - R500,000"},
  {"value": "500001+", "label": "R500,001+"}
]
```

**Metadata:**
- Currency: `ZAR`
- Symbol: `R`
- Format: `thousands`

#### **Nigeria (NG)**

**Options JSON:**
```json
[
  {"value": "0-1000000", "label": "₦0 - ₦1,000,000"},
  {"value": "1000001-3000000", "label": "₦1,000,001 - ₦3,000,000"},
  {"value": "3000001-6000000", "label": "₦3,000,001 - ₦6,000,000"},
  {"value": "6000001-12000000", "label": "₦6,000,001 - ₦12,000,000"},
  {"value": "12000001+", "label": "₦12,000,001+"}
]
```

**Metadata:**
- Currency: `NGN`
- Symbol: `₦`
- Format: `thousands`

## Adding a New Country

### Scenario: Adding India (IN) to existing household income question

1. Navigate to `/admin/profile-questions`
2. Find "What is your household income?" question
3. Click "Edit"
4. In Countries multi-select, add **India (IN)**
5. Click "Manage Country Options"
6. Navigate to **India (IN)** tab
7. Define options:

```json
[
  {"value": "0-250000", "label": "₹0 - ₹2,50,000"},
  {"value": "250001-500000", "label": "₹2,50,001 - ₹5,00,000"},
  {"value": "500001-1000000", "label": "₹5,00,001 - ₹10,00,000"},
  {"value": "1000001-2000000", "label": "₹10,00,001 - ₹20,00,000"},
  {"value": "2000001+", "label": "₹20,00,001+"}
]
```

**Metadata:**
- Currency: `INR`
- Symbol: `₹`
- Format: `lakhs`

8. Save changes

**Result:** Indian users immediately see rupee-based options, existing users unaffected.

## Targeting Tags Best Practices

**Core Tags:**
- `targeting_core`: Essential questions for survey matching
- `demographics`: Age, gender, location, household size
- `income`: All income-related questions
- `financial`: Banking, savings, investments
- `automotive`: Car ownership, preferences
- `brands`: Brand usage/preferences

## Question Groups

**Purpose:** Link related questions across countries that serve the same logical purpose.

**Examples:**
- `household_income_group`: Links all household income questions regardless of currency
- `sec_group`: Links SEC (ZA), SEM (NG), NCCS (IN) classifications
- `car_brand_group`: Links car brand preferences across regions

## Data Isolation & Targeting

### How Data Isolation Works

Every user in the system has a `country_code` stored in their `profiles` table. This country code is derived from their verified mobile number and serves as the **single source of truth** for the user's country.

**Key Architecture Points:**

1. **User Layer**: `country_code` in `profiles` table (immutable after mobile verification)
2. **Answer Layer**: All answers in `profile_answers` are linked to `user_id`, which links to `country_code`
3. **Query Layer**: All targeting functions enforce `country_code` filter at SQL level

This three-layer protection ensures that **data from different countries never mixes**, enabling clean data engineering and modeling without cross-country pollution.

### Country-Specific Data Engineering

#### Example 1: Get Nigerian Users by Income Bracket

```sql
-- Get all Nigerian users earning ₦3M-₦6M annually
SELECT 
  p.user_id,
  p.first_name,
  p.last_name,
  pa.answer_normalized as income_bracket
FROM profile_answers pa
JOIN profiles p ON p.user_id = pa.user_id
JOIN profile_questions pq ON pq.id = pa.question_id
WHERE p.country_code = 'NG'
  AND pq.question_key = 'household_income'
  AND pa.answer_normalized = '3000001-6000000';
```

#### Example 2: Income Distribution for South Africa Only

```sql
-- Get distribution of household income in South Africa
SELECT 
  pa.answer_normalized as income_bracket,
  COUNT(*) as user_count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*) FILTER (WHERE p.country_code = 'ZA')) OVER(), 2) as percentage
FROM profile_answers pa
JOIN profiles p ON p.user_id = pa.user_id
JOIN profile_questions pq ON pq.id = pa.question_id
WHERE p.country_code = 'ZA'
  AND pq.question_key = 'household_income'
GROUP BY pa.answer_normalized
ORDER BY user_count DESC;

-- Result will ONLY include South African users with Rand (R) ranges:
-- 0-50000          | 1,234 | 15.6%
-- 50001-100000     | 2,845 | 35.8%
-- 100001-200000    | 2,100 | 26.4%
-- ...
```

#### Example 3: Compare Demographics Across Countries

```sql
-- Compare gender demographics: Nigeria vs Kenya
SELECT 
  p.country_code,
  pa.answer_normalized as gender,
  COUNT(*) as user_count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (PARTITION BY p.country_code), 2) as percentage
FROM profile_answers pa
JOIN profiles p ON p.user_id = pa.user_id
JOIN profile_questions pq ON pq.id = pa.question_id
WHERE p.country_code IN ('NG', 'KE')
  AND pq.question_key = 'gender'
GROUP BY p.country_code, pa.answer_normalized
ORDER BY p.country_code, user_count DESC;
```

### Targeting Query Guarantee

The `find_users_by_criteria()` SQL function has a **hardcoded filter** that prevents cross-country data pollution:

```sql
-- From supabase/migrations/.../targeting-functions.sql
WHERE 
  p.country_code = p_country_code  -- ← This line GUARANTEES isolation
  AND pa.targeting_metadata->>'question_key' = criteria.key
  ...
```

**What This Means:**

- Even if a developer forgets to add country filtering in their query, the function **physically cannot** return users from other countries
- Targeting queries for Nigeria will **never** accidentally include South African data
- Each country's data is treated as a completely separate dataset

### Database-Level Safeguards

**1. Indexed `country_code` Column**
```sql
CREATE INDEX idx_profiles_country ON profiles(country_code);
```
Fast filtering: Queries specifying `country_code` use index scan (<50ms for 100k+ users)

**2. Country-Specific `answer_normalized` Values**

The same income question produces different `answer_normalized` values per country:

| Country | Question | answer_normalized | Meaning |
|---------|----------|-------------------|---------|
| ZA | household_income | "100001-200000" | R100k-R200k (Rand) |
| NG | household_income | "100001-200000" | **DOES NOT EXIST** |
| NG | household_income | "3000001-6000000" | ₦3M-₦6M (Naira) |

This prevents accidental value matching across countries.

**3. No Shared Value Ranges for Financial Questions**

Income brackets, pricing tiers, and financial thresholds are **never shared** between countries, even if numeric ranges overlap.

### Real-World Example: Nigerian Income Analysis

```sql
-- Get distribution of household income in Nigeria ONLY
SELECT 
  pa.answer_normalized as income_bracket,
  COUNT(*) as user_count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) as percentage
FROM profile_answers pa
JOIN profiles p ON p.user_id = pa.user_id
JOIN profile_questions pq ON pq.id = pa.question_id
WHERE p.country_code = 'NG'
  AND pq.question_key = 'household_income'
GROUP BY pa.answer_normalized
ORDER BY user_count DESC;

-- Result will ONLY include Nigerian users with ₦ ranges:
-- income_bracket     | user_count | percentage
-- 0-1000000          | 1,234      | 25.6%
-- 1000001-3000000    | 2,100      | 43.2%
-- 3000001-6000000    | 985        | 20.3%
-- 6000001-12000000   | 412        | 8.5%
-- 12000001+          | 121        | 2.4%
```

**Zero South African, Kenyan, or other country data included.**

### Cross-Country Comparative Analysis (Safe)

When you need to compare countries side-by-side:

```sql
-- Compare average income brackets across countries
SELECT 
  p.country_code,
  pa.answer_normalized as income_bracket,
  COUNT(*) as user_count
FROM profile_answers pa
JOIN profiles p ON p.user_id = pa.user_id
JOIN profile_questions pq ON pq.id = pa.question_id
WHERE pq.question_key = 'household_income'
  AND p.country_code IN ('NG', 'ZA', 'KE', 'GB', 'IN')
GROUP BY p.country_code, pa.answer_normalized
ORDER BY p.country_code, user_count DESC;

-- Each country's data stays separate, but you can compare side-by-side
-- Result groups by country_code first, preventing contamination
```

### Data Export for ML/Modeling

Export clean, country-specific datasets for machine learning pipelines:

```sql
-- Export clean Nigerian dataset for predictive modeling
COPY (
  SELECT 
    p.user_id,
    p.country_code,
    p.gender,
    p.date_of_birth,
    pq.question_key,
    pa.answer_normalized,
    pa.last_updated
  FROM profile_answers pa
  JOIN profiles p ON p.user_id = pa.user_id
  JOIN profile_questions pq ON pq.id = pa.question_id
  WHERE p.country_code = 'NG'
    AND pq.targeting_tags @> ARRAY['income', 'demographics']
  ORDER BY p.user_id, pq.question_key
) TO '/tmp/nigeria_targeting_data.csv' WITH CSV HEADER;
```

**Result:** A CSV file containing **only Nigerian users** with their demographic and income data, ready for model training without any cross-country contamination.

### Common Mistakes to Avoid

❌ **DON'T: Query profile_answers without country filter**
```sql
-- WRONG: This mixes all countries together
SELECT answer_normalized, COUNT(*) 
FROM profile_answers pa
JOIN profile_questions pq ON pq.id = pa.question_id
WHERE pq.question_key = 'household_income'
GROUP BY answer_normalized;
```

❌ **DON'T: Use global aggregations without GROUP BY country_code**
```sql
-- WRONG: Average across all countries (meaningless)
SELECT AVG(CAST(answer_normalized AS INTEGER)) 
FROM profile_answers;
```

✅ **DO: Always specify country code for single-country analysis**
```sql
-- CORRECT: Nigerian data only
SELECT answer_normalized, COUNT(*) 
FROM profile_answers pa
JOIN profiles p ON p.user_id = pa.user_id
JOIN profile_questions pq ON pq.id = pa.question_id
WHERE p.country_code = 'NG' -- ← Country filter
  AND pq.question_key = 'household_income'
GROUP BY answer_normalized;
```

✅ **DO: Use find_users_by_criteria() function (built-in country filter)**
```sql
-- CORRECT: Function enforces country isolation
SELECT * FROM find_users_by_criteria(
  'NG', -- ← Country parameter required
  '{"household_income": ["3000001-6000000"]}'::jsonb
);
```

✅ **DO: Verify country filter in EXPLAIN plan before expensive queries**
```sql
-- Check query plan to ensure index usage
EXPLAIN ANALYZE
SELECT * FROM profile_answers pa
JOIN profiles p ON p.user_id = pa.user_id
WHERE p.country_code = 'NG';

-- Look for: "Index Scan using idx_profiles_country"
```

## Advanced Use Cases

### Multi-Country Survey Targeting

Target users across multiple countries with country-specific criteria:

```sql
-- Find high-income users in Nigeria or Kenya
SELECT * FROM find_users_by_criteria(
  'NG',
  '{"household_income": ["6000001-12000000", "12000001+"]}'::jsonb
)
UNION
SELECT * FROM find_users_by_criteria(
  'KE',
  '{"household_income": ["500001-1000000", "1000001+"]}'::jsonb
);

-- Each country uses its own income brackets (₦ vs KES)
-- Results are combined but data never mixed during filtering
```

### Country-Specific Cohort Analysis

Create user segments per country for A/B testing:

```sql
-- Create high-income cohorts per country
WITH nigeria_high_income AS (
  SELECT user_id, 'NG' as country FROM find_users_by_criteria(
    'NG',
    '{"household_income": ["6000001-12000000", "12000001+"]}'::jsonb
  )
),
south_africa_high_income AS (
  SELECT user_id, 'ZA' as country FROM find_users_by_criteria(
    'ZA',
    '{"household_income": ["200001-500000", "500001+"]}'::jsonb
  )
),
kenya_high_income AS (
  SELECT user_id, 'KE' as country FROM find_users_by_criteria(
    'KE',
    '{"household_income": ["500001-1000000", "1000001+"]}'::jsonb
  )
)
SELECT 
  country,
  COUNT(*) as high_income_users,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER(), 2) as percentage_of_total
FROM (
  SELECT * FROM nigeria_high_income
  UNION ALL
  SELECT * FROM south_africa_high_income
  UNION ALL
  SELECT * FROM kenya_high_income
) combined
GROUP BY country
ORDER BY high_income_users DESC;
```

### Targeting by Multiple Criteria

Combine income, age, and gender for precise targeting:

```sql
-- Find Nigerian males aged 25-34 earning ₦3M+
WITH nigeria_users AS (
  SELECT user_id FROM profiles WHERE country_code = 'NG'
),
income_match AS (
  SELECT pa.user_id 
  FROM profile_answers pa
  JOIN profile_questions pq ON pq.id = pa.question_id
  WHERE pq.question_key = 'household_income'
    AND pa.answer_normalized IN ('3000001-6000000', '6000001-12000000', '12000001+')
    AND pa.user_id IN (SELECT user_id FROM nigeria_users)
),
age_match AS (
  SELECT pa.user_id
  FROM profile_answers pa
  JOIN profile_questions pq ON pq.id = pa.question_id
  WHERE pq.question_key = 'age_bracket'
    AND pa.answer_normalized = '25-34'
    AND pa.user_id IN (SELECT user_id FROM nigeria_users)
),
gender_match AS (
  SELECT pa.user_id
  FROM profile_answers pa
  JOIN profile_questions pq ON pq.id = pa.question_id
  WHERE pq.question_key = 'gender'
    AND pa.answer_normalized = 'male'
    AND pa.user_id IN (SELECT user_id FROM nigeria_users)
)
SELECT 
  p.user_id,
  p.first_name,
  p.last_name,
  p.mobile
FROM profiles p
WHERE p.user_id IN (SELECT user_id FROM income_match)
  AND p.user_id IN (SELECT user_id FROM age_match)
  AND p.user_id IN (SELECT user_id FROM gender_match);
```

### Data Quality Monitoring

Monitor for orphaned answers (data integrity check):

```sql
-- Check for answers where user's country is not in question's country_codes
-- This should return 0 rows if system is working correctly
SELECT 
  p.user_id,
  p.country_code,
  pq.question_key,
  pq.country_codes,
  pa.answer_normalized,
  COUNT(*) as orphaned_answers
FROM profile_answers pa
JOIN profiles p ON p.user_id = pa.user_id
JOIN profile_questions pq ON pq.id = pa.question_id
WHERE pq.applicability = 'country_specific'
  AND NOT (p.country_code = ANY(pq.country_codes))
GROUP BY p.user_id, p.country_code, pq.question_key, pq.country_codes, pa.answer_normalized;

-- If this returns rows, it indicates:
-- 1. User changed country after answering
-- 2. Question's country_codes were updated and didn't include existing users
-- 3. Data migration issue
```

### Performance Benchmarking Per Country

Track query performance by country to identify scaling issues:

```sql
-- Benchmark query performance for each country
SELECT 
  p.country_code,
  COUNT(DISTINCT p.user_id) as total_users,
  COUNT(pa.id) as total_answers,
  ROUND(AVG(EXTRACT(EPOCH FROM (pa.last_updated - pa.created_at))), 2) as avg_answer_age_days
FROM profiles p
LEFT JOIN profile_answers pa ON pa.user_id = p.user_id
GROUP BY p.country_code
ORDER BY total_users DESC;

-- Use this to predict when to add country-specific database replicas
```

## Troubleshooting

### Issue: Question not showing for specific country users

**Check:**
1. Is `applicability` set to `country_specific`?
2. Is the country code in `country_codes` array?
3. Does `country_question_options` have a record for that country?
4. Is the question marked as `is_active = true`?

### Issue: Wrong options showing for country

**Check:**
1. Verify user's `country_code` in `profiles` table
2. Check `country_question_options` table for correct country code
3. Clear frontend cache (invalidate `profile-questions` query)

### Issue: Targeting query not finding users

**Check:**
1. Is `answer_normalized` populated in `profile_answers`?
2. Are targeting indexes created?
3. Is question assigned `targeting_tags`?
4. Check `targeting_metadata` in `profile_answers`

## Performance Monitoring

### Useful Queries

**Count questions by applicability:**
```sql
SELECT applicability, COUNT(*) 
FROM profile_questions 
GROUP BY applicability;
```

**Count country options per question:**
```sql
SELECT 
  pq.question_text,
  COUNT(cqo.id) as country_count
FROM profile_questions pq
LEFT JOIN country_question_options cqo ON cqo.question_id = pq.id
WHERE pq.applicability = 'country_specific'
GROUP BY pq.id, pq.question_text
ORDER BY country_count DESC;
```

**Find questions without targeting tags:**
```sql
SELECT question_key, question_text
FROM profile_questions
WHERE targeting_tags IS NULL OR targeting_tags = '{}';
```
