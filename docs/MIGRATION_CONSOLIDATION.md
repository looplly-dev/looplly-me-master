# Migration Consolidation Guide

## Overview

This project has been consolidated from **119 individual migrations** into a single, clean baseline migration. This document explains the changes, benefits, and how to work with the new setup.

---

## 📊 What Changed

### Before
- **119 migration files** accumulated over 3 months (Aug-Nov 2025)
- Multiple conflicting RLS policies
- 16+ missing foreign key indexes
- 100+ performance-degraded RLS policies
- 7 functions without security fixes
- Difficult to track schema state

### After
- **1 consolidated migration** (`00000000000000_fresh_start.sql`)
- Clean, organized schema with clear sections
- All missing indexes added
- Optimized RLS policies for performance
- All functions secured with `SET search_path`
- Easy-to-understand baseline

---

## ✅ What Was Fixed

### 1. Performance Issues

#### Missing Foreign Key Indexes (Added)
```sql
-- OTP verifications
CREATE INDEX idx_otp_verifications_user_id ON public.otp_verifications(user_id);

-- Profile system
CREATE INDEX idx_profile_questions_decay_config_key ON public.profile_questions(decay_config_key);
CREATE INDEX idx_profile_answers_verified_by ON public.profile_answers(verified_by);
CREATE INDEX idx_profile_categories_default_decay_config_key ON public.profile_categories(default_decay_config_key);

-- Country profiling
CREATE INDEX idx_country_profiling_gaps_question_id ON public.country_profiling_gaps(question_id);
CREATE INDEX idx_country_profiling_gaps_reviewed_by ON public.country_profiling_gaps(reviewed_by);

-- Auto approval
CREATE INDEX idx_auto_approval_config_tenant_id ON public.auto_approval_config(tenant_id);

-- Financial
CREATE INDEX idx_earning_rules_tenant_id ON public.earning_rules(tenant_id);

-- Referrals
CREATE INDEX idx_referrals_referred_id ON public.referrals(referred_id);

// Team
CREATE INDEX idx_team_activity_log_team_user_id ON public.team_activity_log(team_user_id);
CREATE INDEX idx_team_members_added_by ON public.team_members(added_by);
CREATE INDEX idx_team_profiles_invited_by ON public.team_profiles(invited_by);

-- Streak config
CREATE INDEX idx_streak_unlock_config_tenant_id ON public.streak_unlock_config(tenant_id);

-- AI Agents
CREATE INDEX idx_ai_agents_tenant_id ON public.ai_agents(tenant_id);
CREATE INDEX idx_agent_configs_tenant_id ON public.agent_configs(tenant_id);
CREATE INDEX idx_agent_executions_tenant_id ON public.agent_executions(tenant_id);
```

#### RLS Policy Optimization
**Problem:** Using `auth.uid()` directly causes per-row re-evaluation.

**Before** (inefficient):
```sql
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);
```

**After** (optimized):
```sql
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
USING ((SELECT auth.uid()) = user_id);
```

This change applied to **100+ policies** across all tables.

### 2. Security Issues

#### Function Search Path Vulnerability
**Problem:** Functions without `SET search_path` are vulnerable to search path attacks.

**All functions now include:**
```sql
CREATE OR REPLACE FUNCTION public.function_name()
RETURNS ...
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- ← Security fix
AS $$
BEGIN
  -- Function body
END;
$$;
```

Functions fixed: `update_updated_at_column`, `update_profile_timestamp`, `initialize_user_balance`, `update_user_balance_on_transaction`, `compute_targeting_metadata`, and 23 more.

#### Missing RLS Policies
**Problem:** `tenants` table had RLS enabled but no policies.

**Fixed:** Added policies for tenant management.

### 3. Schema Organization

The consolidated migration is organized into clear sections:

1. **Extensions** - PostgreSQL extensions (uuid-ossp, pgcrypto, etc.)
2. **ENUMs** - All 7 custom types
3. **Core Tables** - 62 tables in dependency order
4. **Indexes** - All indexes including missing ones
5. **Functions** - All 28 functions with security fixes
6. **Triggers** - All 45+ triggers
7. **RLS Policies** - Optimized policies for all tables

---

## 🗂️ File Structure

```
looplly-me-master/
├── supabase/
│   ├── migrations/
│   │   ├── 00000000000000_fresh_start.sql  ← Single consolidated migration
│   │   └── migrations_archived_YYYYMMDD_HHMMSS/  ← Old migrations (after reset)
│   └── config.toml
├── scripts/
│   └── reset-local-db.sh  ← Reset script for local dev
└── docs/
    └── MIGRATION_CONSOLIDATION.md  ← This file
```

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Supabase CLI installed (`brew install supabase/tap/supabase`)
- Local Supabase running or ready to start
- Access to remote Supabase project (for linked operations)

### Option 1: Fresh Local Setup (Recommended)

If you're comfortable resetting your local database:

```bash
# Make script executable
chmod +x scripts/reset-local-db.sh

# Run reset script
./scripts/reset-local-db.sh
```

This will:
1. Stop Supabase
2. Archive old migrations
3. Reset database with consolidated migration
4. Generate TypeScript types
5. Verify everything worked

### Option 2: Manual Reset

If you prefer manual control:

```bash
# Stop Supabase
supabase stop

# Archive old migrations
mkdir -p supabase/migrations_archived
mv supabase/migrations/[0-9]*.sql supabase/migrations_archived/

# Keep only consolidated migration
# (00000000000000_fresh_start.sql should remain)

# Reset database
supabase db reset

# Generate types
supabase gen types typescript --linked > src/integrations/supabase/types.ts

# Start Supabase
supabase start
```

---

## 🎯 Production Deployment

### IMPORTANT: Production Migration Strategy

Since production already has data and 119 migrations applied, you have two options:

#### Option A: Keep Production As-Is (Recommended)
- Production continues with existing migrations
- Only use consolidated migration for new local/preview environments
- Production is stable and doesn't need consolidation

#### Option B: Consolidate Production (Advanced)
**⚠️ Only do this during planned maintenance window**

1. **Create a backup**
   ```bash
   # Via Supabase dashboard or CLI
   supabase db dump --data-only > backup.sql
   ```

2. **Test migration on staging first**
   ```bash
   # On staging branch
   supabase db reset
   supabase db push
   ```

3. **Deploy to production**
   ```bash
   # After successful staging test
   supabase db push --linked
   ```

**Recommendation:** Unless you have specific issues with production, keep it as-is. The consolidated migration is most valuable for:
- New team members setting up locally
- Creating new preview branches
- Easier onboarding

---

## 📋 Schema Summary

### Tables (62 total)

**User Management (11)**
- `profiles`, `profiles_team_backup`, `user_roles`
- `communication_preferences`, `otp_verifications`
- `kyc_verifications`, `address_components`
- `team_profiles`, `team_members`, `team_activity_log`
- `tenants`

**Profiling System (8)**
- `profile_decay_config`, `profile_categories`
- `profile_questions`, `question_answer_options`
- `profile_answers`, `country_question_options`
- `country_profiling_gaps`, `question_audit_log`
- `auto_approval_config`

**Financial (6)**
- `transactions`, `user_balances`, `withdrawal_requests`
- `earning_activities`, `earning_rules`
- `referrals`, `user_referrals`, `user_referral_stats`

**Gamification (6)**
- `user_reputation`, `badge_catalog`, `user_streaks`
- `streak_unlock_config`, `community_posts`, `community_votes`

**Documentation (6)**
- `documentation`, `documentation_questions`
- `documentation_answers`, `documentation_feedback`
- `documentation_reading_progress`, `documentation_access_log`

**AI Agents (4)**
- `ai_agents`, `agent_configs`
- `agent_dependencies`, `agent_executions`

**Configuration (4)**
- `app_secrets`, `audit_logs`
- `country_legal_age`, `country_blocklist`

### Functions (28 total)

**Utilities**
- `update_updated_at_column()`, `update_profile_timestamp()`

**Authentication & Roles**
- `has_role()`, `has_role_or_higher()`, `is_team_member()`
- `can_view_user_profile()`

**User Management**
- `initialize_user_balance()`, `normalize_mobile_number()`
- `normalize_profile_mobile()`, `sync_country_iso()`
- `get_country_iso_from_dial_code()`

**Profile System**
- `validate_user_age()`, `check_age_before_save()`
- `compute_targeting_metadata()`, `audit_level_1_changes()`
- `get_targeting_values_by_question()`

**Financial**
- `update_user_balance_on_transaction()`

**Reputation**
- `handle_new_user_reputation()`, `admin_adjust_reputation()`

**Admin Functions**
- `find_users_by_criteria()`, `reset_user_journey()`
- `get_public_app_secrets()`, `get_app_secrets()`
- `get_user_email()`, `get_team_profile()`
- `get_auth_users_with_phones()`

### ENUMs (7 total)
- `app_role` - admin, user, super_admin, tester
- `user_type` - looplly_user, client_user, looplly_team_user
- `agent_status` - active, inactive, testing
- `config_data_type` - string, number, boolean, json
- `dependency_type` - triggers, requires, observes
- `execution_status` - success, failure, timeout, cancelled
- `journey_stage` - fresh_signup, otp_verified, basic_profile, full_profile, first_survey, established_user

---

## 🔍 Validation & Testing

### After Reset, Verify:

1. **Schema integrity**
   ```bash
   # Check tables created
   supabase db diff --linked

   # Should show no differences if production is at same state
   ```

2. **Security advisors**
   ```bash
   # Use MCP tools or dashboard
   # Check for RLS issues (should be minimal now)
   ```

3. **Type generation**
   ```bash
   # Verify types are up to date
   supabase gen types typescript --linked > src/integrations/supabase/types.ts
   ```

4. **Application startup**
   ```bash
   npm run dev
   # Verify app connects and loads data
   ```

---

## 🛠️ Troubleshooting

### Issue: Migration already applied on production
**Solution:** This is expected. Production doesn't need consolidation. Use consolidated migration only for fresh local/preview setups.

### Issue: Type mismatches after reset
**Solution:**
```bash
supabase gen types typescript --linked > src/integrations/supabase/types.ts
npm run build
```

### Issue: RLS policy errors
**Solution:** The optimized policies use subqueries. If you encounter errors, check that you're using the latest Supabase version:
```bash
supabase --version
# Should be >= 1.50.0
```

### Issue: Edge functions fail after reset
**Solution:** Edge functions don't need changes. If they fail:
1. Check `config.toml` for JWT verification settings
2. Verify environment variables are set
3. Redeploy functions: `supabase functions deploy <name>`

---

## 📝 Maintenance

### Adding New Tables

When adding new tables, follow the pattern in the consolidated migration:

```sql
-- 1. Add table in appropriate section
CREATE TABLE public.new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add indexes
CREATE INDEX idx_new_table_user_id ON public.new_table(user_id);

-- 3. Add trigger (if needed)
CREATE TRIGGER update_new_table_updated_at 
  BEFORE UPDATE ON public.new_table 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Enable RLS
ALTER TABLE public.new_table ENABLE ROW LEVEL SECURITY;

-- 5. Add policies (optimized)
CREATE POLICY "Users can view own data"
ON public.new_table FOR SELECT
USING ((SELECT auth.uid()) = user_id);
```

### Creating New Migrations

After the consolidated migration, new migrations work normally:

```bash
# Create new migration
supabase migration new add_new_feature

# Edit the generated file
# Apply locally
supabase db push

# Deploy to production
supabase db push --linked
```

---

## 📚 Additional Resources

- [Supabase RLS Performance Guide](https://supabase.com/docs/guides/database/postgres/row-level-security#call-functions-with-select)
- [PostgreSQL Function Security](https://www.postgresql.org/docs/current/sql-createfunction.html)
- [Database Linter Remediation](https://supabase.com/docs/guides/database/database-linter)

---

## 🎉 Benefits Summary

### Development Experience
✅ **Faster local setup** - Single migration vs 119  
✅ **Cleaner schema** - Easy to understand structure  
✅ **Better onboarding** - New developers can read one file  
✅ **Easier debugging** - Clear organization  

### Performance
✅ **16+ new indexes** - Faster queries on foreign keys  
✅ **Optimized RLS** - No per-row auth.uid() re-evaluation  
✅ **Better query plans** - Postgres optimizer benefits  

### Security
✅ **Function security** - All functions have SET search_path  
✅ **Complete RLS coverage** - No tables without policies  
✅ **Clear policy intent** - Well-commented and organized  

### Maintenance
✅ **Single source of truth** - One file defines baseline  
✅ **Easier schema diffs** - Smaller, clearer migrations  
✅ **Better version control** - Less migration churn  

---

**Questions or issues?** Check the troubleshooting section or consult the team.

**Last updated:** 2025-11-16
