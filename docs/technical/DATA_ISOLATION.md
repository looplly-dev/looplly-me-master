# Data Isolation Quick Reference

## Overview

Looplly uses **Row-Level Security (RLS)** policies in Supabase to enforce data isolation and access control. This ensures users can only access their own data and admins have controlled access to manage the platform.

## Core Principles

### 1. User Data Isolation

**Rule**: Users can only see and modify their own data.

**Implementation**: RLS policies filter by `auth.uid()`

```sql
-- Example: Users can only view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);
```

### 2. Admin Access

**Rule**: Admins can view/modify user data for management purposes.

**Implementation**: Role-based policies using `has_role()` function

```sql
-- Example: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));
```

### 3. Public Data

**Rule**: Some data is publicly readable (no authentication required).

**Implementation**: Policies with `true` condition

```sql
-- Example: Public question catalog
CREATE POLICY "Questions are publicly readable"
  ON profile_questions FOR SELECT
  USING (true);
```

## Common RLS Patterns

### Pattern 1: User-Owned Records

Tables where each record belongs to a user:

```sql
-- profiles, profile_answers, user_balances, etc.

-- Read own data
CREATE POLICY "users_read_own"
  ON table_name FOR SELECT
  USING (auth.uid() = user_id);

-- Insert own data
CREATE POLICY "users_insert_own"
  ON table_name FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update own data
CREATE POLICY "users_update_own"
  ON table_name FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Delete own data
CREATE POLICY "users_delete_own"
  ON table_name FOR DELETE
  USING (auth.uid() = user_id);
```

### Pattern 2: Admin Management

Admins can manage all records:

```sql
-- Admins can view all
CREATE POLICY "admins_view_all"
  ON table_name FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Admins can modify all
CREATE POLICY "admins_update_all"
  ON table_name FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));
```

### Pattern 3: Public Read, Authenticated Write

Common for shared catalogs:

```sql
-- Anyone can read (questions, badges, etc.)
CREATE POLICY "public_read"
  ON table_name FOR SELECT
  USING (true);

-- Only authenticated users can write
CREATE POLICY "authenticated_insert"
  ON table_name FOR INSERT
  TO authenticated
  WITH CHECK (true);
```

### Pattern 4: Hierarchical Access

Team members can see team data:

```sql
-- Team members can view team profiles
CREATE POLICY "team_view_team_members"
  ON team_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM team_profiles tp
      WHERE tp.user_id = auth.uid()
        AND tp.is_active = true
    )
  );
```

## Key Tables & Policies

### Profiles Table

```sql
-- RLS enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users view own profile
CREATE POLICY "users_view_own_profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Admins view all profiles
CREATE POLICY "admins_view_all_profiles"
  ON profiles FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

-- Users update own profile
CREATE POLICY "users_update_own_profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Profile Answers Table

```sql
-- Users manage own answers
CREATE POLICY "users_manage_own_answers"
  ON profile_answers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins view all answers (for analytics)
CREATE POLICY "admins_view_all_answers"
  ON profile_answers FOR SELECT
  USING (has_role(auth.uid(), 'admin'));
```

### User Reputation Table

```sql
-- Users view own reputation
CREATE POLICY "users_view_own_reputation"
  ON user_reputation FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can modify reputation
CREATE POLICY "admins_manage_reputation"
  ON user_reputation FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

### Profile Questions (Catalog)

```sql
-- Questions are publicly readable
CREATE POLICY "questions_public_read"
  ON profile_questions FOR SELECT
  USING (true);

-- Only admins can modify questions
CREATE POLICY "admins_manage_questions"
  ON profile_questions FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

### Country Question Options

```sql
-- Options are publicly readable
CREATE POLICY "country_options_public_read"
  ON country_question_options FOR SELECT
  USING (true);

-- Only admins can manage options
CREATE POLICY "admins_manage_country_options"
  ON country_question_options FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

## Role-Based Access

### Role Hierarchy

```typescript
enum AppRole {
  USER = 'user',           // Default role
  TESTER = 'tester',       // Access to simulator & testing tools
  ADMIN = 'admin',         // Full platform management
  SUPER_ADMIN = 'super_admin' // System-level access
}
```

### Role Check Function

```sql
CREATE FUNCTION has_role(p_user_id UUID, p_role TEXT)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = p_user_id AND role = p_role::app_role
  )
$$;
```

### Role-Based Policies

```sql
-- Testers can access simulator
CREATE POLICY "testers_access_simulator"
  ON simulator_sessions FOR ALL
  USING (has_role(auth.uid(), 'tester'));

-- Admins can manage users
CREATE POLICY "admins_manage_users"
  ON profiles FOR ALL
  USING (has_role(auth.uid(), 'admin'));
```

## Testing RLS Policies

### Manual Testing

```sql
-- Test as regular user
SET LOCAL ROLE authenticated;
SET LOCAL "request.jwt.claims" = '{"sub": "user-uuid-here"}';

-- Try to view own profile (should succeed)
SELECT * FROM profiles WHERE user_id = 'user-uuid-here';

-- Try to view other user's profile (should fail)
SELECT * FROM profiles WHERE user_id = 'other-user-uuid';

-- Test as admin
SET LOCAL "request.jwt.claims" = '{"sub": "admin-uuid", "role": "admin"}';

-- View all profiles (should succeed)
SELECT * FROM profiles;
```

### Automated Tests

```typescript
import { supabase } from '@/integrations/supabase/client';

test('RLS: user can only view own profile', async () => {
  // Sign in as user 1
  await supabase.auth.signInWithPassword({
    email: 'user1@example.com',
    password: 'password'
  });
  
  // Try to fetch own profile (should succeed)
  const { data: ownProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user1Id)
    .single();
  
  expect(ownProfile).toBeTruthy();
  
  // Try to fetch other user's profile (should fail)
  const { data: otherProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user2Id)
    .single();
  
  expect(otherProfile).toBeNull();
});
```

## Common Pitfalls

### ❌ Forgetting to Enable RLS

```sql
-- BAD: RLS not enabled, anyone can access
CREATE TABLE sensitive_data (...);

-- GOOD: RLS enabled
CREATE TABLE sensitive_data (...);
ALTER TABLE sensitive_data ENABLE ROW LEVEL SECURITY;
```

### ❌ Overly Permissive Policies

```sql
-- BAD: Allows all users to see all data
CREATE POLICY "allow_all" ON profiles FOR SELECT USING (true);

-- GOOD: Users only see own data
CREATE POLICY "users_view_own" ON profiles FOR SELECT
  USING (auth.uid() = user_id);
```

### ❌ Missing WITH CHECK on INSERT/UPDATE

```sql
-- BAD: Only restricts reads, not writes
CREATE POLICY "users_manage_own" ON profiles FOR ALL
  USING (auth.uid() = user_id);

-- GOOD: Restricts both reads and writes
CREATE POLICY "users_manage_own" ON profiles FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### ❌ Service Role Bypass

```typescript
// BAD: Using service role key in frontend (bypasses RLS!)
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// GOOD: Using anon key (enforces RLS)
const supabase = createClient(SUPABASE_URL, ANON_KEY);
```

## Security Checklist

### Before Deployment

- [ ] RLS enabled on all user data tables
- [ ] Policies created for SELECT, INSERT, UPDATE, DELETE
- [ ] WITH CHECK clauses on INSERT/UPDATE policies
- [ ] Admin policies use role checks, not hardcoded user IDs
- [ ] Public tables have explicit public read policies
- [ ] Service role key never exposed to frontend
- [ ] RLS policies tested with multiple user roles

### Regular Audits

- [ ] Review policies monthly for overly broad access
- [ ] Check for tables with RLS disabled
- [ ] Audit admin access logs
- [ ] Test policies with edge cases (null user_id, etc.)
- [ ] Verify new tables have RLS enabled by default

## Debugging RLS Issues

### Enable RLS Logging

```sql
-- Enable detailed RLS logs
SET client_min_messages = 'debug5';
SET log_statement = 'all';
```

### Check Current User Context

```sql
-- View current authenticated user
SELECT auth.uid() AS current_user_id;

-- Check roles
SELECT * FROM user_roles WHERE user_id = auth.uid();
```

### Test Policy Matching

```sql
-- See which policies apply to a query
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT * FROM profiles WHERE user_id = auth.uid();
```

## Related Documentation

- [Role Architecture](ROLE_ARCHITECTURE.md)
- [Profile System Architecture](PROFILE_SYSTEM_ARCHITECTURE.md)
- [Admin Guide](PROFILING/ADMIN_GUIDE.md)
