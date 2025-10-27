---
id: "table-architecture"
title: "Table Architecture"
category: "Technical Reference"
description: "Database table architecture and user type separation"
audience: "developer"
tags: ["database", "architecture", "tables"]
status: "published"
---

# Table Architecture - User Type Separation

## Overview

Looplly uses a completely separated table architecture to isolate data between regular users (`looplly_user`) and team members (`looplly_team_user`). This prevents data contamination and simplifies queries.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    LOOPLLY_USER DATA                         │
├─────────────────────────────────────────────────────────────┤
│ profiles (user_type = 'looplly_user')                       │
│   ├── Profile completion data                               │
│   ├── Demographics (gender, DOB, SEC)                       │
│   └── Address, ethnicity, income                            │
│                                                              │
│ profile_answers                                             │
│   └── User responses to profiling questions                 │
│                                                              │
│ address_components                                          │
│   └── Structured address data from Google Places            │
│                                                              │
│ user_reputation                                             │
│   ├── Score, level, tier                                    │
│   └── Quality metrics, history                              │
│                                                              │
│ user_balances                                               │
│   └── Current balance, lifetime earnings                    │
│                                                              │
│ earning_activities                                          │
│   └── Survey completions, rewards earned                    │
│                                                              │
│ user_badges                                                 │
│   └── Achievements and collectibles                         │
│                                                              │
│ transactions                                                │
│   └── Payment history                                       │
│                                                              │
│ user_referrals                                              │
│   └── Referral codes and earnings                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 LOOPLLY_TEAM_USER DATA                       │
├─────────────────────────────────────────────────────────────┤
│ team_profiles                                               │
│   ├── Email, name                                           │
│   ├── company_name (team name)                              │
│   ├── company_role (job title)                              │
│   ├── must_change_password                                  │
│   └── temp_password_expires_at                              │
│                                                              │
│ user_roles                                                  │
│   └── Role assignments (super_admin, admin, tester)         │
│                                                              │
│ team_activity_log                                           │
│   └── Admin action tracking                                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       SHARED TABLES                          │
├─────────────────────────────────────────────────────────────┤
│ audit_logs                                                  │
│   └── System-wide event logging                             │
│                                                              │
│ tenants, documentation, ai_agents                           │
│   └── System configuration                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Principles

### 1. Complete Separation
- Team users have ZERO records in user-specific tables
- Regular users have ZERO records in team-specific tables
- No shared columns or mixed data

### 2. Table-Level Access Control
Instead of filtering by `user_type` in every query:

```typescript
// ❌ OLD WAY (shared tables)
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_type', 'looplly_user');

// ✅ NEW WAY (separate tables)
const { data } = await supabase
  .from('profiles')  // Only contains looplly_user data
  .select('*');

const { data: teamData } = await supabase
  .from('team_profiles')  // Only contains team data
  .select('*');
```

### 3. Security Through Structure
Database constraints prevent accidental data mixing:

```sql
-- Profile answers can only link to looplly_user profiles
ALTER TABLE profile_answers
ADD CONSTRAINT profile_answers_users_only
CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = profile_answers.user_id
    AND profiles.user_type = 'looplly_user'
  )
);
```

---

## Migration Strategy

### Phase 1: Create New Tables (✅ Complete)
- Created `team_profiles` table
- Created `team_activity_log` table
- Added RLS policies

### Phase 2: Migrate Data (✅ Complete)
- Copied existing team users from `profiles` to `team_profiles`
- Cleaned profiling data from `profiles` for team users

### Phase 3: Update Application (✅ Complete)
- Updated `create-team-member` edge function
- Created `useTeamProfile` hook
- Updated `useAdminTeam` to query `team_profiles`
- Added team user checks to profile hooks

### Phase 4: Add Constraints (⚠️ Pending)
Future: Add CHECK constraints to enforce data separation at database level

---

## Querying Guidelines

### For Team Members
```typescript
// Get team profile
const { data } = await supabase
  .from('team_profiles')
  .select('*')
  .eq('user_id', userId)
  .single();

// Check team member role
const { data } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', userId)
  .single();
```

### For Regular Users
```typescript
// Get user profile with profiling data
const { data } = await supabase
  .from('profiles')
  .select('*, profile_answers(*)')
  .eq('user_id', userId)
  .single();

// Get user reputation
const { data } = await supabase
  .from('user_reputation')
  .select('*')
  .eq('user_id', userId)
  .single();
```

### Admin Queries
```typescript
// List all team members (admin portal)
const { data } = await supabase
  .from('team_profiles')
  .select(`
    *,
    user_roles!inner(role)
  `)
  .in('user_roles.role', ['super_admin', 'admin']);

// List all regular users (user management)
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_type', 'looplly_user');
```

---

## Benefits

### 1. **Simpler Queries**
No need to filter by `user_type` in every query. Table names make intent clear.

### 2. **Better Performance**
- Smaller table sizes (no mixed data)
- More efficient indexes
- Faster queries

### 3. **Enhanced Security**
- Table-level RLS policies
- Database constraints prevent mixing
- Clear separation of concerns

### 4. **Easier Maintenance**
- Self-documenting code (table names indicate purpose)
- Reduced complexity
- Fewer bugs from incorrect filtering

### 5. **Scalability**
- Can scale tables independently
- Can partition data differently
- Can apply different backup strategies

---

## Related Hooks

### For Team Users
- `useTeamProfile()` - Get team member profile
- `useRole()` - Check team member permissions
- `useUserType()` - Check if user is team member

### For Regular Users
- `useProfile()` - Profile operations (skips team users)
- `useProfileQuestions()` - Profile questions (skips team users)
- `useStaleProfileCheck()` - Check stale data (skips team users)
- `useUserReputation()` - Reputation management

---

## Testing

When testing the separation:

```typescript
// ✅ Team user should have:
- Record in team_profiles
- Record in user_roles
- Record in profiles (minimal, just user_type)

// ❌ Team user should NOT have:
- Records in profile_answers
- Records in user_reputation
- Records in user_balances
- Records in earning_activities

// ✅ Regular user should have:
- Record in profiles (with profiling data)
- Records in profile_answers
- Record in user_reputation
- Record in user_balances

// ❌ Regular user should NOT have:
- Record in team_profiles
- Record in user_roles (unless also a team member)
```

---

## Future Enhancements

### Client Users (B2B)
When `client_user` type is implemented:
- Create `client_profiles` table
- Create `client_organizations` table
- Follow same separation pattern
- No mixing with team or regular user data
