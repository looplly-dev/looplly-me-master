# Warren's Admin Guide
## Plain-English Guide to Managing the Profile System

Welcome, Warren! This guide is written in **plain English** (no jargon) to help you manage the Looplly profile system without needing to write code or know SQL.

---

## Role Hierarchy

The Looplly admin system uses a **3-tier role hierarchy**:

```
super_admin (Level 3) ─┐
                       ├─> admin (Level 2) ─┐
                                             ├─> user (Level 1)
                                             ─┘
```

### 1. Super Admin (`super_admin`)
- **Highest level access**
- ✅ Can edit Level 1 (immutable) questions
- ✅ Can assign/change any user's role (including other admins)
- ✅ Full access to all admin features
- ⚠️ **Use with extreme caution** - actions affect entire system

### 2. Admin (`admin`)
- ✅ Can manage Level 2 and 3 questions
- ✅ Can moderate users and content
- ✅ Can view analytics and reports
- ❌ Cannot edit Level 1 questions
- ❌ Cannot assign super_admin role

### 3. User (`user`)
- Standard platform access
- No administrative capabilities

---

## Super Admin Capabilities

### Editing Level 1 Questions

⚠️ **CRITICAL SECURITY WARNING**

Level 1 questions are identity and security fields tied to:
- User authentication
- Fraud prevention algorithms
- KYC verification status
- Data isolation queries

**Only Super Admins can edit these fields.**

#### How to Edit Level 1 Questions:

1. Navigate to **Admin → Questions → Level 1 tab**
2. As a Super Admin, you'll see: **"🔓 Super Admin: Level 1 Questions Unlocked"**
3. Click **Edit** or **Settings** on any Level 1 question
4. Make changes carefully
5. **Test thoroughly in staging before deploying to production**

#### Level 1 Question Types:
- First Name
- Last Name  
- Mobile Number
- Date of Birth
- Address
- Country Code / ISO

#### Risks of Editing Level 1:
- ❌ May break user authentication
- ❌ May affect fraud detection accuracy
- ❌ May invalidate KYC verification
- ❌ May break data isolation queries
- ❌ Changes affect **all users** immediately

**Best Practice**: Create a test user, apply changes, verify behavior before rolling out system-wide.

---

## User Visibility and Management

### Two Management Pages: Team vs Users

The admin system has **two separate pages** for managing different groups:

#### 1. **Team Page** (`/admin/team`)
- Shows **staff members only**: super_admins and admins
- Used for internal team management
- Admins can see regular admin colleagues, but NOT super admins
- Super admins can see everyone on the team

#### 2. **Users Page** (`/admin/users`)
- Shows **platform users only**: office_user and looplly_user types
- Used for managing the user base
- This is where you manage customer accounts
- All staff can see all platform users

### Role-Based Visibility Rules

The system enforces **database-level security** to ensure proper separation of concerns:

#### What Super Admins Can See:
- ✅ **Team Page**: All staff (super admins + admins)
- ✅ **Users Page**: All platform users (office_user + looplly_user)
- ✅ Can view, edit, suspend, and manage anyone
- ✅ Can assign any role including super_admin

#### What Admins Can See:
- ✅ **Team Page**: Other regular admins only (NOT super admins)
- ✅ **Users Page**: All platform users (office_user + looplly_user)
- ✅ Can manage platform users (suspend, change user types)
- ❌ Cannot see super admins on Team page
- ❌ Cannot assign super_admin role (option hidden in UI)

#### Security Implementation:
- 🔒 **Database-level enforcement**: RLS policies prevent admins from querying super_admin profiles
- 🔒 **Not just UI hiding**: Security is enforced at the database, not just frontend
- 🔒 **Prevents privilege escalation**: Admins cannot attempt to contact or target super admins
- 🔒 **Dual-table architecture**: Staff roles (`user_roles`) separate from user types (`user_types`)

### Why This Matters:
- **Super admins remain invisible** to lower-tier admins for security
- **Clear separation**: Staff management (Team) vs customer management (Users)
- **Prevents social engineering**: Admins cannot identify who the super admins are
- **Scalable architecture**: Easy to add new roles or user types without conflicts

---

## Assigning Roles and User Types

### Two Types of Changes: Staff Roles vs User Types

The system separates **staff roles** (who can access admin panel) from **user types** (what kind of platform account they have).

---

### A. Changing Staff Roles (Team Page)

**When to use**: Promoting/demoting staff members (super_admin, admin, user)

**Steps**:
1. Go to **Admin → Team**
2. Find the staff member in the table
3. Click the **⋮** (three dots) menu
4. Select **"Change Role"**
5. Choose from available roles:
   - **User** (revoke admin access)
   - **Admin** (regular administrator)
   - **Super Admin** (⚠️ only visible if you're a super admin!)
6. Confirm the change

**Role Assignment Rules**:
- ✅ Super Admins can assign any role to anyone
- ✅ Admins can assign `admin` or `user` roles only
- ❌ Admins cannot see or assign `super_admin` role
- ❌ Admins cannot modify super admin accounts
- ❌ Regular users cannot change roles

---

### B. Changing User Types (Users Page)

**When to use**: Changing what type of platform account a user has (office_user vs looplly_user)

**Steps**:
1. Go to **Admin → Users**
2. Find the platform user in the table
3. Click the **⋮** (three dots) menu
4. Select **"Change User Type"**
5. Choose from:
   - **Office User** (for white-label office users)
   - **Looplly User** (standard Looplly platform users)
6. Confirm the change

**User Type Rules**:
- ✅ All staff (admins and super admins) can change user types
- ✅ User types only apply to platform users, not staff
- ✅ Changing user type affects what features they see in the app

---

### Understanding User Types

**Office User** (`office_user`):
- White-label users from office partnerships
- May have different branding
- May have restricted features based on office agreements
- Example: Users from "Acme Corp Office" partnership

**Looplly User** (`looplly_user`):
- Standard Looplly platform users
- Full access to all Looplly features
- Standard branding and experience
- Example: Users who signed up directly on looplly.me

**Why This Matters**:
- Some surveys/features are only available to Looplly users
- Office users may have custom earning structures
- Helps with analytics and reporting (segmentation)
- Allows for partner-specific configurations

---

### Important Notes:
- If you're an admin and don't see the "Super Admin" option, **this is intentional** for security
- If you need to promote someone to super admin, ask an existing super admin
- Only super admins can demote other super admins
- User types only appear on the Users page, not the Team page

---

## Security Best Practices

1. **Limit Super Admin Accounts**: Only assign to trusted team members
2. **Audit Changes**: All Level 1 edits should be logged (future feature)
3. **Test in Staging**: Never edit Level 1 questions directly in production
4. **Document Changes**: Keep a record of what was changed and why
5. **Review Regularly**: Audit who has super_admin access quarterly

---

## Troubleshooting

**Q: I don't see the "Edit" button on Level 1 questions**
A: Check your role badge in the top-right. Only Super Admins can edit Level 1.

**Q: I want to make another admin a Super Admin**
A: Go to Admin → Users → Find user → Change Role → Super Admin

**Q: Can I demote myself from Super Admin?**
A: Yes, but make sure at least one other Super Admin exists first!

**Q: Level 1 questions are showing errors after editing**
A: Contact engineering immediately. Level 1 changes can break critical systems.

---

## Table of Contents

1. [Adding a New Country (Step-by-Step)](#section-1-adding-a-new-country)
2. [Monitoring System Health](#section-2-monitoring-system-health)
3. [Emergency "Pause" Button](#section-3-emergency-pause-button)
4. [Managing Level 3 Triggers](#section-4-managing-level-3-triggers)
5. [Troubleshooting Common Issues](#section-5-troubleshooting)

---

## Section 1: Adding a New Country

### When to Use This:
You're launching Looplly in a new country (e.g., India, Ghana, Tanzania) and need to configure country-specific options like income ranges and local brands.

---

### Step-by-Step Instructions:

#### Step 1: Navigate to Profile Questions Admin
1. Log in to admin dashboard
2. Click **"Profile Questions"** in left sidebar
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

## Section 2: Monitoring System Health

### Dashboard Overview

Navigate to **Admin → Profile Health** to see the health dashboard.

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

---

### What Each Metric Means:

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

---

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

---

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

---

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

---

## Section 3: Emergency "Pause" Button

### When to Use:
- High skip rate (>40% for 3 days)
- User complaints about too many questions
- System issues (slow loading, errors)
- Preparing for system maintenance

---

### How to Pause Level 3 Prompts:

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

### How to Resume Prompts:

1. Navigate to **Admin → Level 3 Triggers**
2. Click **"Resume All Level 3 Prompts"**
3. Confirmation:
   ```
   ✅ All Level 3 prompts resumed
   
   Impact:
   - Prompts will appear again for eligible users
   - Pacing rules still apply (max 1 prompt every 3 days)
   
   [Back to Dashboard]
   ```

---

## Section 4: Managing Level 3 Triggers

### What Are Triggers?
**Triggers** are rules that automatically show users Level 3 questions based on their behavior:

- **Milestone Trigger**: "After completing 5 surveys, ask employment questions"
- **Time-Based Trigger**: "7 days after signup, ask lifestyle questions"
- **Survey Category Trigger**: "Before viewing automotive survey, ask car ownership questions"
- **Behavior-Based Trigger**: "After clicking 3 tech surveys, ask device ownership questions"

---

### Viewing All Triggers:

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

---

### Testing a Trigger:

**Why test?** See exactly what users see when a trigger fires.

**Steps**:
1. Click **"Test"** next to any trigger
2. Enter a user ID (or use "Test User")
3. Preview modal appears showing exactly what the user would see

**Example (Milestone Trigger)**:
```
┌─────────────────────────────────────────┐
│ 🎉 Congrats on Completing 5 Surveys!   │
├─────────────────────────────────────────┤
│ Help us match you with better           │
│ opportunities by answering 3 questions  │
│ about your employment.                  │
│                                          │
│ Question 1 of 3:                         │
│ What is your current employment status? │
│                                          │
│ ○ Employed full-time                    │
│ ○ Employed part-time                    │
│ ○ Self-employed                         │
│ ○ Unemployed                            │
│ ○ Student                               │
│ ○ Retired                               │
│                                          │
│ [Next Question] [Skip This]             │
└─────────────────────────────────────────┘
```

---

### Pausing a Specific Trigger:

**When to pause**:
- High skip rate (>40%)
- User complaints about specific trigger
- Testing new question wording

**Steps**:
1. Find trigger in table
2. Click **"Pause"** button
3. Trigger status changes to ⏸️ Paused
4. Users will no longer see this specific trigger (other triggers still active)

---

### Analytics: Which Triggers Work Best?

**Metrics to Watch**:

| Trigger Type | Skip Rate | Avg Time | Conversion | Best Performer |
|-------------|-----------|----------|------------|----------------|
| Milestone (5 surveys) | 18% | 1.8 min | 82% | ✅ |
| Time-Based (7 days) | 22% | 2.3 min | 78% | ✅ |
| Survey Category (Auto) | 15% | 1.5 min | 85% | ✅ Best |
| Behavior (3+ clicks) | 45% | 3.1 min | 55% | ❌ Needs work |

**Insights**:
- **Survey Category Triggers** work best (15% skip rate) because they're highly contextual
- **Behavior-Based Triggers** have high skip rate (45%) — users might find them creepy ("How does the app know I clicked 3 tech surveys?")
- **Action**: Pause behavior-based trigger, improve messaging

---

## Section 5: Troubleshooting

### Issue 1: "Users Not Seeing Level 2 Questions"

**Symptoms**:
- Users log in but don't see "Complete Profile" modal
- "Earn" tab is unlocked even though Level 2 is incomplete

**Diagnosis Steps**:
1. Navigate to **Admin → Profile Questions**
2. Filter by **"Level 2"** and **"Active"**
3. Check:
   - Are there any Level 2 questions marked as active?
   - Do questions have correct `country_codes`?

**Common Causes**:
- ❌ All Level 2 questions accidentally marked as inactive
- ❌ Questions configured for wrong country (e.g., Nigerian questions but user is Kenyan)

**Fix**:
- Activate questions: Click question → Toggle **"Is Active"** to ON
- Fix country filtering: Click question → Edit **"Country Codes"** → Add missing country

---

### Issue 2: "Wrong Income Ranges Showing for Nigeria"

**Symptoms**:
- Nigerian users see USD income ranges instead of NGN
- Income options like "$0-$1000/month" instead of "₦0-100k/month"

**Diagnosis Steps**:
1. Navigate to **Admin → Profile Questions**
2. Find **"Household Income"** question
3. Click **"View Country Options"**
4. Check Nigeria (NG) row:
   - Are income ranges in NGN (₦)?
   - Is currency field set to "NGN"?

**Common Causes**:
- ❌ Country options not configured for Nigeria
- ❌ Wrong currency selected (USD instead of NGN)

**Fix**:
- Click **"Edit Nigeria Options"**
- Update currency to **NGN**
- Replace USD ranges with NGN ranges (see Section 1 for examples)
- Click **"Save"**
- Test with fake user

---

### Issue 3: "Queries Are Slow When Filtering by Country"

**Symptoms**:
- Dashboard takes 10+ seconds to load
- Users see loading spinners for 5+ seconds
- Admin panel is slow

**Diagnosis**:
This is a **performance issue** — likely missing database indexes.

**What NOT to Do**:
- ❌ Don't try to fix this yourself
- ❌ Don't click "Rebuild Database" (you'll lose data!)

**What TO Do**:
- Contact dev team with this info:
  - Which page is slow? (e.g., "Admin → Profile Questions")
  - How slow? (e.g., "Takes 15 seconds to load")
  - Which country? (e.g., "Nigeria users")
- Dev team will add database indexes to speed up queries

---

### Issue 4: "Nigerian Users Seeing Kenyan Brands" (CRITICAL)

**Symptoms**:
- Nigerian user sees "Stoney Tangawizi" (Kenyan brand) in beverage brands dropdown
- Cross-country data leak detected in health dashboard

**Diagnosis**:
This is a **CRITICAL BUG** — data isolation is broken.

**What NOT to Do**:
- ❌ Don't try to manually fix user data
- ❌ Don't delete the question (you'll lose all answers!)

**What TO Do**:
1. Navigate to **Admin → Level 3 Triggers**
2. Click **"Pause All Level 3 Prompts"** (stop showing questions until bug is fixed)
3. Navigate to **Admin → Profile Health**
4. Click **"View Cross-Country Leak Details"**
5. Screenshot the affected users
6. Contact dev team immediately with:
   - Screenshot of leak details
   - Which question is affected (e.g., "Beverage Brands")
   - Which countries are mixing (e.g., "Nigerian users have Kenyan brands")

**Dev Team Will**:
- Fix database query to properly filter by country
- Clean up affected user data
- Add safeguards to prevent future leaks

---

## Quick Reference Cheat Sheet

### Common Tasks:

| Task | Location | Time |
|------|----------|------|
| Add new country | Admin → Profile Questions → Add Country | 10 min |
| Check system health | Admin → Profile Health | 30 sec |
| Pause all L3 prompts | Admin → Level 3 Triggers → Pause All | 5 sec |
| Test a trigger | Admin → Level 3 Triggers → [Test] | 2 min |
| View skip rates | Admin → Profile Health → Skip Rate | 30 sec |

---

### Red Flags (When to Contact Dev Team):

| Issue | Severity | Action |
|-------|----------|--------|
| Cross-country data leak (>0 users) | 🔴 CRITICAL | Contact dev immediately, pause L3 prompts |
| Dashboard loading >30 seconds | 🟠 High | Contact dev within 24 hours |
| Skip rate >60% | 🟡 Medium | Review questions, contact dev if can't fix |
| User can't log in | 🔴 CRITICAL | Contact dev immediately |

---

## Still Stuck? Contact Info

**Dev Team**:
- Email: dev@looplly.com
- Slack: #tech-support
- Phone: +234-XXX-XXXX (emergencies only)

**When Contacting Dev Team, Include**:
1. What you were trying to do
2. What went wrong
3. Screenshots (if applicable)
4. Which country/user is affected
5. Error messages (if any)

---

## Related Documentation (For Developers)

- `LEVEL_PROFILING_STRATEGY.md`: Overview of 3-level system
- `LEVEL3_CONTEXTUAL_TRIGGERS.md`: Technical spec for triggers
- `GLOBAL_VS_LOCAL_BRANDS.md`: How global/local brands work
- `PHASED_ROLLOUT_CHECKLIST.md`: Launch plan
- `DATA_ISOLATION_QUICK_REFERENCE.md`: SQL patterns for country filtering
