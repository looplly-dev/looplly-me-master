# Profile System Architecture

## Overview

This document outlines the complete architecture for Looplly's multi-level profile system. The system is designed to progressively collect user information across three levels of priority, with built-in data decay tracking and contextual triggers.

### Key Features

- **3-Level Profile System**: Mandatory Level 1 (signup), Compulsory Level 2 (pre-earning), Progressive Level 3 (contextual)
- **Data Decay Tracking**: Automatic staleness detection based on configurable intervals
- **Google Places Integration**: Structured address collection with international support
- **Country-Specific Options**: Dynamic income ranges and brand lists per country
- **Collapsible Category UI**: User-friendly accordion view matching Action Plan pattern

---

## 1. Database Schema Design

### Core Tables

#### A. `profile_categories` Table

Organizes profile questions into logical categories with visual hierarchy.

```sql
CREATE TABLE public.profile_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  display_order INTEGER NOT NULL DEFAULT 0,
  default_decay_config_key TEXT REFERENCES public.profile_decay_config(config_key),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.profile_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view active categories"
  ON public.profile_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON public.profile_categories FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

**Initial Seed Data:**

```sql
INSERT INTO public.profile_categories (name, display_name, icon, level, display_order) VALUES
  ('identity_security', 'Identity & Security', 'ShieldCheck', 1, 1),
  ('demographics', 'Demographics', 'Users', 2, 2),
  ('financial_profile', 'Financial Profile', 'DollarSign', 2, 3),
  ('employment_career', 'Employment & Career', 'Briefcase', 3, 4),
  ('lifestyle_housing', 'Lifestyle & Housing', 'Home', 3, 5),
  ('automotive', 'Automotive & Transportation', 'Car', 3, 6),
  ('technology', 'Technology & Communication', 'Smartphone', 3, 7),
  ('health_wellness', 'Health & Wellness', 'Heart', 3, 8);
```

---

#### B. `profile_questions` Table

Individual questions with validation rules, decay settings, and country filtering.

```sql
CREATE TABLE public.profile_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.profile_categories(id) ON DELETE CASCADE,
  question_key TEXT NOT NULL UNIQUE,
  question_text TEXT NOT NULL,
  help_text TEXT,
  placeholder TEXT,
  question_type TEXT NOT NULL CHECK (question_type IN ('text', 'email', 'phone', 'select', 'multi_select', 'date', 'address', 'number', 'boolean')),
  options JSONB,
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  is_required BOOLEAN NOT NULL DEFAULT false,
  is_immutable BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  decay_config_key TEXT REFERENCES public.profile_decay_config(config_key),
  staleness_days INTEGER DEFAULT 365,
  applicability TEXT DEFAULT 'global' CHECK (applicability IN ('global', 'country_specific')),
  country_codes TEXT[],
  validation_rules JSONB DEFAULT '{}'::jsonb,
  targeting_tags TEXT[],
  question_group TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.profile_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view active questions"
  ON public.profile_questions FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage questions"
  ON public.profile_questions FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_profile_questions_category ON public.profile_questions(category_id);
CREATE INDEX idx_profile_questions_level ON public.profile_questions(level);
CREATE INDEX idx_profile_questions_country ON public.profile_questions USING GIN(country_codes);
```

**Sample Level 1 Questions:**

```sql
-- Identity & Security Category
INSERT INTO public.profile_questions (category_id, question_key, question_text, question_type, level, is_required, is_immutable) VALUES
  ((SELECT id FROM profile_categories WHERE name = 'identity_security'), 'first_name', 'First Name', 'text', 1, true, true),
  ((SELECT id FROM profile_categories WHERE name = 'identity_security'), 'last_name', 'Last Name', 'text', 1, true, true),
  ((SELECT id FROM profile_categories WHERE name = 'identity_security'), 'mobile', 'Mobile Number', 'phone', 1, true, false),
  ((SELECT id FROM profile_categories WHERE name = 'identity_security'), 'email', 'Email Address', 'email', 1, false, false),
  ((SELECT id FROM profile_categories WHERE name = 'identity_security'), 'address', 'Full Address', 'address', 1, true, false);
```

**Sample Level 2 Questions:**

```sql
-- Demographics Category
INSERT INTO public.profile_questions (category_id, question_key, question_text, question_type, level, is_required, decay_config_key) VALUES
  ((SELECT id FROM profile_categories WHERE name = 'demographics'), 'gender', 'Gender', 'select', 2, true, 'immutable'),
  ((SELECT id FROM profile_categories WHERE name = 'demographics'), 'date_of_birth', 'Date of Birth', 'date', 2, true, 'immutable'),
  ((SELECT id FROM profile_categories WHERE name = 'demographics'), 'ethnicity', 'Ethnicity', 'select', 2, false, 'rare');

-- Financial Profile Category (Country-Specific)
INSERT INTO public.profile_questions (category_id, question_key, question_text, question_type, level, is_required, applicability, country_codes, decay_config_key) VALUES
  ((SELECT id FROM profile_categories WHERE name = 'financial_profile'), 'household_income', 'Household Income', 'select', 2, true, 'country_specific', ARRAY['NG', 'ZA', 'KE'], 'occasional'),
  ((SELECT id FROM profile_categories WHERE name = 'financial_profile'), 'sec', 'Socio-Economic Classification (SEC)', 'select', 2, true, 'country_specific', ARRAY['IN'], 'occasional');
```

---

#### C. `profile_answers` Table

Stores all user responses with automatic staleness tracking.

```sql
CREATE TABLE public.profile_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.profile_questions(id) ON DELETE CASCADE,
  answer_value TEXT,
  answer_json JSONB,
  answer_normalized TEXT,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_stale BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID,
  targeting_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- RLS Policies
ALTER TABLE public.profile_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own answers"
  ON public.profile_answers FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own answers"
  ON public.profile_answers FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own answers"
  ON public.profile_answers FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all answers"
  ON public.profile_answers FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage answers"
  ON public.profile_answers FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Indexes
CREATE INDEX idx_profile_answers_user ON public.profile_answers(user_id);
CREATE INDEX idx_profile_answers_question ON public.profile_answers(question_id);
CREATE INDEX idx_profile_answers_stale ON public.profile_answers(is_stale) WHERE is_stale = true;

-- Trigger to compute targeting metadata
CREATE OR REPLACE FUNCTION public.compute_targeting_metadata()
RETURNS TRIGGER AS $$
DECLARE
  v_question RECORD;
BEGIN
  -- Fetch question metadata
  SELECT question_key, targeting_tags, question_group
  INTO v_question
  FROM profile_questions
  WHERE id = NEW.question_id;
  
  -- Normalize answer value
  NEW.answer_normalized := CASE
    WHEN NEW.answer_value IS NOT NULL THEN NEW.answer_value
    WHEN NEW.answer_json IS NOT NULL THEN 
      COALESCE(
        NEW.answer_json->>'value',
        NEW.answer_json->>'formatted_address'
      )
    ELSE NULL
  END;
  
  -- Cache targeting metadata
  NEW.targeting_metadata := jsonb_build_object(
    'question_key', v_question.question_key,
    'tags', COALESCE(v_question.targeting_tags, ARRAY[]::TEXT[]),
    'group', v_question.question_group
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER compute_targeting_metadata_trigger
  BEFORE INSERT OR UPDATE ON public.profile_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_targeting_metadata();
```

---

#### D. `profile_decay_config` Table

Global decay interval configuration.

```sql
CREATE TABLE public.profile_decay_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  interval_type TEXT NOT NULL CHECK (interval_type IN ('immutable', 'rare', 'occasional', 'frequent')),
  interval_days INTEGER,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.profile_decay_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view active decay configs"
  ON public.profile_decay_config FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage decay configs"
  ON public.profile_decay_config FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Seed decay configs
INSERT INTO public.profile_decay_config (config_key, interval_type, interval_days, description) VALUES
  ('immutable', 'immutable', NULL, 'Never expires (DOB, gender, address)'),
  ('rare', 'rare', 365, 'Expires after 1 year (lifestyle, hobbies)'),
  ('occasional', 'occasional', 180, 'Expires after 6 months (income, job title)'),
  ('frequent', 'frequent', 90, 'Expires after 3 months (brands, devices)');
```

See [DECAY_SYSTEM.md](DECAY_SYSTEM.md) for comprehensive decay documentation.

---

#### E. `country_question_options` Table

Country-specific options for select-type questions (income ranges, brand lists, etc.).

```sql
CREATE TABLE public.country_question_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.profile_questions(id) ON DELETE CASCADE,
  country_code TEXT NOT NULL,
  options JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(question_id, country_code)
);

-- RLS Policies
ALTER TABLE public.country_question_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view country options"
  ON public.country_question_options FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage country options"
  ON public.country_question_options FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

See [COUNTRY_QUESTION_MANAGEMENT.md](COUNTRY_QUESTION_MANAGEMENT.md) for country-specific workflows.

---

#### F. `address_components` Table

Structured address storage with Google Places integration.

```sql
CREATE TABLE public.address_components (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  formatted_address TEXT NOT NULL,
  street_number TEXT,
  route TEXT,
  locality TEXT,
  administrative_area_level_1 TEXT,
  administrative_area_level_2 TEXT,
  country TEXT,
  postal_code TEXT,
  place_id TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  is_primary BOOLEAN DEFAULT true,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.address_components ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own addresses"
  ON public.address_components FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own addresses"
  ON public.address_components FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own addresses"
  ON public.address_components FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all addresses"
  ON public.address_components FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Index
CREATE INDEX idx_address_components_user ON public.address_components(user_id);
```

---

#### G. Enhanced `profiles` Table

Add completion tracking columns to existing table.

```sql
-- Add new columns to existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_level INTEGER DEFAULT 1 CHECK (profile_level IN (1, 2, 3));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_completeness_score INTEGER DEFAULT 0 CHECK (profile_completeness_score >= 0 AND profile_completeness_score <= 100);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_profile_update TIMESTAMP WITH TIME ZONE DEFAULT now();
```

---

## 2. Profile Level Logic

### Level 1: Mandatory (Signup Blocker)

**Purpose**: Essential identity and contact information required before account creation.

**Required Fields:**
- First Name
- Last Name
- Mobile Number (with country code detection)
- Address (via Google Places - structured components)
- Email (optional but recommended)

**Enforcement Point**: Registration flow - user cannot complete signup without Level 1.

---

### Level 2: Compulsory (Pre-Earning Blocker)

**Purpose**: Demographic and socio-economic data required for survey matching and earning eligibility.

**Required Fields:**
- Gender
- Date of Birth
- Household Income (country-specific ranges)
- SEC/SEM/NCCS (Socio-Economic Classification, country-specific)
- Ethnicity (recommended)

**Enforcement Point**:
- Block access to "Earn" tab until Level 2 complete
- Show completion prompt on dashboard
- Allow profile setup but prevent earning activities

**Staleness Check**: If Level 2 data is stale, earning access is blocked until refreshed.

See [LEVEL_STRATEGY.md](LEVEL_STRATEGY.md) for detailed level breakdown.

---

### Level 3: Progressive (Contextual & Optional)

**Purpose**: Additional profiling data collected over time based on survey type, feature access, or time-based triggers.

**Categories:**
- Employment & Career (job title, industry, company size)
- Lifestyle & Housing (home ownership, household size, pets)
- Automotive & Transportation (car ownership, vehicle make/model, driving frequency)
- Technology & Communication (devices owned, internet connection, software usage)
- Health & Wellness (exercise frequency, dietary preferences, health conditions)

**Enforcement**: Optional prompts before accessing specific surveys, progressive disclosure in Profile tab.

See [CONTEXTUAL_TRIGGERS.md](CONTEXTUAL_TRIGGERS.md) for trigger logic.

---

## 3. Data Flow

### User Journey

```
User signs up (Level 1)
    ↓
profile_answers INSERT (name, mobile, address)
    ↓
Dashboard access granted
    ↓
Level 2 prompt appears
    ↓
User answers Level 2 questions (gender, DOB, income, SEC)
    ↓
profile_answers INSERT with last_updated = NOW()
    ↓
Level 2 completion tracked in profiles table
    ↓
Earn tab unlocked
    ↓
Contextual Level 3 prompts appear (based on triggers)
    ↓
Decay system monitors staleness
    ↓
If Level 2 data becomes stale → Earn tab blocked until refreshed
```

### Staleness Calculation Flow

```
User answers question
    ↓
profile_answers INSERT/UPDATE
    ↓
last_updated = NOW()
    ↓
Decay config applied (lookup decay_config_key)
    ↓
Calculate staleness: (NOW() - last_updated) > interval_days
    ↓
Update is_stale flag
    ↓
Update UI badges (yellow = stale, green = fresh)
    ↓
If stale + Level 2 → Block earning tab
    ↓
If stale + Level 3 → Reduce survey match quality
```

See [DECAY_SYSTEM.md](DECAY_SYSTEM.md) for comprehensive staleness tracking.

---

## 4. Key Hooks & APIs

### Frontend Hooks

- **`useProfileQuestions()`**: Fetch questions with staleness calculated, organized by category
- **`useProfileAnswers()`**: Save answers, refresh timestamps
- **`useStaleProfileCheck()`**: Get stale question count and list
- **`useDecayConfig()`**: Admin management of decay intervals

### Backend Functions

- **`find_users_by_criteria(country_code, criteria)`**: Targeting with built-in country isolation
- **`calculate_profile_completeness(user_id)`**: Compute profile score
- **`get_stale_questions(user_id)`**: Return questions needing refresh

See [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) for integration patterns.

---

## 5. Country-Specific Data Handling

### Global vs Country-Specific Questions

**Global Questions** (apply to all countries):
- First Name, Last Name, Email, Mobile
- Gender, Date of Birth
- Generic lifestyle questions

**Country-Specific Questions** (vary by country):
- Household Income (different ranges per country)
- SEC/SEM/NCCS (India uses SEC, Nigeria uses SEM)
- Beverage Brands (mix of global + local brands)

### Dynamic Option Merging

When fetching questions for a user:

1. Fetch user's `country_code` from `profiles` table
2. Fetch questions with `country_codes` filter
3. For each question:
   - If `applicability = 'global'`: Use `options` from `profile_questions`
   - If `applicability = 'country_specific'`: 
     - Fetch from `country_question_options` WHERE `country_code = user_country`
     - Merge global brands + local brands
     - Sort alphabetically

See [GLOBAL_VS_LOCAL_BRANDS.md](GLOBAL_VS_LOCAL_BRANDS.md) for brand management.

---

## 6. Security & Data Isolation

### Critical Security Patterns

**ALWAYS filter by `country_code`** to prevent cross-country data pollution:

```sql
-- ✅ CORRECT: Filter by user's country
SELECT * FROM profile_answers pa
JOIN profiles p ON p.user_id = pa.user_id
WHERE p.country_code = 'NG' AND pa.question_id = '...';

-- ❌ WRONG: No country filter (data leak risk)
SELECT * FROM profile_answers WHERE question_id = '...';
```

See [Data Isolation Quick Reference](../DATA_ISOLATION_QUICK_REFERENCE.md) for SQL patterns.

### RLS Policies

All profile tables have Row-Level Security enabled:
- Users can only view/edit their own data
- Admins can view all data (with `has_role(auth.uid(), 'admin')`)
- Service role has full access (for backend functions)

---

## 7. UI Components

### Profile Tab Structure

```
Profile Tab
├── Level 1 Section (always visible)
│   ├── Identity & Security (collapsible)
│   │   ├── First Name
│   │   ├── Last Name
│   │   ├── Mobile
│   │   ├── Email
│   │   └── Address
│   └── Completion: 5/5 ✓
│
├── Level 2 Section (if Level 1 complete)
│   ├── Demographics (collapsible)
│   │   ├── Gender
│   │   ├── Date of Birth
│   │   └── Ethnicity
│   ├── Financial Profile (collapsible)
│   │   ├── Household Income
│   │   └── SEC/SEM
│   └── Completion: 4/5 (1 stale)
│
└── Level 3 Section (if Level 2 complete)
    ├── Employment (collapsible)
    │   ├── Job Title
    │   └── Industry
    ├── Lifestyle (collapsible)
    │   ├── Home Ownership
    │   └── Household Size
    └── Completion: 12/25 (48%)
```

### Staleness Indicators

- **Green Badge**: Data fresh, no action needed
- **Yellow Badge**: Data stale, needs refresh soon
- **Red Banner**: Level 2 data stale, earning blocked

---

## 8. Admin Configuration Portal

### Current Admin Pages

- **`/admin/profile-questions`**: View all questions, categories
- **`/admin/profile-decay`**: Monitor staleness, adjust decay intervals
- **`/admin/question-builder`** (future): Create/edit questions without SQL

See [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for admin workflows.

---

## 9. Related Documentation

### For End Users
- [User Guide](USER_GUIDE.md): Plain-English explanation of profile system

### For Developers
- [Decay System](DECAY_SYSTEM.md): How data expiry works
- [Integration Guide](INTEGRATION_GUIDE.md): Connect profiling to other systems

### For Admins
- [Admin Guide](ADMIN_GUIDE.md): Manage questions, countries, decay
- [Question Builder Guide](QUESTION_BUILDER_GUIDE.md): Dynamic question creation (coming soon)

### Strategy Documents
- [Level Strategy](LEVEL_STRATEGY.md): Why 3 levels? What's in each?
- [Contextual Triggers](CONTEXTUAL_TRIGGERS.md): Level 3 trigger logic
- [Global vs Local Brands](GLOBAL_VS_LOCAL_BRANDS.md): Mixed global/country-specific options
- [Rollout Checklist](ROLLOUT_CHECKLIST.md): Phased launch plan
- [Country Question Management](COUNTRY_QUESTION_MANAGEMENT.md): Add new countries

### Root-Level Docs
- [Data Isolation Quick Reference](../DATA_ISOLATION_QUICK_REFERENCE.md): Essential SQL patterns
- [Streak & Reputation System](../STREAK_REPUTATION_SYSTEM.md): Gamification integration
- [Rep Classification System](../REP_CLASSIFICATION_SYSTEM.md): Reputation tiers

---

## Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-10-19 | 2.0 | Documentation restructure, extracted decay content |
| 2025-01-15 | 1.5 | Added country-specific options table |
| 2025-01-10 | 1.0 | Initial multi-level profile system |
