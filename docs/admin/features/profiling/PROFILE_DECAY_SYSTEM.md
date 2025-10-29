---
id: "profile-decay-system"
title: "Profile Decay System"
category: "Profiling System"
description: "Profile data freshness management and decay interval configuration"
audience: "admin"
tags: ["profiling", "decay", "freshness", "data-quality"]
status: "published"
---

# Profile Decay System

Managing profile data freshness and decay interval configuration.

## Overview

The Profile Decay System ensures user profile data remains current and relevant by automatically marking answers as "stale" after configurable time periods. This improves data quality for targeting, surveys, and analytics.

## Why Profile Decay Matters

### Data Quality Impact
- **Targeting Accuracy**: Fresh data ensures surveys reach the right users
- **User Experience**: Reduces irrelevant survey invitations
- **Compliance**: Helps maintain up-to-date personal information
- **Platform Health**: Provides metrics on data freshness across the system

### Real-World Examples

**Without Decay:**
- User answers "employed" in 2023
- Now unemployed in 2025
- Still receives job-related surveys → Poor experience

**With Decay:**
- Employment status marked stale after 12 months
- User prompted to update
- Fresh data improves targeting → Better experience

## 3-Level Configuration Hierarchy

The system uses a hierarchical configuration model with override capabilities:

### Level 1: Global Default
**Location:** `profile_decay_config` table → `config_key: 'global_default'`

**Purpose:** Fallback for all questions without specific configuration

**Default Setting:** `interval_type: 'long'` (365 days)

**When Applied:**
- Question has no question-level configuration
- Question's category has no category-level configuration
- Ensures every question has a decay rule

### Level 2: Category Default
**Location:** `profile_categories` table → `default_decay_config_key` column

**Purpose:** Group similar questions with common decay intervals

**Example Configurations:**
- **Personal Info** (Level 1): `short` (90 days) - Name, DOB, Gender
- **Household** (Level 2): `medium` (180 days) - Income, Address, SEC
- **Preferences** (Level 2): `long` (365 days) - Interests, Hobbies

**When Applied:**
- Overrides global default
- Can be overridden by question-level config

### Level 3: Question-Specific
**Location:** `profile_questions` table → `decay_config_key` column

**Purpose:** Fine-grained control for individual questions

**Example Use Cases:**
- **Employment Status**: `short` (90 days) - Changes frequently
- **Date of Birth**: `never` - Immutable, never decays
- **Marital Status**: `medium` (180 days) - Moderate change frequency
- **Education Level**: `long` (365 days) - Rarely changes

**When Applied:**
- Highest priority, overrides both category and global defaults

## Decay Intervals

### Interval Types

| Type | Days | Best For |
|------|------|----------|
| **never** | NULL | Immutable data (DOB, ID numbers) |
| **short** | 90 | Frequently changing (employment, income) |
| **medium** | 180 | Moderately stable (address, household size) |
| **long** | 365 | Rarely changing (education, preferences) |

### Configuration Examples

**Question: "What is your current employment status?"**
```
Level 3 (Question): decay_config_key = 'short_decay'
Level 2 (Category: Household): default_decay_config_key = 'medium_decay'
Level 1 (Global): config_key = 'global_default' (long_decay)

✅ Result: Uses 'short_decay' (90 days) - Question level takes priority
```

**Question: "What is your highest education level?"**
```
Level 3 (Question): decay_config_key = NULL
Level 2 (Category: Personal Info): default_decay_config_key = 'long_decay'
Level 1 (Global): config_key = 'global_default' (long_decay)

✅ Result: Uses 'long_decay' (365 days) - Category level applied
```

**Question: "What are your hobbies?"**
```
Level 3 (Question): decay_config_key = NULL
Level 2 (Category: Preferences): default_decay_config_key = NULL
Level 1 (Global): config_key = 'global_default' (long_decay)

✅ Result: Uses 'global_default' (365 days) - Falls back to global
```

## Platform Health Metrics

### Staleness Distribution

**Categories:**
- **Fresh (0-20% stale)**: Excellent data quality
- **Fair (21-50% stale)**: Acceptable, monitor closely
- **Needs Attention (51-80% stale)**: Action required
- **Critical (>80% stale)**: Urgent intervention needed

**Calculation:**
```
Staleness % = (Stale Answers / Total Answers) × 100

For each question:
- Total Answers: Count of profile_answers for that question
- Stale Answers: Count where is_stale = true
```

### Health Score Interpretation

**90-100% Fresh**: 🟢 Excellent
- Data is highly current
- Targeting is accurate
- User experience optimal

**70-89% Fresh**: 🟡 Good
- Most data is current
- Some users need prompts
- Monitor trends

**50-69% Fresh**: 🟠 Fair
- Significant decay
- Consider reducing intervals
- Increase update prompts

**<50% Fresh**: 🔴 Poor
- Critical data quality issue
- Immediate action required
- Review decay configuration

## Admin Portal Features

### Profile Decay Page
**Location:** `/admin/profile-decay`

**Features:**
1. **Configuration Management**
   - View all decay configurations
   - Edit interval types and days
   - Create new configurations
   - Activate/deactivate rules

2. **Platform Health Dashboard**
   - Overall freshness percentage
   - Staleness distribution chart
   - Question-level breakdown
   - Category-level aggregates

3. **Search & Filter**
   - Filter by interval type (Never, Short, Medium, Long)
   - Search by configuration key
   - View active vs inactive configs
   - Sort by creation date

4. **Bulk Operations**
   - Update multiple configurations
   - Apply category defaults
   - Reset to global defaults
   - Export configuration data

### Profile Questions Integration

**Location:** `/admin/profile-questions`

**Decay Configuration:**
- Each question shows current decay setting
- Click to override with question-specific rule
- View effective decay interval (considering hierarchy)
- Preview staleness impact

## Best Practices

### Setting Decay Intervals

**Immutable Data (NEVER):**
- Date of birth
- National ID number
- Gender (unless user preference)
- Historical data

**Frequently Changing (SHORT - 90 days):**
- Employment status
- Current income
- Recent purchases
- Active subscriptions

**Moderately Stable (MEDIUM - 180 days):**
- Home address
- Household size
- Marital status
- Vehicle ownership

**Rarely Changing (LONG - 365 days):**
- Education level
- Ethnicity
- Long-term preferences
- Professional certifications

### Monitoring Strategy

**Weekly:**
- Check overall platform health score
- Review questions with >50% staleness
- Identify trending issues

**Monthly:**
- Analyze decay effectiveness
- Adjust intervals based on data
- Review user feedback

**Quarterly:**
- Comprehensive decay audit
- Update category defaults
- Refine question-level overrides

### User Communication

**Prompt Design:**
- Clearly state why update is needed
- Show last updated date
- Explain benefits of fresh data
- Make updating easy and quick

**Frequency:**
- Don't prompt too often (user fatigue)
- Batch multiple stale questions
- Prioritize critical questions
- Offer incentives for updates

## Technical Implementation

### Database Triggers

**Auto-Staleness Detection:**
```sql
-- Runs daily via cron job
UPDATE profile_answers SET is_stale = true
WHERE last_updated < (NOW() - INTERVAL calculated_from_decay_config);
```

### API Endpoints

**Check User Staleness:**
```typescript
GET /api/profile/staleness?user_id={uuid}
Returns: { staleQuestions: string[], freshPercentage: number }
```

**Update Answer:**
```typescript
POST /api/profile/answer
Body: { question_id, answer_value }
Action: Updates answer, resets is_stale to false
```

### Frontend Integration

**Prompt Display:**
- Badge on dashboard indicating stale profile
- Modal showing questions needing update
- In-context prompts during survey flow
- Profile completeness score adjustment

## Troubleshooting

### Question Not Decaying

**Check:**
1. Decay config exists and is active
2. `staleness_days` set on question
3. Cron job running correctly
4. Database trigger functioning

### Wrong Interval Applied

**Verify Hierarchy:**
1. Check question-level `decay_config_key`
2. Check category `default_decay_config_key`
3. Confirm global default exists
4. Review override logic in code

### Platform Health Inaccurate

**Validate:**
1. Count of profile_answers matches display
2. Staleness calculation correct
3. Date comparisons working
4. Cache not showing old data

## Related Documentation

- [Profile Questions](./ADMIN_PORTAL_GUIDE.md#profile-questions) - Question management
- [Table Architecture](./TABLE_ARCHITECTURE.md) - Database schema
- [Admin Portal Guide](./ADMIN_PORTAL_GUIDE.md) - Navigation and features
- [Recent Changes](./RECENT_CHANGES.md) - Latest updates

Note: metadata refreshed.
