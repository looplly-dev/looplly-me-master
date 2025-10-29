---
id: "profiling-architecture"
title: "Profiling System Architecture"
category: "Profiling System"
description: "Technical architecture, database schema, and implementation details for the profiling system"
audience: "admin"
tags: ["profiling", "architecture", "database", "technical"]
status: "published"
version: "1.0"
created_at: "2024-01-15"
updated_at: "2024-01-15"
---

# Profiling System Architecture

## Overview

The Looplly Profiling System is built on a flexible, scalable architecture that supports progressive data collection, country-specific customization, and AI-powered automation.

## Database Schema

### Core Tables

#### `profile_categories`
Organizes questions into logical groups.

```sql
CREATE TABLE profile_categories (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  short_id TEXT,
  description TEXT,
  icon TEXT,
  level INTEGER NOT NULL,
  display_order INTEGER DEFAULT 0,
  default_decay_config_key TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `profile_questions`
Defines individual profiling questions.

```sql
CREATE TABLE profile_questions (
  id UUID PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES profile_categories(id),
  question_key TEXT NOT NULL UNIQUE,
  short_id TEXT,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,
  level INTEGER NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  is_draft BOOLEAN DEFAULT false,
  is_immutable BOOLEAN DEFAULT false,
  options JSONB,
  help_text TEXT,
  placeholder TEXT,
  validation_rules JSONB DEFAULT '{}',
  decay_config_key TEXT,
  staleness_days INTEGER DEFAULT 365,
  applicability TEXT DEFAULT 'global',
  country_codes TEXT[],
  targeting_tags TEXT[],
  question_group TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `profile_answers`
Stores user responses with targeting metadata.

```sql
CREATE TABLE profile_answers (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  question_id UUID NOT NULL REFERENCES profile_questions(id),
  answer_value TEXT,
  answer_json JSONB,
  answer_normalized TEXT,
  selected_option_short_id TEXT,
  is_verified BOOLEAN DEFAULT false,
  verified_by UUID,
  verified_at TIMESTAMPTZ,
  is_stale BOOLEAN DEFAULT false,
  last_updated TIMESTAMPTZ DEFAULT now(),
  targeting_metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, question_id)
);
```

#### `question_answer_options`
Defines answer choices for select/multiselect questions.

```sql
CREATE TABLE question_answer_options (
  id UUID PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES profile_questions(id),
  question_short_id TEXT NOT NULL,
  short_id TEXT NOT NULL,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `country_question_options`
Country-specific answer options.

```sql
CREATE TABLE country_question_options (
  id UUID PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES profile_questions(id),
  country_code TEXT NOT NULL,
  options JSONB NOT NULL,
  is_fallback BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `profile_decay_config`
Defines staleness intervals for data refresh.

```sql
CREATE TABLE profile_decay_config (
  id UUID PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  description TEXT,
  interval_type TEXT NOT NULL,
  interval_days INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Supporting Tables

#### `country_profiling_gaps`
Tracks missing country-specific options for AI generation.

```sql
CREATE TABLE country_profiling_gaps (
  id UUID PRIMARY KEY,
  question_id UUID NOT NULL,
  question_key TEXT NOT NULL,
  question_text TEXT NOT NULL,
  country_code TEXT NOT NULL,
  country_iso TEXT NOT NULL,
  country_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  detected_at TIMESTAMPTZ DEFAULT now(),
  generated_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID,
  admin_feedback TEXT,
  draft_options JSONB,
  confidence_score INTEGER,
  ai_metadata JSONB,
  tenant_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### `auto_approval_config`
AI confidence thresholds for auto-approval.

```sql
CREATE TABLE auto_approval_config (
  id UUID PRIMARY KEY,
  question_key TEXT NOT NULL,
  auto_approve_enabled BOOLEAN DEFAULT false,
  confidence_threshold INTEGER DEFAULT 90,
  require_manual_review BOOLEAN DEFAULT true,
  tenant_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

## Database Functions

### `compute_targeting_metadata()`
Trigger function that automatically computes and caches targeting metadata when answers are inserted/updated.

```sql
CREATE OR REPLACE FUNCTION compute_targeting_metadata()
RETURNS TRIGGER AS $$
DECLARE
  v_question RECORD;
BEGIN
  SELECT question_key, targeting_tags, question_group
  INTO v_question
  FROM profile_questions
  WHERE id = NEW.question_id;
  
  NEW.answer_normalized := CASE
    WHEN NEW.answer_value IS NOT NULL THEN NEW.answer_value
    WHEN NEW.answer_json IS NOT NULL THEN 
      COALESCE(
        NEW.answer_json->>'value',
        NEW.answer_json->>'formatted_address'
      )
    ELSE NULL
  END;
  
  NEW.targeting_metadata := jsonb_build_object(
    'question_key', v_question.question_key,
    'tags', COALESCE(v_question.targeting_tags, ARRAY[]::TEXT[]),
    'group', v_question.question_group
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### `find_users_by_criteria()`
Efficient user targeting based on profile answers.

```sql
CREATE OR REPLACE FUNCTION find_users_by_criteria(
  p_country_code TEXT,
  p_criteria JSONB
)
RETURNS TABLE(user_id UUID, match_score INTEGER) AS $$
BEGIN
  RETURN QUERY
  WITH matching_users AS (
    SELECT 
      pa.user_id,
      COUNT(*) as criteria_matched
    FROM profile_answers pa
    JOIN profiles p ON p.user_id = pa.user_id
    CROSS JOIN LATERAL jsonb_each_text(p_criteria) AS criteria(key, vals)
    WHERE 
      p.country_code = p_country_code
      AND pa.targeting_metadata->>'question_key' = criteria.key
      AND pa.answer_normalized = ANY(
        SELECT jsonb_array_elements_text(criteria.vals::jsonb)
      )
    GROUP BY pa.user_id
  )
  SELECT 
    mu.user_id,
    mu.criteria_matched::INTEGER as match_score
  FROM matching_users mu
  ORDER BY mu.criteria_matched DESC;
END;
$$ LANGUAGE plpgsql;
```

### `get_targeting_values_by_question()`
Get all unique values for a question in a country.

```sql
CREATE OR REPLACE FUNCTION get_targeting_values_by_question(
  p_country_code TEXT,
  p_question_key TEXT
)
RETURNS TABLE(value TEXT, user_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.answer_normalized,
    COUNT(DISTINCT pa.user_id) as user_count
  FROM profile_answers pa
  JOIN profiles p ON p.user_id = pa.user_id
  WHERE 
    p.country_code = p_country_code
    AND pa.targeting_metadata->>'question_key' = p_question_key
  GROUP BY pa.answer_normalized
  ORDER BY user_count DESC;
END;
$$ LANGUAGE plpgsql;
```

## Frontend Architecture

### Custom Hooks

#### `useProfileQuestions()`
Fetches and organizes questions by level and category.

```typescript
const {
  level1Categories,
  level2Categories,
  level3Categories,
  isLoading,
  error,
  refetch
} = useProfileQuestions();
```

#### `useProfileAnswers()`
Manages user answers with optimistic updates.

```typescript
const {
  answers,
  saveAnswer,
  isSaving,
  getAnswer
} = useProfileAnswers();
```

#### `useStaleProfileCheck()`
Detects stale profile data requiring refresh.

```typescript
const {
  hasStaleData,
  staleQuestions,
  staleCount,
  isLoading
} = useStaleProfileCheck();
```

### Component Structure

```
ProfileTab (main container)
└── ProfileHeader (progress, level badges)
└── LevelCompletionAlert (unlock notifications)
└── ProfileCategorySection (per level/category)
    └── QuestionRenderer (per question)
        ├── Text/Textarea inputs
        ├── Select/Multiselect dropdowns
        ├── Date pickers
        ├── AddressAutocomplete
        └── Validation feedback
```

### State Management

Profile data uses React Query for caching and real-time updates:

```typescript
// Fetch questions
const questionsQuery = useQuery({
  queryKey: ['profile_questions'],
  queryFn: async () => {
    const { data } = await supabase
      .from('profile_questions')
      .select(`
        *,
        category:profile_categories(*),
        options:question_answer_options(*),
        user_answer:profile_answers(*)
      `)
      .eq('is_active', true)
      .order('display_order');
    return data;
  }
});

// Save answer
const saveMutation = useMutation({
  mutationFn: async ({ questionId, value }) => {
    return await supabase
      .from('profile_answers')
      .upsert({
        user_id: user.id,
        question_id: questionId,
        answer_value: value,
        last_updated: new Date().toISOString()
      });
  },
  onSuccess: () => {
    queryClient.invalidateQueries(['profile_questions']);
  }
});
```

## Progressive Profiling Logic

### Level Unlocking

```typescript
function canAccessLevel(profile: Profile, level: number): boolean {
  if (level === 1) return true; // Always accessible
  if (level === 2) return profile.profile_level >= 1;
  if (level === 3) return profile.profile_level >= 2;
  return false;
}
```

### Completeness Calculation

```typescript
function calculateCompleteness(level: number, answers: Answer[]): number {
  const requiredQuestions = questions
    .filter(q => q.level === level && q.is_required);
  const answeredRequired = answers
    .filter(a => requiredQuestions.some(q => q.id === a.question_id));
  
  return (answeredRequired.length / requiredQuestions.length) * 100;
}
```

### Level Advancement

```typescript
async function advanceLevel(userId: string, newLevel: number) {
  await supabase
    .from('profiles')
    .update({
      profile_level: newLevel,
      profile_completeness_score: calculateOverallCompleteness()
    })
    .eq('user_id', userId);
  
  // Award reputation points
  await awardReputationForLevelCompletion(userId, newLevel);
}
```

## Country-Specific Logic

### Option Resolution

```typescript
async function getQuestionOptions(
  questionId: string,
  countryCode: string
): Promise<Option[]> {
  // Try country-specific first
  const countryOptions = await supabase
    .from('country_question_options')
    .select('options')
    .eq('question_id', questionId)
    .eq('country_code', countryCode)
    .single();
  
  if (countryOptions.data) {
    return countryOptions.data.options;
  }
  
  // Fall back to global options
  const globalOptions = await supabase
    .from('question_answer_options')
    .select('*')
    .eq('question_id', questionId)
    .eq('is_active', true)
    .order('display_order');
  
  return globalOptions.data || [];
}
```

## Decay System Integration

### Staleness Detection

```typescript
function isAnswerStale(answer: ProfileAnswer, question: ProfileQuestion): boolean {
  if (question.is_immutable) return false;
  if (!question.decay_interval_days) return false;
  
  const daysSinceUpdate = 
    (Date.now() - new Date(answer.last_updated).getTime()) / (1000 * 60 * 60 * 24);
  
  return daysSinceUpdate > question.decay_interval_days;
}
```

### Refresh Notifications

Stale data triggers:
- Dashboard alerts
- Email reminders (based on communication preferences)
- Reputation point opportunities for updates

## AI Integration

### Gap Detection

Automatically identifies missing country options:

```typescript
async function detectCountryGaps() {
  const questions = await getCountrySpecificQuestions();
  const countries = await getActiveCountries();
  
  for (const question of questions) {
    for (const country of countries) {
      const hasOptions = await checkCountryOptions(question.id, country.code);
      if (!hasOptions) {
        await createGapRecord(question, country);
      }
    }
  }
}
```

### Option Generation

Uses AI provider to generate localized options:

```typescript
async function generateCountryOptions(
  questionText: string,
  countryName: string,
  globalOptions: Option[]
): Promise<Option[]> {
  const prompt = buildGenerationPrompt(questionText, countryName, globalOptions);
  const response = await callAIProvider(prompt);
  return parseGeneratedOptions(response);
}
```

See [Auto-Scaling System](AUTO_SCALING_SYSTEM.md) for full AI implementation.

## Performance Optimizations

### Indexing Strategy

```sql
CREATE INDEX idx_profile_answers_user_question 
  ON profile_answers(user_id, question_id);

CREATE INDEX idx_profile_answers_targeting 
  ON profile_answers USING GIN(targeting_metadata);

CREATE INDEX idx_profile_questions_level_active 
  ON profile_questions(level, is_active) 
  WHERE is_active = true;
```

### Caching

- Question metadata cached client-side (React Query, 5 min stale time)
- User answers cached and updated optimistically
- Country options cached per session

### Lazy Loading

- Level 2/3 questions loaded on-demand
- Category sections collapsed by default
- Images and icons lazy-loaded

## Security

### Row Level Security (RLS)

```sql
-- Users can only view/edit own answers
CREATE POLICY users_own_answers ON profile_answers
  FOR ALL USING (user_id = auth.uid());

-- Everyone can view active questions
CREATE POLICY view_active_questions ON profile_questions
  FOR SELECT USING (is_active = true);

-- Only admins can manage questions
CREATE POLICY admin_manage_questions ON profile_questions
  FOR ALL USING (has_role(auth.uid(), 'admin'));
```

### Data Validation

- Client-side validation for immediate feedback
- Server-side validation in database triggers
- Type checking with TypeScript
- Sanitization of all inputs

## Monitoring & Analytics

### Key Metrics

- Completion rate per level
- Average time per question
- Skip rate per question
- Stale data refresh rate
- Country option coverage

### Instrumentation

```typescript
import { analytics } from '@/utils/analytics';

analytics.track('profile_question_answered', {
  questionKey: question.key,
  level: question.level,
  timeSpent: elapsed,
  wasStale: answer.is_stale
});
```

## Testing Strategy

### Unit Tests
- Hook logic
- Validation functions
- Staleness calculations

### Integration Tests
- Question flow end-to-end
- Answer persistence
- Level advancement

### E2E Tests
- Full profile completion
- Country-specific flows
- Decay and refresh flows

## Deployment Considerations

### Database Migrations
- Use versioned migration files
- Test on staging before production
- Backup before schema changes

### Feature Flags
- Roll out new questions gradually
- A/B test question phrasing
- Control AI generation access

### Rollback Plan
- Keep previous question versions
- Maintain answer history
- Graceful degradation for missing options

## Future Enhancements

- Dynamic question branching based on previous answers
- Machine learning for optimal question sequencing
- Real-time collaboration for multi-user households
- Voice input for accessibility
- Video question formats

## Additional Resources

- [Level Strategy](LEVEL_STRATEGY.md) - Profiling level design
- [Integration Guide](INTEGRATION_GUIDE.md) - Integrating with other features
- [Admin Guide](ADMIN_GUIDE.md) - Admin portal usage

## Support

For technical questions, contact the development team or consult the [Integration Guide](INTEGRATION_GUIDE.md).
