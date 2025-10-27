---
id: "profiling-integration"
title: "Profiling Integration Guide"
category: "Technical Reference"
description: "Technical integration guide for profiling system"
audience: "admin"
tags: ["profiling", "integration", "api", "technical"]
status: "published"
---

# Profiling Integration Guide

## Overview

This guide explains how to integrate the Looplly profiling system into other features and services, including survey distribution, targeting, badges, and external integrations.

## Core Integration Patterns

### 1. Survey Targeting

Use profile data to match users with relevant surveys:

```typescript
import { findUsersByCriteria } from '@/services/profileTargetingService';

async function findEligibleUsers(surveyRequirements: SurveyTargeting) {
  const eligibleUsers = await findUsersByCriteria({
    country_code: surveyRequirements.targetCountry,
    criteria: {
      age_range: surveyRequirements.ageRange,
      gender: surveyRequirements.gender,
      employment_status: surveyRequirements.employmentStatus,
      // ... additional criteria
    },
    profile_level: surveyRequirements.minProfileLevel,
    profile_freshness_days: 180 // Only users with fresh profiles
  });
  
  return eligibleUsers;
}
```

### 2. Profile Completeness Checks

Verify profile completeness before enabling features:

```typescript
import { calculateCompleteness } from '@/utils/profile';

function canAccessFeature(user: User, requiredLevel: ProfileLevel): boolean {
  const completeness = calculateCompleteness(user.profileAnswers);
  
  return (
    completeness.level >= requiredLevel &&
    completeness.percentage >= 80 // Minimum 80% complete
  );
}

// Usage
if (canAccessFeature(user, 2)) {
  // Enable referral program
  enableReferrals(user);
}
```

### 3. Dynamic Question Rendering

Render profile questions in any component:

```typescript
import { useProfileQuestions } from '@/hooks/useProfileQuestions';
import { QuestionRenderer } from '@/components/dashboard/profile/QuestionRenderer';

function CustomProfileFlow() {
  const { questions, loading } = useProfileQuestions({
    category: 'lifestyle',
    level: 2
  });
  
  if (loading) return <Loader />;
  
  return (
    <div>
      {questions.map(question => (
        <QuestionRenderer
          key={question.id}
          question={question}
          onAnswer={handleAnswer}
        />
      ))}
    </div>
  );
}
```

## Integration Points

### Badge System Integration

Award badges based on profile completion:

```typescript
import { checkAndAwardBadges } from '@/services/badgeService';

async function onProfileQuestionAnswered(userId: string, questionId: string) {
  // Save answer
  await saveProfileAnswer(userId, questionId, answer);
  
  // Check for profile completion badges
  await checkAndAwardBadges(userId, {
    trigger: 'profile_completion',
    metadata: {
      profile_level: user.profile_level,
      completeness: user.profile_completeness_score
    }
  });
}

// Badge definitions in database
{
  id: "profile_explorer",
  name: "Profile Explorer",
  description: "Complete 50% of your Level 1 profile",
  trigger_type: "profile_completion",
  trigger_conditions: {
    profile_level: 1,
    completeness_percentage: 50
  }
}
```

### Reputation Integration

Award reputation for profile actions:

```typescript
import { awardReputation } from '@/services/reputationService';

async function handleProfileAction(userId: string, action: ProfileAction) {
  let reputationPoints = 0;
  let reason = '';
  
  switch (action.type) {
    case 'level_completed':
      reputationPoints = action.level === 1 ? 50 : action.level === 2 ? 150 : 300;
      reason = `Completed Level ${action.level} profile`;
      break;
      
    case 'stale_data_refreshed':
      reputationPoints = 10;
      reason = 'Updated stale profile data';
      break;
      
    case 'category_completed':
      reputationPoints = 25;
      reason = `Completed ${action.categoryName} category`;
      break;
  }
  
  if (reputationPoints > 0) {
    await awardReputation(userId, reputationPoints, reason);
  }
}
```

### Survey Platform Integration

#### Cint Integration

Map profile data to Cint targeting variables:

```typescript
import { mapProfileToCintVariables } from '@/integrations/cint';

async function buildCintTargeting(userId: string): Promise<CintTargeting> {
  const profileAnswers = await getProfileAnswers(userId);
  
  return mapProfileToCintVariables({
    age: profileAnswers.date_of_birth,
    gender: profileAnswers.gender,
    country: profileAnswers.country_code,
    employment: profileAnswers.employment_status,
    income: profileAnswers.household_income,
    // ... map additional fields
  });
}
```

#### Custom Survey Platform

Integrate with any survey platform:

```typescript
interface SurveyPlatformAdapter {
  getAvailableSurveys(userId: string): Promise<Survey[]>;
  checkEligibility(userId: string, surveyId: string): Promise<boolean>;
  submitResponse(userId: string, surveyId: string, responses: any): Promise<void>;
}

class CustomSurveyAdapter implements SurveyPlatformAdapter {
  async getAvailableSurveys(userId: string): Promise<Survey[]> {
    const userProfile = await getProfileAnswers(userId);
    
    // Call external API with profile data
    const surveys = await fetch('/api/surveys', {
      method: 'POST',
      body: JSON.stringify({
        targeting: {
          demographics: mapDemographics(userProfile),
          interests: mapInterests(userProfile),
          behavior: mapBehavior(userProfile)
        }
      })
    });
    
    return surveys.json();
  }
  
  async checkEligibility(userId: string, surveyId: string): Promise<boolean> {
    const requirements = await getSurveyRequirements(surveyId);
    const userProfile = await getProfileAnswers(userId);
    
    return meetsAllRequirements(userProfile, requirements);
  }
}
```

## Data Export & Webhooks

### Exporting Profile Data

```typescript
async function exportUserProfile(userId: string): Promise<ProfileExport> {
  const profile = await getProfile(userId);
  const answers = await getProfileAnswers(userId);
  
  return {
    user_id: userId,
    profile_level: profile.profile_level,
    completeness: profile.profile_completeness_score,
    demographics: {
      age: calculateAge(answers.date_of_birth),
      gender: answers.gender,
      location: answers.location,
      country_code: profile.country_code
    },
    lifestyle: {
      employment_status: answers.employment_status,
      industry: answers.industry,
      education: answers.education_level,
      income_range: answers.household_income
    },
    interests: {
      hobbies: answers.hobbies,
      brands: answers.favorite_brands,
      media: answers.media_preferences
    },
    metadata: {
      last_updated: profile.updated_at,
      freshness_score: calculateFreshnessScore(answers)
    }
  };
}
```

### Webhook Integration

Send profile updates to external services:

```typescript
interface ProfileWebhook {
  url: string;
  events: ProfileEvent[];
  headers?: Record<string, string>;
}

async function triggerProfileWebhook(
  userId: string,
  event: ProfileEvent,
  webhooks: ProfileWebhook[]
) {
  const payload = {
    event_type: event,
    user_id: userId,
    timestamp: new Date().toISOString(),
    data: await exportUserProfile(userId)
  };
  
  for (const webhook of webhooks) {
    if (webhook.events.includes(event)) {
      await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...webhook.headers
        },
        body: JSON.stringify(payload)
      });
    }
  }
}

// Usage
await triggerProfileWebhook(userId, 'level_completed', configuredWebhooks);
```

## Privacy & Compliance

### GDPR Compliance

Implement data access and deletion:

```typescript
// User data export (GDPR Article 15)
async function exportUserData(userId: string): Promise<GDPRExport> {
  return {
    personal_data: await exportUserProfile(userId),
    profile_history: await getProfileHistory(userId),
    consents: await getUserConsents(userId),
    export_date: new Date().toISOString()
  };
}

// Right to be forgotten (GDPR Article 17)
async function deleteUserProfile(userId: string): Promise<void> {
  await deleteProfileAnswers(userId);
  await deleteProfileHistory(userId);
  await anonymizeUserData(userId);
}

// Consent management
async function updateConsentPreferences(
  userId: string,
  consents: ConsentPreferences
): Promise<void> {
  await saveConsentPreferences(userId, {
    profiling_enabled: consents.profiling_enabled,
    data_sharing_enabled: consents.data_sharing_enabled,
    targeting_enabled: consents.targeting_enabled,
    updated_at: new Date()
  });
  
  // If profiling disabled, stop showing questions
  if (!consents.profiling_enabled) {
    await pauseProfilingForUser(userId);
  }
}
```

## Analytics Integration

### Track Profile Metrics

```typescript
import { trackEvent } from '@/utils/analytics';

// Track question answered
trackEvent('profile_question_answered', {
  question_id: questionId,
  question_key: question.question_key,
  category: question.category,
  level: question.level,
  time_to_answer_ms: answerTime
});

// Track level advancement
trackEvent('profile_level_advanced', {
  from_level: previousLevel,
  to_level: newLevel,
  completeness_percentage: completeness,
  time_since_signup_days: daysSinceSignup
});

// Track decay refresh
trackEvent('stale_profile_refreshed', {
  question_key: question.question_key,
  days_since_last_update: daysSinceUpdate,
  answer_changed: answerChanged
});
```

## Testing Integrations

### Mock Profile Data

```typescript
// Test helper: Generate mock profile
function createMockProfile(overrides?: Partial<Profile>): Profile {
  return {
    user_id: 'test-user-123',
    profile_level: 2,
    profile_completeness_score: 75,
    country_code: 'ZA',
    date_of_birth: '1990-01-15',
    gender: 'male',
    employment_status: 'Employed',
    ...overrides
  };
}

// Test helper: Mock profile service
class MockProfileService {
  private mockAnswers: Map<string, any> = new Map();
  
  async getProfileAnswers(userId: string) {
    return this.mockAnswers.get(userId) || {};
  }
  
  setMockAnswer(userId: string, questionKey: string, value: any) {
    const answers = this.mockAnswers.get(userId) || {};
    answers[questionKey] = value;
    this.mockAnswers.set(userId, answers);
  }
}

// Usage in tests
test('survey targeting with profile data', async () => {
  const mockService = new MockProfileService();
  mockService.setMockAnswer('user-1', 'age', 25);
  mockService.setMockAnswer('user-1', 'gender', 'female');
  
  const eligible = await checkSurveyEligibility('user-1', 'survey-123');
  expect(eligible).toBe(true);
});
```

## Error Handling

### Graceful Degradation

```typescript
async function getProfileDataWithFallback(
  userId: string
): Promise<ProfileData> {
  try {
    // Try to get full profile
    return await getProfileAnswers(userId);
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    
    // Return basic profile from cache
    return await getCachedProfile(userId);
  }
}

// Use in targeting
async function matchSurvey(userId: string, survey: Survey): Promise<boolean> {
  try {
    const profile = await getProfileDataWithFallback(userId);
    return evaluateTargeting(profile, survey.targeting);
  } catch (error) {
    console.error('Profile matching failed:', error);
    // Fail open: allow user to attempt survey
    return true;
  }
}
```

## Related Documentation

- [Architecture](ARCHITECTURE.md)
- [Admin Guide](ADMIN_GUIDE.md)
- [User Guide](USER_GUIDE.md)
- [Level Strategy](LEVEL_STRATEGY.md)
