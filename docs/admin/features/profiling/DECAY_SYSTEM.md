---
id: "profiling-decay-system"
title: "Profile Decay System"
category: "Profiling System"
description: "Profile staleness tracking and refresh mechanisms to maintain data quality over time"
audience: "admin"
tags: ["profiling", "decay", "data-quality", "automation"]
status: "published"
version: "1.0"
created_at: "2024-01-15"
updated_at: "2024-01-15"
---

# Profile Decay System

## Overview

The Profile Decay System ensures data freshness by automatically marking profile answers as "stale" after configurable time intervals. Fresh data improves survey targeting accuracy and user earning potential.

## Why Profile Decay Matters

### For Users
- Stale data reduces survey invitations
- Fresh profiles get priority matching
- Updating stale data earns reputation points
- Maintains high earning potential

### For Business
- Accurate targeting reduces screening costs
- Higher survey completion rates
- Better data quality for research partners
- Compliance with data accuracy requirements

### For Research Partners
- Confidence in data recency
- Reduced survey disqualifications
- Higher quality responses
- Better ROI on research spend

## Decay Configuration

### Predefined Decay Intervals

#### `immutable` (Never Expires)
**Use For:**
- Date of Birth
- Gender (in most cases)
- Race/Ethnicity
- Place of Birth

**Rationale:** Demographic constants that rarely or never change.

---

#### `short_term` (30 Days)
**Use For:**
- Current employment status
- Job title
- Current income
- Recent purchases (last 30 days)
- Temporary living situation

**Rationale:** Information that changes frequently or becomes outdated quickly.

**User Experience:**
- Monthly refresh notifications
- Highest refresh frequency
- Priority for targeting accuracy

---

#### `medium_term` (180 Days / 6 Months)
**Use For:**
- Brand preferences
- Shopping habits
- Lifestyle interests
- Technology ownership
- Health and wellness habits
- Media consumption patterns

**Rationale:** Preferences and behaviors that evolve but not rapidly.

**User Experience:**
- Bi-annual refresh prompts
- Balanced refresh burden
- Moderate impact on targeting

---

#### `long_term` (365 Days / 1 Year)
**Use For:**
- Education level
- Marital status
- Homeownership
- Number of children
- General attitudes and values
- Long-term hobbies

**Rationale:** Life circumstances that change infrequently.

**User Experience:**
- Annual refresh reminders
- Low refresh burden
- Minimal but important accuracy maintenance

## Technical Implementation

### Database Schema

#### Decay Configuration Table
```sql
CREATE TABLE profile_decay_config (
  id UUID PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  description TEXT,
  interval_type TEXT NOT NULL,
  interval_days INTEGER,
  is_active BOOLEAN DEFAULT true
);
```

**Example Data:**
```sql
INSERT INTO profile_decay_config (config_key, interval_type, interval_days) VALUES
  ('immutable', 'never', NULL),
  ('short_term', 'days', 30),
  ('medium_term', 'days', 180),
  ('long_term', 'days', 365);
```

#### Question Configuration
Each question references a decay config:

```sql
ALTER TABLE profile_questions 
  ADD COLUMN decay_config_key TEXT REFERENCES profile_decay_config(config_key);
```

#### Answer Staleness Tracking
```sql
ALTER TABLE profile_answers
  ADD COLUMN last_updated TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN is_stale BOOLEAN DEFAULT false;
```

### Staleness Calculation

#### Server-Side Function
```sql
CREATE OR REPLACE FUNCTION check_answer_staleness(
  answer_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
  v_answer RECORD;
  v_question RECORD;
  v_decay_config RECORD;
  v_days_since_update INTEGER;
BEGIN
  -- Get answer details
  SELECT * INTO v_answer FROM profile_answers WHERE id = answer_id;
  
  -- Get question details
  SELECT * INTO v_question FROM profile_questions WHERE id = v_answer.question_id;
  
  -- If question is immutable, never stale
  IF v_question.is_immutable THEN
    RETURN false;
  END IF;
  
  -- Get decay config
  SELECT * INTO v_decay_config 
  FROM profile_decay_config 
  WHERE config_key = v_question.decay_config_key;
  
  -- If no decay config or immutable type, not stale
  IF v_decay_config IS NULL OR v_decay_config.interval_type = 'never' THEN
    RETURN false;
  END IF;
  
  -- Calculate days since update
  v_days_since_update := EXTRACT(DAY FROM (NOW() - v_answer.last_updated));
  
  -- Compare with interval
  RETURN v_days_since_update > v_decay_config.interval_days;
END;
$$ LANGUAGE plpgsql;
```

#### Client-Side Hook
```typescript
export const useStaleProfileCheck = () => {
  const { level2Categories, level3Categories, isLoading } = useProfileQuestions();
  const { isTeamMember } = useUserType();
  
  if (isTeamMember()) {
    return {
      hasStaleData: false,
      staleQuestions: [],
      staleCount: 0,
      isLoading: false
    };
  }
  
  const allQuestions = [
    ...level2Categories.flatMap(c => c.questions),
    ...level3Categories.flatMap(c => c.questions)
  ];
  
  const staleQuestions = allQuestions.filter(q => {
    if (q.is_immutable) return false;
    if (!q.user_answer?.answer_value && !q.user_answer?.answer_json) return false;
    if (!q.decay_interval_days) return false;
    
    const lastUpdated = new Date(q.user_answer.last_updated);
    const daysSinceUpdate = (Date.now() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceUpdate > q.decay_interval_days;
  });
  
  return {
    hasStaleData: staleQuestions.length > 0,
    staleQuestions,
    staleCount: staleQuestions.length,
    isLoading
  };
};
```

## User Experience

### Visual Indicators

#### Dashboard Alert
```tsx
{hasStaleData && (
  <Alert variant="warning">
    <AlertTriangle className="h-4 w-4" />
    <AlertTitle>Profile Data Needs Updating</AlertTitle>
    <AlertDescription>
      You have {staleCount} outdated answer{staleCount > 1 ? 's' : ''}.
      Update now to maintain high earning potential.
    </AlertDescription>
    <Button onClick={() => navigate('/profile')}>
      Update Profile
    </Button>
  </Alert>
)}
```

#### Profile Tab Badges
```tsx
<CategoryCard>
  {category.staleCount > 0 && (
    <Badge variant="warning">
      {category.staleCount} Stale
    </Badge>
  )}
</CategoryCard>
```

#### Question-Level Indicators
```tsx
<QuestionCard>
  {question.isStale && (
    <div className="flex items-center gap-2 text-warning">
      <Clock className="h-4 w-4" />
      <span className="text-sm">
        Last updated {daysAgo} days ago - Please refresh
      </span>
    </div>
  )}
</QuestionCard>
```

### Notification Strategy

#### In-App Notifications
- **First Notice:** When data becomes stale
- **Reminder:** 7 days after first notice
- **Final Reminder:** 30 days after first notice
- **Impact Notice:** "Your earning potential has dropped by X%"

#### Email Notifications
(Based on user communication preferences)

- **Monthly Digest:** Summary of stale data
- **Urgent:** When critical data (employment, income) is stale >60 days
- **Opportunity:** "Update now and earn +X reputation points"

#### Push Notifications
(Mobile app only, based on preferences)

- **Gentle Reminder:** "Quick check-in on your profile"
- **Earning Impact:** "Freshen your profile to get more surveys"

### Refresh Incentives

#### Reputation Points

| Timing | Points | Condition |
|--------|--------|-----------|
| Within 7 days | +25 | Per question |
| Within 30 days | +15 | Per question |
| After 30 days | +10 | Per question |
| Bulk refresh (5+ questions) | +50 bonus | One-time |
| 100% fresh for 90 days | +100 bonus + badge | Quarterly |

#### Survey Priority Boost
- Fresh profiles get 1.5x priority weight in survey distribution
- Profiles with <5% stale data: High priority
- Profiles with 5-20% stale data: Medium priority
- Profiles with >20% stale data: Low priority

## Admin Management

### Decay Configuration Dashboard

**View All Configurations:**
```
Admin Portal → Profile Decay
```

**Fields Displayed:**
- Config Key
- Description
- Interval Type
- Interval Days
- Questions Using This Config
- Active Status

**Create New Configuration:**
1. Click "Add Decay Config"
2. Enter unique config_key (e.g., `quarterly`)
3. Add description
4. Select interval type (`days`, `weeks`, `months`, `never`)
5. Enter interval value
6. Set active status
7. Save

**Assign to Questions:**
1. Navigate to Profile Questions
2. Edit question
3. Select decay config from dropdown
4. Save

### Monitoring Staleness

**Dashboard Metrics:**
- % of users with stale data
- Average stale question count per user
- Most frequently stale questions
- Refresh rate (% updated within 30 days)

**Report Views:**
```sql
-- Users with stale data
SELECT 
  p.user_id,
  p.email,
  COUNT(CASE WHEN pa.is_stale THEN 1 END) as stale_count,
  p.profile_level
FROM profiles p
LEFT JOIN profile_answers pa ON pa.user_id = p.user_id
GROUP BY p.user_id, p.email, p.profile_level
HAVING COUNT(CASE WHEN pa.is_stale THEN 1 END) > 0
ORDER BY stale_count DESC;

-- Most stale questions
SELECT 
  pq.question_text,
  pq.question_key,
  COUNT(*) as stale_user_count
FROM profile_questions pq
JOIN profile_answers pa ON pa.question_id = pq.id
WHERE pa.is_stale = true
GROUP BY pq.id, pq.question_text, pq.question_key
ORDER BY stale_user_count DESC;
```

### Bulk Refresh Campaigns

**Scenario:** Major data quality initiative

**Process:**
1. Identify target user segment (e.g., Silver+ tier with stale data)
2. Create targeted email campaign
3. Offer bonus incentive (e.g., 2x refresh points for next 7 days)
4. Track refresh rates
5. Send follow-up to non-responders

**Email Template:**
```
Subject: Boost Your Earnings: Update Your Profile

Hi [First Name],

We noticed some of your profile data needs a quick refresh. 
Update now and earn DOUBLE reputation points!

Stale Questions: [X]
Potential Bonus: +[Y] reputation points

This offer expires in 7 days.

[Update Now Button]
```

## Impact on Survey Matching

### Targeting Algorithm Adjustment

```typescript
function calculateUserMatchScore(
  user: User,
  surveyTargeting: SurveyTargeting
): number {
  let baseScore = 0;
  
  // Calculate match score based on targeting criteria
  baseScore = calculateCriteriaMatch(user, surveyTargeting);
  
  // Apply freshness penalty
  const stalePercentage = user.stale_question_count / user.total_questions;
  const freshnessMultiplier = Math.max(0.4, 1 - stalePercentage);
  
  const adjustedScore = baseScore * freshnessMultiplier;
  
  return adjustedScore;
}
```

**Example:**
- User A: 100% fresh profile, base match score 90 → Final score: 90
- User B: 30% stale profile, base match score 90 → Final score: 63
- User B gets 30% fewer survey invitations despite same demographic match

### Survey Screener Optimization

Fresh profiles enable skip-ahead logic:
- Question already answered recently → Skip screener question
- Reduces survey length by 20-40%
- Improves user experience and completion rates

## Special Cases

### Country Relocation
When a user changes country:
- All country-specific answers marked stale immediately
- User prompted to re-answer country-specific questions
- Global answers remain valid

### Major Life Events
Recommended manual triggers for staleness:
- Job change → Mark employment-related answers stale
- Moved house → Mark location-related answers stale
- New baby → Mark household-related answers stale
- Graduated → Mark education-related answers stale

### Seasonal Variations
Some questions may have seasonal decay:
- Holiday shopping habits (December-January)
- Summer travel plans (June-August)
- Back-to-school spending (August-September)

**Implementation:** Add `seasonal_refresh` flag and custom logic.

## Privacy & Compliance

### Data Retention
- Stale data is NOT deleted, only flagged
- Historical answers preserved for audit trail
- Users can view answer history

### User Rights
- Users can mark any answer as stale manually
- Users can refuse to update stale data (but face reduced invitations)
- Users can delete specific answers entirely

### GDPR Compliance
- Staleness notifications are "legitimate interest" under GDPR
- Users can opt out of staleness emails
- Data accuracy principle supported by decay system

## Testing & QA

### Test Cases

**Decay Detection:**
- [ ] Immutable questions never marked stale
- [ ] Short-term questions stale after 30 days
- [ ] Medium-term questions stale after 180 days
- [ ] Long-term questions stale after 365 days
- [ ] Manual refresh resets staleness

**User Experience:**
- [ ] Dashboard alert shows correct stale count
- [ ] Category badges display stale indicators
- [ ] Question cards show staleness warnings
- [ ] Refresh updates last_updated timestamp

**Notifications:**
- [ ] In-app notifications appear when data becomes stale
- [ ] Email notifications respect user preferences
- [ ] Push notifications only for opted-in users

**Reputation Rewards:**
- [ ] Correct points awarded based on refresh timing
- [ ] Bulk refresh bonus applies correctly
- [ ] 90-day freshness badge awarded

**Survey Matching:**
- [ ] Fresh profiles get priority
- [ ] Stale profiles have reduced match scores
- [ ] Critical staleness (>30%) significantly reduces invitations

## Performance Considerations

### Batch Staleness Checks
Run nightly cron job to update `is_stale` flags:

```sql
UPDATE profile_answers pa
SET is_stale = check_answer_staleness(pa.id)
WHERE pa.is_stale <> check_answer_staleness(pa.id);
```

**Optimization:** Index on `last_updated` and `is_stale`.

### Caching
- Cache user's stale count in profile table
- Invalidate cache on answer update
- Reduces real-time calculation overhead

## Future Enhancements

### Predictive Staleness
Use ML to predict when users will update data:
- Send proactive reminders to high-compliance users
- Target low-compliance users with stronger incentives

### Dynamic Intervals
Adjust decay intervals based on:
- Question answer volatility
- Survey demand for specific data points
- User refresh patterns

### Gamification
- Streak tracking for consistent profile updates
- Leaderboards for freshest profiles
- Special badges for maintenance

## Conclusion

The Profile Decay System is essential for maintaining high-quality, actionable user data. By incentivizing regular updates and clearly communicating the benefits of fresh data, we ensure both user earning potential and platform targeting accuracy remain high.

**Key Takeaways:**
- Decay intervals vary by question type (30-365 days)
- Stale data reduces earning potential by 30-60%
- Users earn reputation points for refreshing data
- Admins can monitor and encourage refresh behavior
- System balances data accuracy with user burden

## Related Documentation

- [User Guide](USER_GUIDE.md) - User experience of profile updates
- [Admin Guide](ADMIN_GUIDE.md) - Managing decay configurations
- [Architecture](ARCHITECTURE.md) - Technical implementation details
- [Earning Rules](EARNING_RULES.md) - How freshness impacts earnings
