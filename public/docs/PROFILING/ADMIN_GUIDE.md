# Admin Guide: Profile System Management

## Plain-English Guide for Warren

This guide explains how to manage the Looplly profiling system without needing to write code or know SQL.

---

## Table of Contents

1. [Adding a New Country](#section-1-adding-a-new-country)
2. [Managing Decay Intervals](#section-2-managing-decay-intervals)
3. [Monitoring System Health](#section-3-monitoring-system-health)
4. [Managing Level 3 Triggers](#section-4-managing-level-3-triggers)
5. [Troubleshooting Common Issues](#section-5-troubleshooting)

---

## Section 1: Adding a New Country

### When to Use This
You're launching Looplly in a new country (e.g., India, Ghana, Tanzania) and need to configure country-specific options like income ranges and local brands.

### Step-by-Step Instructions

#### Step 1: Navigate to Profile Questions Admin
1. Log in to admin dashboard
2. Click **"Profile Questions"** in left sidebar (or go to `/admin/profile-questions`)
3. You'll see a list of all existing questions

#### Step 2: Select Country to Add
1. At the top, click **"Add Country"** button
2. Dropdown menu appears with available countries:
   - ✅ Nigeria (already configured)
   - ✅ South Africa (already configured)
   - ✅ Kenya (already configured)
   - 🆕 India (new)
   - 🆕 Ghana (new)
3. Select **"India"**
4. System auto-detects:
   - **Currency**: INR (₹)
   - **Dial Code**: +91
   - **Timezone**: Asia/Kolkata

#### Step 3: Configure Income Ranges
**Why?** Survey vendors need to know users' income to match them with relevant surveys. Income ranges vary by country (e.g., ₹50,000/month in India ≠ ₦50,000/month in Nigeria).

**Interface**:
```
┌─────────────────────────────────────────┐
│ Income Ranges for India                 │
├─────────────────────────────────────────┤
│ Currency: INR (₹)                       │
│                                          │
│ Income Bracket 1:                        │
│   Min: ₹0                                │
│   Max: ₹25,000/month                     │
│   [+ Add Bracket]                        │
│                                          │
│ Income Bracket 2:                        │
│   Min: ₹25,000                           │
│   Max: ₹50,000/month                     │
│   [+ Add Bracket]                        │
│                                          │
│ Income Bracket 3:                        │
│   Min: ₹50,000                           │
│   Max: ₹1,00,000/month                   │
│   [+ Add Bracket]                        │
│                                          │
│ Income Bracket 4:                        │
│   Min: ₹1,00,000                         │
│   Max: ₹2,00,000/month                   │
│   [+ Add Bracket]                        │
│                                          │
│ Income Bracket 5:                        │
│   Min: ₹2,00,000                         │
│   Max: No limit (₹2,00,000+)             │
│                                          │
│ [Save Income Ranges]                     │
└─────────────────────────────────────────┘
```

**Tips**:
- Use local currency (INR for India, GHS for Ghana, TZS for Tanzania)
- Create 5-7 brackets (too few = poor targeting, too many = confusing for users)
- Align with local economic standards (don't use US income ranges for Nigeria!)

#### Step 4: Add Local Brands
**Why?** Questions like "Which beverage brands do you consume?" have global brands (Coca-Cola, Pepsi) + local brands (Thums Up in India, Bigi Cola in Nigeria). You need to add India-specific brands.

**Interface**:
```
┌─────────────────────────────────────────┐
│ Beverage Brands - Add Local Brands      │
├─────────────────────────────────────────┤
│ Global Brands (Already Configured):      │
│   ✓ Coca-Cola                            │
│   ✓ Pepsi                                │
│   ✓ Sprite                               │
│   ✓ Fanta                                │
│                                          │
│ Local Brands (India):                    │
│   [+ Add Brand]                          │
│                                          │
│ Brand 1:                                 │
│   Value: thums_up                        │
│   Label: Thums Up                        │
│   Category: soft_drinks                  │
│   [Remove]                               │
│                                          │
│ Brand 2:                                 │
│   Value: frooti                          │
│   Label: Frooti                          │
│   Category: juices                       │
│   [Remove]                               │
│                                          │
│ Brand 3:                                 │
│   Value: maaza                           │
│   Label: Maaza                           │
│   Category: juices                       │
│   [Remove]                               │
│                                          │
│ [Save India Brands]                      │
└─────────────────────────────────────────┘
```

**Tips**:
- **Value**: Use lowercase with underscores (e.g., `thums_up`, not `Thums Up`)
- **Label**: Use proper capitalization for display (e.g., `Thums Up`)
- **Category**: Use consistent categories (e.g., `soft_drinks`, `juices`, `energy_drinks`)
- Only add brands that are **unique to India** (don't re-add Coca-Cola, it's already global)

See [COUNTRY_QUESTION_MANAGEMENT.md](COUNTRY_QUESTION_MANAGEMENT.md) for detailed brand management workflows.

#### Step 5: Test with Fake User
**Before launching to real users**, test that everything works correctly.

**Interface**:
```
┌─────────────────────────────────────────┐
│ Test Configuration for India            │
├─────────────────────────────────────────┤
│ Click "Create Test User" below to       │
│ simulate an Indian user signing up.     │
│                                          │
│ [Create Test User (India)]               │
│                                          │
│ Test User Created:                       │
│   Name: Test User India                  │
│   Email: test_india@looplly.internal     │
│   Country: India                         │
│   Password: (auto-generated)             │
│                                          │
│ [Preview as User]                        │
└─────────────────────────────────────────┘
```

**Click "Preview as User"** to see the signup flow as an Indian user would see it:

1. **Income Question**:
   - Should show INR ranges (₹0-25k, ₹25k-50k, etc.)
   - Should NOT show NGN or ZAR ranges

2. **Beverage Brands Question**:
   - Should show global brands (Coca-Cola, Pepsi)
   - Should show Indian brands (Thums Up, Frooti, Maaza)
   - Should NOT show Nigerian brands (Bigi Cola) or Kenyan brands (Stoney)

**Verification Checklist**:
- ✅ Income ranges are in INR (₹)
- ✅ Indian local brands appear
- ✅ No Nigerian/Kenyan/South African brands appear
- ✅ Global brands (Coca-Cola, Pepsi) appear
- ✅ All questions load without errors

#### Step 6: Launch to Production
If test user looks good, click **"Publish India Configuration"**

**What Happens**:
- All Indian users (existing + new signups) will now see India-specific options
- Nigerian, Kenyan, South African users are **not affected** (they still see their own country's options)
- System logs the change in audit trail

**Confirmation Message**:
```
✅ India configuration published successfully!

Impact:
- 0 existing Indian users (no one signed up yet)
- New Indian signups will see INR income ranges + local brands

[View Audit Log] [Back to Profile Questions]
```

---

## Section 2: Managing Decay Intervals

### What is Data Decay?
Profile data expires after certain intervals to keep user information accurate. Income changes when you get a new job, lifestyle changes when you move, etc.

See [DECAY_SYSTEM.md](DECAY_SYSTEM.md) for comprehensive decay documentation.

### Decay Interval Types

Navigate to **Admin → Profile Decay** (or `/admin/profile-decay`)

You'll see 4 decay interval types:

| Interval Type | Days | Example Questions |
|---------------|------|-------------------|
| **Immutable** | Never expires | DOB, gender, address |
| **Rare** | 365 days | Lifestyle habits, hobbies |
| **Occasional** | 180 days | Income, job title |
| **Frequent** | 90 days | Brands purchased, devices owned |

### Changing Decay Intervals

**Warning**: Changing decay intervals affects all users globally. Only adjust if data quality is poor.

**Interface**:
```
┌─────────────────────────────────────────┐
│ Global Decay Intervals                   │
├─────────────────────────────────────────┤
│ Immutable (Never Expires):               │
│   Questions: DOB, gender, address        │
│   [No changes needed]                    │
│                                          │
│ Rare (365 days):                         │
│   Questions: Lifestyle, hobbies          │
│   [Edit Interval: 365 days ▼]           │
│   [Save]                                 │
│                                          │
│ Occasional (180 days):                   │
│   Questions: Income, job title           │
│   [Edit Interval: 180 days ▼]           │
│   [Save]                                 │
│                                          │
│ Frequent (90 days):                      │
│   Questions: Brands, devices             │
│   [Edit Interval: 90 days ▼]            │
│   [Save]                                 │
└─────────────────────────────────────────┘
```

### Category-Specific Defaults

You can set decay defaults per category (Demographics, Employment, etc.):

```
┌─────────────────────────────────────────┐
│ Category Decay Defaults                  │
├─────────────────────────────────────────┤
│ Demographics:                            │
│   Default: Immutable                     │
│   [Change Default ▼]                     │
│                                          │
│ Employment:                              │
│   Default: Occasional (180d)             │
│   [Change Default ▼]                     │
│                                          │
│ Lifestyle:                               │
│   Default: Rare (365d)                   │
│   [Change Default ▼]                     │
└─────────────────────────────────────────┘
```

### Question-Level Overrides

For specific questions, you can override the category default:

**Example**: "Car ownership" (Automotive category, default: Occasional) but you want it to be "Rare" (365 days)

1. Navigate to **Profile Questions**
2. Find "Car ownership" question
3. Click **Edit**
4. Under **Decay Settings**, select **"Override category default"**
5. Choose **"Rare (365 days)"**
6. Save

---

## Section 3: Monitoring System Health

### Dashboard Overview

Navigate to **Admin → Profile Decay** to see the health dashboard.

**Dashboard Cards**:

```
┌────────────────────────────────────────────────────────┐
│ 📊 Profile System Health                               │
├────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐             │
│  │ Skip Rate       │  │ Completion Time │             │
│  │                 │  │                 │             │
│  │    18%          │  │   4.2 min       │             │
│  │  ✅ Good        │  │  ✅ Good        │             │
│  │ Target: <30%    │  │ Target: <5 min  │             │
│  └─────────────────┘  └─────────────────┘             │
│                                                         │
│  ┌─────────────────┐  ┌─────────────────┐             │
│  │ Stale Data      │  │ Cross-Country   │             │
│  │                 │  │ Leaks           │             │
│  │    8%           │  │   0 users       │             │
│  │  ✅ Good        │  │  ✅ Good        │             │
│  │ Target: <10%    │  │ Target: 0       │             │
│  └─────────────────┘  └─────────────────┘             │
│                                                         │
└────────────────────────────────────────────────────────┘
```

### What Each Metric Means

#### 1. **Skip Rate**
**What it is**: Percentage of users who click "Skip" or "Prefer not to say" on Level 3 contextual prompts.

**Target**: <30%  
**Red Flag**: >40%

**What to do if red flag**:
- Click **"View Problem Questions"** to see which specific questions have high skip rates
- Questions with >40% skip rate likely need to be:
  - Reworded (too confusing)
  - Made optional (too invasive)
  - Removed (not relevant)

**Example**:
```
Problem Question: "What is your annual salary?"
Skip Rate: 52%
Feedback: "Too personal", "Not comfortable sharing"
Action: Change to household income ranges instead of exact salary
```

#### 2. **Completion Time**
**What it is**: Average time users spend answering Level 2 (pre-earning) questions.

**Target**: <5 minutes  
**Red Flag**: >10 minutes

**What to do if red flag**:
- Questions might be too complex (e.g., multi-select with 20 options)
- Too many questions at once (should be max 10-15 for Level 2)
- UI might be slow (contact dev team)

**Example**:
```
Avg Completion Time: 12 minutes
Slowest Question: "Select all brands you've purchased in the last 6 months" (3.5 minutes)
Action: Reduce options from 30 brands to 15 most popular brands
```

#### 3. **Stale Data %**
**What it is**: Percentage of users with outdated profile data (e.g., income from 2 years ago).

**Target**: <10%  
**Red Flag**: >20%

**What to do if red flag**:
- System should automatically prompt users to refresh stale data
- Check if decay system is working:
  - Navigate to **Admin → Profile Decay**
  - Verify decay intervals are set correctly (e.g., income expires every 180 days)
- If decay system is broken, contact dev team

**Example**:
```
Stale Data: 23%
Most Common: Income (last updated 365 days ago)
Action: Send email to users: "Update your profile for better survey matches"
```

See [DECAY_SYSTEM.md](DECAY_SYSTEM.md) for detailed staleness monitoring.

#### 4. **Cross-Country Leaks** (CRITICAL)
**What it is**: Number of users who have data from other countries (e.g., Nigerian user has Kenyan brands in answers).

**Target**: 0 (this should NEVER happen)  
**Red Flag**: >0

**What to do if red flag**:
- **This is a CRITICAL BUG** — data isolation is broken
- Click **"View Leak Details"** to see affected users
- **DO NOT TRY TO FIX YOURSELF** — contact dev team immediately
- Pause all Level 3 prompts until fixed

**Example**:
```
⚠️ CRITICAL: 3 users have cross-country data leaks!

User ID: abc123
User Country: Nigeria (NG)
Suspicious Answer: "Stoney Tangawizi" (Kenyan brand)
Question: Beverage Brands

[Contact Dev Team] [View All Leaks]
```

See [Data Isolation Quick Reference](../DATA_ISOLATION_QUICK_REFERENCE.md) for prevention patterns.

---

## Section 4: Managing Level 3 Triggers

### What Are Triggers?
**Triggers** are rules that automatically show users Level 3 questions based on their behavior:

- **Milestone Trigger**: "After completing 5 surveys, ask employment questions"
- **Time-Based Trigger**: "7 days after signup, ask lifestyle questions"
- **Survey Category Trigger**: "Before viewing automotive survey, ask car ownership questions"
- **Behavior-Based Trigger**: "After clicking 3 tech surveys, ask device ownership questions"

See [CONTEXTUAL_TRIGGERS.md](CONTEXTUAL_TRIGGERS.md) for full trigger logic.

### Viewing All Triggers

Navigate to **Admin → Level 3 Triggers**

**Interface**:
```
┌──────────────────────────────────────────────────────────────────┐
│ Level 3 Triggers                            [Pause All] [Add New]│
├──────────────────────────────────────────────────────────────────┤
│ Trigger Type      | Category    | Condition          | Status    │
├──────────────────────────────────────────────────────────────────┤
│ Milestone         | Employment  | 5 surveys          | ✅ Active │
│                   |             | Skip Rate: 18%     | [Edit]    │
│                   |             | Avg Time: 1.8 min  | [Pause]   │
├──────────────────────────────────────────────────────────────────┤
│ Time-Based        | Lifestyle   | 7 days signup      | ✅ Active │
│                   |             | Skip Rate: 22%     | [Edit]    │
│                   |             | Avg Time: 2.3 min  | [Pause]   │
├──────────────────────────────────────────────────────────────────┤
│ Survey Category   | Automotive  | Auto survey        | ✅ Active │
│                   |             | Skip Rate: 15%     | [Edit]    │
│                   |             | Block Rate: 8%     | [Pause]   │
├──────────────────────────────────────────────────────────────────┤
│ Behavior-Based    | Technology  | 3+ tech clicks     | ⏸️ Paused │
│                   |             | Skip Rate: 45%     | [Edit]    │
│                   |             | Reason: High skip  | [Resume]  │
└──────────────────────────────────────────────────────────────────┘
```

### Emergency "Pause All" Button

**When to Use**:
- High skip rate (>40% for 3 days)
- User complaints about too many questions
- System issues (slow loading, errors)
- Preparing for system maintenance

1. Navigate to **Admin → Level 3 Triggers**
2. At the top, big red button: **"Pause All Level 3 Prompts"**
3. Click button
4. Confirmation dialog:
   ```
   ⚠️ Are you sure you want to pause all Level 3 prompts?
   
   What will still work:
   - Level 1 (signup)
   - Level 2 (pre-earning)
   - Level 3 portal (users can browse and answer voluntarily)
   
   What will stop:
   - Contextual prompts ("Before viewing this survey...")
   - Time-based prompts ("You've been with us 7 days...")
   - Milestone prompts ("Congrats on 5 surveys...")
   
   [Yes, Pause All] [Cancel]
   ```
5. Click **"Yes, Pause All"**
6. Confirmation:
   ```
   ✅ All Level 3 prompts paused
   
   Impact:
   - 0 new prompts will appear
   - Users in the middle of answering questions can finish
   - Dashboard shows "L3 Prompts: PAUSED" banner
   
   [Resume Prompts] [View Audit Log]
   ```

---

## Section 5: Troubleshooting

### Common Issues

#### High Skip Rate (>40%)
**Symptoms**: Users clicking "Skip" or "Prefer not to say" frequently

**Causes**:
- Question is too personal (e.g., exact salary)
- Question is confusing (unclear wording)
- Too many options (e.g., 50 brands to choose from)
- Question not relevant to user (e.g., asking about cars when they don't drive)

**Solutions**:
1. Review question wording - make it less invasive
2. Reduce number of options (combine similar choices)
3. Make question optional instead of required
4. Add better help text explaining why we're asking

#### High Completion Time (>10 min)
**Symptoms**: Users taking too long to complete Level 2

**Causes**:
- Too many questions (>15 for Level 2)
- Complex multi-select questions
- Slow UI performance
- Users confused by layout

**Solutions**:
1. Split questions across multiple pages
2. Use single-select instead of multi-select when possible
3. Add progress indicator ("3 of 10 complete")
4. Test UI performance (contact dev team if slow)

#### High Stale Data Rate (>20%)
**Symptoms**: Many users have outdated profile data

**Causes**:
- Decay intervals too short (users annoyed, ignore prompts)
- Re-confirm flow not working (bug)
- Users not seeing stale data warnings

**Solutions**:
1. Check decay intervals - maybe extend from 90d to 180d
2. Test re-confirm flow with test user
3. Make yellow badges more prominent in UI
4. Send email reminders to users with stale data

#### Cross-Country Data Leaks
**Symptoms**: Users seeing options from other countries

**Causes**:
- **CRITICAL BUG** - data isolation broken
- Query missing `country_code` filter
- Admin manually entered wrong data

**Solutions**:
1. **DO NOT TRY TO FIX YOURSELF**
2. Immediately pause all Level 3 prompts
3. Contact dev team with:
   - List of affected user IDs
   - Screenshot of leak details
   - Timestamp when you noticed the issue
4. Dev team will run diagnostic queries and fix root cause

See [Data Isolation Quick Reference](../DATA_ISOLATION_QUICK_REFERENCE.md) for SQL patterns.

---

## Related Documentation

### For End Users
- [User Guide](USER_GUIDE.md): Plain-English explanation of profile system

### For Developers
- [Architecture](ARCHITECTURE.md): Database schema and data flow
- [Decay System](DECAY_SYSTEM.md): How data expiry works
- [Integration Guide](INTEGRATION_GUIDE.md): Connect profiling to other systems

### Strategy Documents
- [Level Strategy](LEVEL_STRATEGY.md): Why 3 levels? What's in each?
- [Contextual Triggers](CONTEXTUAL_TRIGGERS.md): Level 3 trigger logic
- [Global vs Local Brands](GLOBAL_VS_LOCAL_BRANDS.md): Mixed global/country-specific options
- [Rollout Checklist](ROLLOUT_CHECKLIST.md): Phased launch plan

---

## Need Help?

If you're stuck or see something unexpected:

1. **Check the dashboard metrics** - they usually reveal the problem
2. **Review audit logs** - all admin actions are tracked
3. **Test with fake user** - replicate the issue in a safe environment
4. **Contact dev team** - provide user IDs, screenshots, and timestamps

**Emergency Contact**: If you see **cross-country data leaks** or **system is broken**, contact dev team immediately. Don't wait.
