# Looplly Profiling System Documentation

## Navigation Hub

### 📘 For End Users
- **[User Guide](USER_GUIDE.md)**: How your profile works, why questions expire, how to refresh data

### 👨‍💻 For Developers
- **[Architecture](ARCHITECTURE.md)**: Database schema, data flow, 3-level system design
- **[Decay System](DECAY_SYSTEM.md)**: How profile data expires, staleness calculation, re-confirm flows
- **[Integration Guide](INTEGRATION_GUIDE.md)**: Connect profiling to streaks, reputation, surveys, badges

### 🛠️ For Admins (Warren)
- **[Admin Guide](ADMIN_GUIDE.md)**: Add countries, manage questions, monitor health, troubleshoot
- **[Question Builder Guide](QUESTION_BUILDER_GUIDE.md)**: ⚠️ Coming Soon - Dynamic question creation tool

### 📋 Strategy Documents
- **[Level Strategy](LEVEL_STRATEGY.md)**: Why 3 levels? What's in each? Visual indicators
- **[Contextual Triggers](CONTEXTUAL_TRIGGERS.md)**: Level 3 trigger logic (blocking survey access)
- **[Global vs Local Brands](GLOBAL_VS_LOCAL_BRANDS.md)**: Mixed global/country-specific options
- **[Rollout Checklist](ROLLOUT_CHECKLIST.md)**: Phased launch plan (Week 0 → Week 5+)
- **[Country Question Management](COUNTRY_QUESTION_MANAGEMENT.md)**: Add new countries, manage country-specific options

### 🔒 Data Isolation
- **[Data Isolation Quick Reference](../DATA_ISOLATION_QUICK_REFERENCE.md)**: Essential SQL patterns for country-specific queries

---

## Quick Access Links

### Admin Portal
- [Profile Questions Admin](/admin/profile-questions)
- [Profile Decay Dashboard](/admin/profile-decay)
- [Question Builder (Coming Soon)](/admin/question-builder)

### Key Concepts

**3-Level System**:
- **Level 1**: Mandatory signup (name, email, mobile, address)
- **Level 2**: Pre-earning requirements (gender, DOB, income, classification)
- **Level 3**: Progressive contextual profiling (employment, lifestyle, automotive, etc.)

**Data Decay**:
Profile data expires after configurable intervals:
- Immutable: Never expires (DOB, gender, address)
- Rare: 365 days (lifestyle, hobbies)
- Occasional: 180 days (income, job title)
- Frequent: 90 days (brands, shopping habits)

**Country Isolation**:
All queries MUST filter by `country_code` to prevent cross-country data pollution. See [Data Isolation Quick Reference](../DATA_ISOLATION_QUICK_REFERENCE.md).

---

## Getting Started

### I Want To...

**📖 Understand how profiling works** → Start with [User Guide](USER_GUIDE.md)

**🔧 Build features that use profile data** → Read [Architecture](ARCHITECTURE.md) and [Integration Guide](INTEGRATION_GUIDE.md)

**⚙️ Add a new country** → Follow [Admin Guide](ADMIN_GUIDE.md) Section 1

**🔍 Query user data by country** → Use patterns in [Data Isolation Quick Reference](../DATA_ISOLATION_QUICK_REFERENCE.md)

**🩺 Monitor system health** → Check [Admin Guide](ADMIN_GUIDE.md) Section 3

**🐛 Fix data quality issues** → See [Admin Guide](ADMIN_GUIDE.md) Section 5: Troubleshooting

**🚀 Launch profiling in production** → Follow [Rollout Checklist](ROLLOUT_CHECKLIST.md)

---

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        USER JOURNEY                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SIGNUP (Level 1)                                           │
│  ↓ Name, Email, Mobile, Address                             │
│  ↓                                                           │
│  DASHBOARD (Level 2 Required)                               │
│  ↓ Gender, DOB, Income, SEC/SEM                             │
│  ↓                                                           │
│  EARNING UNLOCKED                                            │
│  ↓                                                           │
│  CONTEXTUAL PROMPTS (Level 3)                               │
│  ↓ Employment, Lifestyle, Automotive...                     │
│  ↓ Triggered by milestones, time, behavior, surveys        │
│  ↓                                                           │
│  DATA DECAY MONITORING                                       │
│  ↓ Yellow badges for stale data                             │
│  ↓ Re-confirm prompts after interval expires                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema Quick Reference

### Core Tables
- `profile_categories`: Organize questions into categories (Demographics, Employment, etc.)
- `profile_questions`: Question definitions with validation, decay, country filtering
- `profile_answers`: User responses with staleness tracking
- `country_question_options`: Country-specific options (income ranges, brand lists)
- `profile_decay_config`: Global decay intervals (immutable, rare, occasional, frequent)

### Key Relationships
```
profiles (user_id, country_code)
    ↓
profile_answers (user_id, question_id, answer_value, last_updated)
    ↓
profile_questions (category_id, level, decay_config_key, country_codes)
    ↓
profile_categories (level, name, default_decay_config_key)
```

---

## Data Flow

```
User answers question
    ↓
profile_answers INSERT
    ↓
last_updated = NOW()
    ↓
Decay config applied (lookup decay_config_key)
    ↓
Calculate staleness: (NOW() - last_updated) > interval_days
    ↓
Update UI badges (yellow = stale, green = fresh)
    ↓
If stale + Level 2 → Block earning tab
    ↓
If stale + Level 3 → Reduce survey match quality
```

---

## Key Hooks & APIs

### Frontend Hooks
- `useProfileQuestions()`: Fetch questions with staleness calculated
- `useProfileAnswers()`: Save answers, refresh timestamps
- `useStaleProfileCheck()`: Get stale question count and list
- `useDecayConfig()`: Admin management of decay intervals

### Backend Functions
- `find_users_by_criteria(country_code, criteria)`: Targeting with built-in country isolation
- `calculate_profile_completeness(user_id)`: Compute profile score
- `get_stale_questions(user_id)`: Return questions needing refresh

---

## Common Tasks

### Add New Question
1. Navigate to `/admin/profile-questions`
2. Click "Create Question"
3. Fill in: question_key, question_text, question_type, level, category
4. Set: is_required, decay_config_key, country_codes (if country-specific)
5. If country-specific, click "Manage Country Options" and define options per country
6. Save

### Add New Country
1. Navigate to `/admin/profile-questions`
2. Find country-specific questions (income, SEC/SEM, brands)
3. Edit each question → Add new country code
4. Click "Manage Country Options" → Define country-specific options
5. Test with fake user from new country
6. See [Admin Guide](ADMIN_GUIDE.md) Section 1 for full checklist

### Monitor Data Staleness
1. Navigate to `/admin/profile-decay`
2. View metrics: Staleness Rate by Category, Top Stale Questions
3. Red flag if staleness rate >20%
4. See [Admin Guide](ADMIN_GUIDE.md) Section 3 for health monitoring

### Query Users by Income (Nigeria)
```sql
SELECT * FROM find_users_by_criteria(
  'NG',
  '{"household_income": ["3000001-6000000", "6000001-12000000"]}'::jsonb
);
```
See [Data Isolation Quick Reference](../DATA_ISOLATION_QUICK_REFERENCE.md) for more patterns.

---

## Related Documentation

### In This Folder
- All PROFILING/ docs listed above

### Root-Level Docs
- [ADMIN_SETUP_INSTRUCTIONS.md](../../ADMIN_SETUP_INSTRUCTIONS.md)
- [DATA_ISOLATION_QUICK_REFERENCE.md](../DATA_ISOLATION_QUICK_REFERENCE.md)
- [STREAK_REPUTATION_SYSTEM.md](../STREAK_REPUTATION_SYSTEM.md)
- [REP_CLASSIFICATION_SYSTEM.md](../REP_CLASSIFICATION_SYSTEM.md)

### Migration Files
- `supabase/migrations/*_profile-questions-schema.sql`
- `supabase/migrations/*_country-question-options.sql`
- `supabase/migrations/*_targeting-functions.sql`

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-10-19 | 1.0 | Initial documentation restructure |

---

**Need Help?** See [Admin Guide](ADMIN_GUIDE.md) Section 5: Troubleshooting or contact dev team.
