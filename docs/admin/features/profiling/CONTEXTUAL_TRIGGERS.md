---
id: "profiling-contextual-triggers"
title: "Contextual Question Triggering System"
category: "Profiling System"
description: "Smart question triggering based on user context, behavior, and previous answers for optimized data collection"
audience: "admin"
tags: ["profiling", "automation", "targeting", "intelligence"]
status: "published"
version: "1.0"
created_at: "2024-01-15"
updated_at: "2024-01-15"
---

# Contextual Triggers

## Overview

Contextual triggers enable smart, adaptive profiling by dynamically showing or hiding questions based on user behavior, previous answers, and external conditions. This reduces survey fatigue while maintaining high data quality.

## Core Concepts

### Static vs Dynamic Questions

**Static Questions** (Always visible):
- Core demographics (age, gender, location)
- Universal preferences
- Essential profile data

**Dynamic Questions** (Conditionally visible):
- Follow-up questions based on previous answers
- Behavior-triggered questions
- Time-based refreshes
- Activity-triggered prompts

### Trigger Types

```
┌─────────────────────────────────────────────────────┐
│  Trigger Types                                      │
├─────────────────────────────────────────────────────┤
│  1. Answer-Based    → Show Q2 if Q1 = "Yes"        │
│  2. Profile-Based   → Show if Level ≥ 2            │
│  3. Behavior-Based  → Show after 5 surveys          │
│  4. Time-Based      → Show every 30 days            │
│  5. Event-Based     → Show on badge unlock          │
│  6. Campaign-Based  → Show for specific surveys     │
└─────────────────────────────────────────────────────┘
```

## Answer-Based Triggers

### Simple Dependency

Show follow-up questions based on answers:

**Example: Employment Status**

```typescript
// Primary question
{
  id: "employment_status",
  text: "What is your employment status?",
  options: ["Employed", "Self-employed", "Unemployed", "Student", "Retired"],
  triggers: [
    {
      answerValue: "Employed",
      showQuestions: ["company_size", "industry", "job_role"]
    },
    {
      answerValue: "Self-employed",
      showQuestions: ["business_type", "years_in_business"]
    },
    {
      answerValue: "Student",
      showQuestions: ["university_name", "field_of_study", "year_of_study"]
    }
  ]
}

// Triggered questions (only shown conditionally)
{
  id: "company_size",
  text: "How many employees does your company have?",
  trigger_condition: "employment_status == 'Employed'",
  options: ["1-10", "11-50", "51-200", "201-1000", "1000+"]
}
```

### Multi-Answer Triggers

Show questions based on multiple answers:

```typescript
{
  id: "parenting_questions",
  text: "How many children under 18 live in your household?",
  trigger_condition: {
    AND: [
      "age >= 18",
      "household_size >= 2"
    ]
  },
  options: ["0", "1", "2", "3", "4+"]
}
```

### Logical Operators

Support complex trigger logic:

```typescript
// OR condition
trigger_condition: {
  OR: [
    "employment_status == 'Employed'",
    "employment_status == 'Self-employed'"
  ]
}

// AND condition
trigger_condition: {
  AND: [
    "age >= 25",
    "household_income >= '$50,000'"
  ]
}

// NOT condition
trigger_condition: {
  NOT: "student_status == 'Full-time student'"
}

// Complex nesting
trigger_condition: {
  AND: [
    "country_code == 'ZA'",
    {
      OR: [
        "age >= 25",
        "employment_status == 'Employed'"
      ]
    }
  ]
}
```

## Profile-Based Triggers

### Level-Gated Questions

Show questions only when users reach certain profile levels:

```typescript
{
  id: "investment_preferences",
  text: "Which investment products do you use?",
  trigger_condition: "profile_level >= 2",
  category: "Level 2: Financial",
  options: ["Stocks", "Bonds", "Mutual Funds", "Crypto", "Real Estate", "None"]
}
```

### Reputation-Gated Questions

Unlock detailed questions for high-reputation users:

```typescript
{
  id: "detailed_tech_stack",
  text: "Which programming languages do you use professionally?",
  trigger_condition: "reputation_score >= 500",
  note: "Premium question - unlocked at 500 reputation",
  options: ["JavaScript", "Python", "Java", "C#", "Go", "Rust", "Other"]
}
```

## Behavior-Based Triggers

### Activity Thresholds

Trigger questions after specific user activities:

```typescript
{
  id: "survey_experience_feedback",
  text: "How would you rate your survey experience so far?",
  trigger_condition: {
    AND: [
      "surveys_completed >= 5",
      "NOT answered:survey_experience_feedback"
    ]
  },
  display_mode: "interstitial", // Show between surveys
  options: ["Excellent", "Good", "Fair", "Poor"]
}
```

### Earning Milestones

Show questions at earning milestones:

```typescript
{
  id: "redemption_preferences",
  text: "How do you prefer to redeem your earnings?",
  trigger_condition: {
    AND: [
      "lifetime_earnings >= 50",
      "redemptions_count == 0"
    ]
  },
  timing: "before_first_redemption",
  options: ["Bank transfer", "Mobile money", "Gift cards", "Donate to charity"]
}
```

## Time-Based Triggers

### Periodic Refresh

Re-ask questions periodically to keep data fresh:

```typescript
{
  id: "mobile_network_provider",
  text: "Which mobile network do you currently use?",
  decay_config: "short_term", // 30 days
  refresh_trigger: {
    type: "time_elapsed",
    interval_days: 90,
    prompt_text: "Has your mobile network provider changed?",
    skip_if_no_change: true
  }
}
```

### Seasonal Questions

Show questions during specific time periods:

```typescript
{
  id: "holiday_shopping_intentions",
  text: "Are you planning to shop for holiday gifts this year?",
  trigger_condition: {
    date_range: {
      start: "11-01", // November 1st
      end: "12-25"    // December 25th
    },
    OR: "answered_date < current_year"
  },
  options: ["Yes, planning", "Maybe", "No plans"]
}
```

## Event-Based Triggers

### Badge Unlock Triggers

Show questions when users unlock badges:

```typescript
// User unlocks "Survey Master" badge
{
  event: "badge_unlocked",
  badge_id: "survey_master",
  triggered_questions: ["advanced_survey_preferences"],
  display_mode: "inline_celebration",
  message: "🎉 Congrats on Survey Master! Help us serve you better:"
}
```

### Level Advancement Triggers

Ask questions when users advance levels:

```typescript
{
  event: "level_advanced",
  from_level: 1,
  to_level: 2,
  triggered_questions: [
    "interests_hobbies",
    "brand_preferences",
    "shopping_frequency"
  ],
  display_mode: "onboarding_flow",
  message: "Level 2 unlocked! Let's personalize your experience:"
}
```

## Campaign-Based Triggers

### Survey-Specific Profiling

Ask additional questions when users accept specific surveys:

```typescript
{
  id: "automotive_ownership",
  text: "Do you own a car?",
  trigger_condition: {
    survey_invitation: {
      category: "automotive",
      min_reward: 10.00
    }
  },
  timing: "before_survey_start",
  cached: true, // Cache answer for future automotive surveys
  options: ["Yes", "No", "Planning to buy within 6 months"]
}
```

### Just-In-Time Profiling

Ask questions right before qualifying for high-value surveys:

```typescript
{
  id: "smartphone_brand",
  text: "Which smartphone brand do you use?",
  trigger_mode: "just_in_time",
  trigger_condition: {
    survey_available: {
      requires_answer: "smartphone_brand",
      reward_amount: ">= 15.00"
    }
  },
  message: "Quick question to unlock a premium survey!",
  options: ["Apple", "Samsung", "Xiaomi", "OPPO", "Other"]
}
```

## Implementation

### Database Schema

```sql
-- Store trigger conditions
CREATE TABLE question_triggers (
  id UUID PRIMARY KEY,
  question_id UUID REFERENCES profile_questions(id),
  trigger_type TEXT CHECK (trigger_type IN (
    'answer_based', 
    'profile_based', 
    'behavior_based', 
    'time_based', 
    'event_based',
    'campaign_based'
  )),
  condition_json JSONB NOT NULL,
  priority INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast trigger evaluation
CREATE INDEX idx_triggers_active 
  ON question_triggers(active, priority) 
  WHERE active = true;
```

### Trigger Evaluation Engine

```typescript
class TriggerEvaluator {
  async shouldShowQuestion(
    questionId: string, 
    userId: string
  ): Promise<boolean> {
    const triggers = await this.getTriggersForQuestion(questionId);
    const userContext = await this.getUserContext(userId);
    
    for (const trigger of triggers) {
      const result = await this.evaluateTrigger(trigger, userContext);
      if (!result) return false; // Any failed trigger hides question
    }
    
    return true; // All triggers passed
  }
  
  private async evaluateTrigger(
    trigger: QuestionTrigger, 
    context: UserContext
  ): Promise<boolean> {
    switch (trigger.type) {
      case 'answer_based':
        return this.evaluateAnswerTrigger(trigger, context);
      case 'profile_based':
        return this.evaluateProfileTrigger(trigger, context);
      case 'behavior_based':
        return this.evaluateBehaviorTrigger(trigger, context);
      case 'time_based':
        return this.evaluateTimeTrigger(trigger, context);
      case 'event_based':
        return this.evaluateEventTrigger(trigger, context);
      case 'campaign_based':
        return this.evaluateCampaignTrigger(trigger, context);
      default:
        return false;
    }
  }
  
  private evaluateAnswerTrigger(
    trigger: QuestionTrigger, 
    context: UserContext
  ): boolean {
    const condition = trigger.condition_json;
    
    if (condition.AND) {
      return condition.AND.every(c => this.evaluateCondition(c, context));
    }
    if (condition.OR) {
      return condition.OR.some(c => this.evaluateCondition(c, context));
    }
    if (condition.NOT) {
      return !this.evaluateCondition(condition.NOT, context);
    }
    
    return this.evaluateCondition(condition, context);
  }
}
```

### Frontend Integration

```typescript
// React hook for dynamic question rendering
function useConditionalQuestions(category: string, userId: string) {
  const [visibleQuestions, setVisibleQuestions] = useState<Question[]>([]);
  
  useEffect(() => {
    async function evaluateQuestions() {
      const allQuestions = await fetchQuestions(category);
      const evaluator = new TriggerEvaluator();
      
      const visible = [];
      for (const question of allQuestions) {
        const shouldShow = await evaluator.shouldShowQuestion(
          question.id, 
          userId
        );
        if (shouldShow) {
          visible.push(question);
        }
      }
      
      setVisibleQuestions(visible);
    }
    
    evaluateQuestions();
  }, [category, userId]);
  
  return visibleQuestions;
}
```

## Best Practices

### 1. Avoid Deep Nesting

❌ **Bad**: 5-level deep question dependencies
✅ **Good**: Maximum 2-3 levels deep

### 2. Provide Skip Options

Always allow users to skip conditional questions:

```typescript
{
  id: "company_size",
  trigger_condition: "employment_status == 'Employed'",
  skippable: true,
  skip_label: "Prefer not to say"
}
```

### 3. Test Trigger Logic

Thoroughly test trigger conditions:

```typescript
// Unit test example
test('employment follow-up triggers', async () => {
  const context = {
    answers: { employment_status: 'Employed' },
    profile_level: 2
  };
  
  const shouldShow = await evaluator.shouldShowQuestion(
    'company_size',
    context
  );
  
  expect(shouldShow).toBe(true);
});
```

### 4. Monitor Trigger Performance

Track these metrics:
- **Trigger Fire Rate**: How often triggers activate
- **Completion Rate**: % of users completing triggered questions
- **Time Impact**: Average time added by triggered questions

### 5. Graceful Failures

Handle trigger evaluation errors:

```typescript
try {
  const shouldShow = await evaluator.shouldShowQuestion(questionId, userId);
  return shouldShow;
} catch (error) {
  console.error('Trigger evaluation failed:', error);
  // Fail open: show question by default
  return true;
}
```

## Related Documentation

- [Admin Guide](ADMIN_GUIDE.md)
- [Question Builder Guide](QUESTION_BUILDER_GUIDE.md)
- [Architecture](ARCHITECTURE.md)
- [Level Strategy](LEVEL_STRATEGY.md)
