# Earning Rules System

## Overview

The Earning Rules system implements a hierarchical set of requirements that users must meet to access earning opportunities (surveys, videos, tasks, data sharing). This document provides a comprehensive reference for understanding, managing, and troubleshooting the earning access gates.

---

## The 4 Earning Rules (Priority Order)

### 1. Mobile Verification (Priority 1)
**Block Type**: Hard  
**Icon**: 📱  
**Description**: User must verify their mobile number before accessing any earning opportunities.

**Why it exists**:
- Prevent bot accounts
- Ensure user authenticity
- Enable SMS notifications for high-value opportunities

**User Experience**:
- User opens Earn tab → sees banner: "Verify your mobile number to start earning"
- Click "Verify Now" → SMS verification flow
- After verification → full access (if other rules pass)

**Admin Query**:
```sql
SELECT COUNT(*) FROM profiles WHERE mobile_verified = false;
```

---

### 2. Stage 2 Unlock (Priority 2)
**Block Type**: Hard  
**Icon**: 🏆  
**Description**: User must unlock Stage 2 by completing a 7-day login streak.

**Why it exists**:
- Ensure user engagement before granting earning access
- Prevent opportunistic users who sign up only for earnings
- Build habit formation (daily logins)

**User Experience**:
- User opens Earn tab → sees banner: "Complete your 7-day streak to unlock earning opportunities"
- Shows progress: "Day 3 of 7 - Keep it up!"
- After 7 days → Stage 2 unlocks automatically

**Admin Query**:
```sql
SELECT COUNT(*) 
FROM user_streaks 
WHERE unlocked_stages->>'stage2' IS NULL 
   OR unlocked_stages->>'stage2' = 'false';
```

---

### 3. Profile Completion - Level 2 (Priority 3)
**Block Type**: Conditional (grace period exception)  
**Icon**: ✅  
**Description**: User must complete Level 2 profile questions UNLESS their country is in grace period.

**Why it exists**:
- Enable demographic targeting for high-value surveys
- Ensure data quality for market research partners
- Unlock country-specific opportunities

**Grace Period Exception**:
- If user's country has NO Level 2 questions configured (status = 'pending')
- User can access **Level 0 and Level 1 jobs** while waiting for admin approval
- After admin approves → user must complete Level 2 to unlock Level 2+ jobs

**User Experience**:

**Normal Flow (Country has Level 2 questions)**:
- User opens Earn tab → sees banner: "Complete your profile to access all opportunities"
- Click "Complete Profile" → 4 Level 2 questions (2 minutes)
- After completion → full access to all jobs

**Grace Period Flow (Country pending Level 2 questions)**:
- User opens Earn tab → sees blue info banner: "Limited opportunities while we set up your country"
- Can access Level 0/1 jobs immediately
- Shows: "23 opportunities available now, 17 more will unlock when your country profile is ready"
- After admin approval → red alert banner prompts Level 2 completion

**Admin Query**:
```sql
WITH pending_countries AS (
  SELECT DISTINCT country_iso 
  FROM country_profiling_gaps 
  WHERE status = 'pending'
)
SELECT COUNT(*) 
FROM profiles 
WHERE profile_level < 2 
  AND country_iso NOT IN (SELECT country_iso FROM pending_countries);
```

---

### 4. Data Freshness (Priority 4)
**Block Type**: Soft (skippable popup)  
**Icon**: ⏰  
**Description**: User profile data should be < 6 months old for optimal targeting.

**Why it exists**:
- Ensure targeting accuracy for market research
- Prompt users to update changed circumstances (income, employment, etc.)
- Maintain data quality standards

**User Experience**:
- User opens Earn tab → popup: "Your profile data is 7 months old. Update now for better opportunities?"
- Options: "Update Profile" or "Skip for Now"
- If skipped → user can still earn (soft block)
- Popup shows again in 30 days

**Admin Query**:
```sql
SELECT COUNT(DISTINCT user_id) 
FROM profile_answers 
WHERE last_updated < NOW() - INTERVAL '182 days';
```

---

## Job-Specific Targeting (Not Section-Based)

### Critical Principle
**Targeting is applied at the JOB level, NOT the section level.**

This means:
- Grace period users (Level 1 only) can see jobs in ALL sections (Surveys, Videos, Tasks, Data)
- Whether a user can access a specific job depends on:
  1. The job's `targeting_requirements.level` (0, 1, 2, or 3)
  2. The job's `targeting_requirements.country_specific` (true/false)
  3. The user's completed profile level
  4. Whether Level 1 data is sufficient for the job

### Examples

#### Example 1: Survey - No Targeting Required
```json
{
  "id": "survey-general-feedback",
  "activity_type": "survey",
  "title": "General App Feedback Survey",
  "reward_amount": 1.50,
  "targeting_requirements": {
    "level": 0,
    "country_specific": false,
    "required_fields": []
  }
}
```
**Result**: ✅ Visible to grace period users (Level 1), no Level 2 needed

#### Example 2: Survey - Income Targeting Required
```json
{
  "id": "survey-banking-products",
  "activity_type": "survey",
  "title": "Banking Product Preferences",
  "reward_amount": 5.00,
  "targeting_requirements": {
    "level": 2,
    "country_specific": true,
    "required_fields": ["household_income", "sec"]
  }
}
```
**Result**: ❌ NOT visible to grace period users (requires Level 2)

#### Example 3: Task - Basic Profile Required
```json
{
  "id": "task-app-install",
  "activity_type": "task",
  "title": "Install Shopping App",
  "reward_amount": 0.75,
  "targeting_requirements": {
    "level": 1,
    "country_specific": false,
    "required_fields": ["country_iso"]
  }
}
```
**Result**: ✅ Visible to grace period users (Level 1 sufficient)

#### Example 4: Video - Gender Targeting
```json
{
  "id": "video-womens-product-demo",
  "activity_type": "video",
  "title": "New Beauty Product Demo",
  "reward_amount": 1.25,
  "targeting_requirements": {
    "level": 2,
    "country_specific": false,
    "required_fields": ["gender"]
  }
}
```
**Result**: ❌ NOT visible to grace period users (gender is Level 2)  
**BUT**: If gender moved to Level 1 in future → ✅ Would be visible

---

## Grace Period User Experience

### What Grace Period Users See

1. **All 4 Tabs Are Visible**: Surveys, Videos, Tasks, Data Sharing
2. **Jobs Are Filtered Within Each Tab**:
   - Tab shows: "12 opportunities available, 8 more will unlock when you complete your profile"
3. **Clear Messaging**:
   - Blue info banner: "Limited opportunities while we set up your country profile"
   - Each locked job shows: 🔒 "Complete Level 2 to unlock"

### What Happens After Admin Approves Level 2

1. User receives notification: "New opportunities available in your country!"
2. Next time user opens Earn tab → Red alert banner:
   - "Complete Your Profile to Access All Opportunities"
   - "You currently have access to 12 opportunities. Complete Level 2 to unlock 8 more."
3. User completes Level 2 → All jobs become visible (if targeting is met)

---

## Targeting Level Definitions

| Level | Data Available | Example Jobs |
|-------|----------------|--------------|
| **0** | None (anonymous) | General feedback, app testing, basic tasks |
| **1** | Name, Email, Mobile, Country, Address | Location-based offers, app installs, referrals |
| **2** | + Gender, DOB, Income, SEC | Demographic surveys, targeted ads, product research |
| **3** | + Lifestyle data (car, pets, tech) | Specialized surveys, niche market research |

---

## Admin Dashboard

**Path**: `/admin/earning-rules`  
**Access**: Admin role required  
**Refresh Strategy**: Manual refresh (most efficient)

### Features

1. **Rule Status Cards**: Visual cards showing:
   - Priority order (1-4)
   - Block type (hard/soft/conditional)
   - Live count of blocked users
   - Color coding (red/orange/yellow/blue)

2. **Grace Period Alert**: 
   - Shows countries currently in grace period
   - Displays accessible vs locked job counts

3. **Opportunity Distribution**:
   - Breakdown by targeting level (0/1/2/3)
   - Activity type breakdown (Surveys/Videos/Tasks/Data)
   - Grace period impact visualization

4. **User Lookup Tool**:
   - Search by email to check individual user status
   - Shows pass/fail for each earning rule
   - Final verdict: "Can earn" or "Blocked by [rule]"

5. **Recent Blocks Table**:
   - Last 20 earning block events from audit logs
   - User details, block reason, timestamp

### Future Enhancements
- Historical trends (blocked users over time)
- CSV export functionality
- Bulk admin overrides (e.g., "Unlock Stage 2 for Country X")
- Real-time updates via Supabase Realtime
- Slack/email alerts for unusual spikes

---

## Implementation: Job Filtering Logic

```typescript
const filterJobsByUserProfile = (
  jobs: EarningActivity[],
  userProfileLevel: number,
  userCountryIso: string,
  inGracePeriod: boolean
) => {
  return jobs.filter(job => {
    const targetReq = job.targeting_requirements;
    
    // No targeting requirements → always show
    if (!targetReq || targetReq.level === 0) {
      return true;
    }
    
    // Check if user's profile level meets job requirement
    if (userProfileLevel < targetReq.level) {
      return false; // User hasn't completed required profile level
    }
    
    // Check country-specific requirement
    if (targetReq.country_specific && inGracePeriod) {
      return false; // Country-specific jobs hidden during grace period
    }
    
    // All checks passed
    return true;
  });
};
```

---

## Database Schema

### earning_activities table
```sql
ALTER TABLE earning_activities
ADD COLUMN targeting_requirements JSONB DEFAULT '{"level": 0, "country_specific": false}'::jsonb;

CREATE INDEX idx_earning_activities_targeting 
ON earning_activities USING gin (targeting_requirements);
```

### TypeScript Interface
```typescript
interface TargetingRequirements {
  level: 0 | 1 | 2 | 3;
  country_specific: boolean;
  required_fields?: string[];
}

interface EarningActivity {
  id: string;
  activity_type: 'survey' | 'video' | 'task' | 'data_sharing';
  title: string;
  reward_amount: number;
  targeting_requirements: TargetingRequirements;
}
```

---

## Testing Checklist

- [ ] Mobile unverified users see verification banner
- [ ] Stage 2 locked users see streak progress
- [ ] Grace period users see Level 0/1 jobs only
- [ ] Level 2 complete users see all jobs (if fresh)
- [ ] Stale data users see skippable popup
- [ ] Admin dashboard shows correct blocked counts
- [ ] User lookup tool accurately diagnoses issues
- [ ] Job distribution matches database counts

---

## Troubleshooting

### "Why can't I earn?"
1. Check mobile verification status
2. Check Stage 2 unlock (7-day streak)
3. Check profile level (must be 2, or country in grace period)
4. Use admin lookup tool to diagnose

### "Why do I see fewer surveys than my friend?"
- Check targeting requirements on jobs
- Your friend may have completed Level 2, you may be in grace period
- Compare countries (different jobs per country)

### "Grace period but still blocked"
- Verify mobile number and Stage 2 are complete
- Grace period only bypasses Level 2 requirement
- Other rules (mobile, Stage 2) still apply

---

## References

- [Profile System Architecture](./PROFILE_SYSTEM_ARCHITECTURE.md)
- [Level Strategy](./LEVEL_STRATEGY.md)
- [Integration Guide](./INTEGRATION_GUIDE.md)
- [Country Question Management](./COUNTRY_QUESTION_MANAGEMENT.md)
