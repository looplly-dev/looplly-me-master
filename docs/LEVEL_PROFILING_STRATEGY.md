# Level Profiling Strategy

## Executive Overview

Looplly uses a **3-level progressive profiling system** designed to balance user experience, data quality, and vendor targeting requirements. This strategy reduces signup friction while progressively collecting deeper demographic and psychographic data as users engage with the platform.

---

## Why 3 Levels?

### 1. **User Experience (Reduce Signup Friction)**
- Asking 50+ questions upfront causes 70% signup abandonment
- Progressive disclosure keeps initial signup under 2 minutes
- Users are more willing to answer questions after seeing value (earning rewards)

### 2. **Data Quality (Context-Driven Responses)**
- Generic questions at signup yield low-quality answers ("prefer not to say")
- Contextual questions (e.g., car questions before automotive survey) get 3x better response rates
- Time-spaced questions reduce survey fatigue

### 3. **Vendor Requirements (Targeting Precision)**
- Survey vendors require basic demographics (Level 2) for matching
- Advanced targeting (brands, lifestyle, automotive) is optional but increases CPM by 30-50%
- Country-specific data (income ranges, local brands, SEC/SEM classifications) enables regional campaigns

---

## The 3-Level System

### **Level 1: Mandatory Signup Fields**

**When**: During initial account creation  
**Status**: Required (users cannot proceed without completing)  
**Time to Complete**: ~2 minutes

#### Fields (5 total):
1. **First Name** (text)
2. **Last Name** (text)
3. **Mobile** (phone with country dial code)
4. **Email** (text, verified via OTP)
5. **Address** (Google Places autocomplete with component breakdown)

#### Address Breakdown:
When users select an address from Google Places autocomplete, the system stores:
- `formatted_address` (full address string)
- `street_number`, `route` (street address)
- `locality` (city/town)
- `administrative_area_level_1` (state/province)
- `administrative_area_level_2` (county/district)
- `postal_code` (ZIP/postal code)
- `country` (country name)
- `latitude`, `longitude` (GPS coordinates)

**Why Address is Mandatory**:
- Required for KYC/fraud prevention
- Enables location-based survey targeting (e.g., "Users within 10km of Lagos Mall")
- Supports future hyperlocal campaigns (e.g., "New store opening in your area")

**Immutability**: Address is **immutable** after signup (users cannot change it without admin verification to prevent fraud)

---

### **Level 2: Pre-Earning Requirements**

**When**: After signup, before accessing "Earn" tab  
**Status**: Mandatory (enforced via modal dialog + visual indicators)  
**Time to Complete**: ~3-5 minutes

#### Visual Indicators (If Incomplete):
- 🔴 **Alert Banner** at top of Dashboard: "Complete Your Profile to Start Earning"
- 🟡 **Pulsing Badge** on "Profile" tab navigation
- 📊 **Progress Bar** in "Earn" tab showing "2/3 Levels Complete - Finish Level 2 to unlock earning"

#### Fields (Country-Specific):
1. **Gender** (Male, Female, Non-binary, Prefer not to say)
2. **Date of Birth** (date picker, must be 18+)
3. **Household Income** (single-select, ranges vary by country)
4. **Socioeconomic Classification** (SEC for India, SEM for Nigeria, NCCS for South Africa)

#### Country-Specific Income Ranges:

**Nigeria (NGN)**:
- ₦0 - ₦100,000/month
- ₦100,000 - ₦250,000/month
- ₦250,000 - ₦500,000/month
- ₦500,000 - ₦1,000,000/month
- ₦1,000,000+/month

**South Africa (ZAR)**:
- R0 - R10,000/month
- R10,000 - R20,000/month
- R20,000 - R40,000/month
- R40,000 - R80,000/month
- R80,000+/month

**Kenya (KES)**:
- KSh0 - KSh30,000/month
- KSh30,000 - KSh60,000/month
- KSh60,000 - KSh120,000/month
- KSh120,000 - KSh250,000/month
- KSh250,000+/month

**India (INR)**:
- ₹0 - ₹25,000/month
- ₹25,000 - ₹50,000/month
- ₹50,000 - ₹1,00,000/month
- ₹1,00,000 - ₹2,00,000/month
- ₹2,00,000+/month

#### Why Level 2 is Mandatory:
- Survey vendors require gender/age/income for basic matching
- Without these fields, users see 0 survey opportunities
- Level 2 completion increases survey availability by 500%

**Enforcement**: 
- Users can view Dashboard but "Earn" tab shows progress bar blocking access
- Modal dialog appears with "Complete Now" CTA
- Badge notification on "Profile" tab until completed

---

### **Level 3: Progressive Contextual Profiling**

**When**: Triggered contextually during user journey  
**Status**: Optional (but improves survey matching by 30-50%)  
**Time to Complete**: ~1-2 minutes per prompt (5 questions max)

#### 8 Categories (60-80 Questions Total):

1. **Employment** (15 questions)
   - Industry, job title, employment status, workplace size
   - Skills, professional certifications
   - Triggers: Milestone (5 surveys completed), Time-based (7 days after signup)

2. **Lifestyle** (12 questions)
   - Hobbies, interests, fitness habits
   - Media consumption (TV, streaming, social media)
   - Triggers: Time-based (30 days after signup)

3. **Automotive** (10 questions)
   - Car ownership, brand preference, purchase timeline
   - Driving habits, insurance provider
   - Triggers: Survey category (before automotive survey)

4. **Technology** (10 questions)
   - Device ownership (smartphone, laptop, tablet)
   - OS preference (iOS, Android, Windows)
   - Software usage (productivity, gaming, design)
   - Triggers: Behavior-based (clicked high-payout tech surveys)

5. **Health** (8 questions)
   - Health insurance, fitness tracker usage
   - Dietary preferences, chronic conditions
   - Triggers: Survey category (before healthcare survey)

6. **Finance** (10 questions)
   - Banking habits, credit card usage
   - Investment experience, savings goals
   - Triggers: Milestone (10 surveys completed)

7. **Shopping** (8 questions)
   - Online vs in-store preference
   - Brand loyalty, price sensitivity
   - Triggers: Milestone (20 surveys completed)

8. **Family** (7 questions)
   - Marital status, number of children
   - Household size, pet ownership
   - Triggers: Time-based (60 days after signup)

#### Trigger Types (Details in `LEVEL3_CONTEXTUAL_TRIGGERS.md`):

1. **Survey Category Triggers**: "Before viewing this automotive survey, answer 3 quick questions about car ownership" (**blocks survey access until answered or skipped**)
2. **Time-Based Triggers**: "You've been with us for 7 days! Help us match you with better surveys by answering 5 lifestyle questions"
3. **Milestone Triggers**: "Congrats on completing 5 surveys! Unlock higher-paying opportunities by answering 5 employment questions"
4. **Behavior-Based Triggers**: "We noticed you're interested in high-payout tech surveys. Answer 5 questions about your devices to see more"

#### Pacing Strategy:
- Max 5 questions per prompt (prevents fatigue)
- Min 3-day gap between prompts (prevents spam)
- 7-day grace period after skipping (don't re-prompt immediately)
- Circuit breaker: Auto-pause all L3 prompts if skip rate >40% for 3 consecutive days

#### Rewards:
- **NO reputation points awarded for Level 3 completion** (reserved for future enhancement)
- Intrinsic rewards: Better survey matching, higher CPM opportunities, personalized recommendations

---

## User Journey Flowchart

```
[New User Arrives]
       ↓
[Level 1: Signup (5 fields including address)]
       ↓
[Dashboard Access Granted]
       ↓
[Level 2 Incomplete? Show Modal + Alert Banner]
       ↓
[User Completes Level 2 (gender/DOB/income/SEC)]
       ↓
["Earn" Tab Unlocked - First Surveys Appear]
       ↓
[Level 3: Progressive Prompts Based on Triggers]
       ↓
[User Completes Contextual Questions Over Time]
       ↓
[Profile Completeness Score Increases → Better Survey Matching]
```

---

## Visual Indicator System

### Alert Banner (Level 2 Incomplete):
```
🔴 Complete Your Profile to Start Earning
[Complete Now] [Remind Me Later]
```
- Displayed at top of Dashboard
- Dismissible but reappears on next session
- Links directly to Profile tab with Level 2 questions pre-filtered

### Pulsing Badge (Profile Tab):
```
Profile 🔴 (animated pulsing red dot)
```
- Appears on main navigation
- Stops pulsing after Level 2 completion

### Progress Bar (Earn Tab):
```
📊 Essential Profile: 2/3 Levels Complete
[────────────────────░░░░░░] 67%
Complete Level 2 to unlock earning opportunities
[Complete Profile]
```
- Blocks access to "Earn" tab until Level 2 complete
- Shows benefits: "Access 500+ surveys", "Earn up to $50/month"

---

## Integration with Existing Systems

### Streak System (`STREAK_REPUTATION_SYSTEM.md`):
- Level 2 completion does NOT affect streaks
- Level 3 completion does NOT affect streaks
- Streaks track survey completions, not profile completions

### Reputation System (`REP_CLASSIFICATION_SYSTEM.md`):
- Level 2 completion does NOT award rep points
- Level 3 completion does NOT award rep points (reserved for future)
- Rep-gated surveys require Level 2 completion (indirect relationship)

### Badge System:
- Verification Badges require Level 2 completion
- "Profile Pro" badges for Level 3 category completions (visual only, no rep)
- "Data Guardian" badges for keeping profile fresh (answering stale questions)

### Data Decay System (`PROFILE_SYSTEM_ARCHITECTURE.md`):
- Level 1 fields: **Immutable** (never expire)
- Level 2 fields: **Occasional** decay (income: 180 days, gender/DOB: never)
- Level 3 fields: **Frequent** or **Rare** decay (brands: 90 days, lifestyle: 365 days)

---

## Country-Specific Adaptations

### Income Ranges:
- Dynamically loaded from `country_question_options` table
- Currency auto-detected from `profiles.country_code`
- Admins can add new countries via `/admin/profile-questions`

### SEC/SEM/NCCS Classifications:
- **India (SEC)**: A1, A2, B1, B2, C1, C2, D, E (based on education + occupation)
- **Nigeria (SEM)**: Upper Class, Middle Class, Lower-Middle Class, Lower Class (based on income + assets)
- **South Africa (NCCS)**: 1-10 scale (based on household income + facilities)
- **Kenya**: Uses simplified income bands (no separate classification)

### Local Brands (Details in `GLOBAL_VS_LOCAL_BRANDS.md`):
- Questions like "Beverage Brands" have global options (Coca-Cola, Pepsi) + local options (Bigi Cola for Nigeria, Stoney for Kenya)
- `country_question_options` table with `is_global` flag
- Users only see brands relevant to their country

---

## Completion Metrics

### Target Rates:
- **Level 1**: 95% completion (should be 100% but allow for edge cases)
- **Level 2**: 85% completion within 7 days of signup
- **Level 3**: 60% completion within 90 days (all 8 categories)

### Time Targets:
- **Level 1**: <2 minutes
- **Level 2**: <5 minutes
- **Level 3 per prompt**: <2 minutes (5 questions)

### Quality Metrics:
- Skip rate per question: <30%
- "Prefer not to say" rate: <15%
- Profile update frequency: >1 update per 90 days (to keep data fresh)

---

## Phased Rollout Strategy

(See `PHASED_ROLLOUT_CHECKLIST.md` for detailed plan)

**Week 1**: Level 1 + Level 2 only (no contextual Level 3 prompts)  
**Week 2**: Introduce first Level 3 trigger (milestone-based)  
**Week 3-4**: Expand to 2-3 triggers (time-based, survey category)  
**Week 5+**: Full rollout (all 4 trigger types)

**Safety Mechanisms**:
- Circuit breaker (auto-pause if skip rate >40%)
- Admin "Pause All L3 Prompts" button
- User feedback loop (thumbs up/down on relevance)

---

## Admin Management

Warren (non-technical admin) can manage the system via:
- `/admin/profile-questions`: Add/edit questions, configure country options
- `/admin/profile-decay`: Set decay intervals per category
- `/admin/level3-triggers`: View/test/pause contextual triggers

(See `WARREN_ADMIN_GUIDE.md` for plain-English step-by-step guide)

---

## Future Enhancements

1. **Reputation Rewards for Level 3**: +5 rep per category completion (not implemented yet)
2. **AI-Powered Question Suggestions**: "Based on your answers, we recommend answering these 3 questions"
3. **Profile Completeness Leaderboard**: Gamification for power users
4. **Export Profile for Vendors**: "Download your profile as PDF to share with trusted partners"
5. **Profile Verification Badges**: Email verified ✓, Phone verified ✓, Address verified ✓

---

## Related Documentation

- `LEVEL3_CONTEXTUAL_TRIGGERS.md`: Technical spec for L3 trigger logic
- `GLOBAL_VS_LOCAL_BRANDS.md`: Managing mixed global/local options
- `PHASED_ROLLOUT_CHECKLIST.md`: Step-by-step launch plan
- `WARREN_ADMIN_GUIDE.md`: Plain-English admin guide
- `PROFILE_SYSTEM_ARCHITECTURE.md`: Database schema + decay system
- `COUNTRY_QUESTION_MANAGEMENT.md`: Country-specific data handling
- `DATA_ISOLATION_QUICK_REFERENCE.md`: SQL patterns for country filtering
