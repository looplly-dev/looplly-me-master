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
