-- ============================================================================
-- LOOPLLY.ME CONSOLIDATED SCHEMA
-- ============================================================================
-- This migration consolidates 119 previous migrations into a clean baseline.
-- Created: 2025-11-16
-- 
-- STRUCTURE:
-- 1. Extensions
-- 2. ENUMs
-- 3. Core Tables (ordered by dependency)
-- 4. Indexes (including missing foreign key indexes)
-- 5. Functions (with security fixes)
-- 6. Triggers
-- 7. RLS Policies (optimized for performance)
-- ============================================================================

-- ============================================================================
-- SECTION 1: EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_graphql" SCHEMA graphql;
CREATE EXTENSION IF NOT EXISTS "supabase_vault" SCHEMA vault;

-- ============================================================================
-- SECTION 2: ENUMS
-- ============================================================================

CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'super_admin', 'tester');
CREATE TYPE public.user_type AS ENUM ('looplly_user', 'client_user', 'looplly_team_user');
CREATE TYPE public.agent_status AS ENUM ('active', 'inactive', 'testing');
CREATE TYPE public.config_data_type AS ENUM ('string', 'number', 'boolean', 'json');
CREATE TYPE public.dependency_type AS ENUM ('triggers', 'requires', 'observes');
CREATE TYPE public.execution_status AS ENUM ('success', 'failure', 'timeout', 'cancelled');
CREATE TYPE public.journey_stage AS ENUM ('fresh_signup', 'otp_verified', 'basic_profile', 'full_profile', 'first_survey', 'established_user');

-- ============================================================================
-- SECTION 3: CORE TABLES (Ordered by Dependency)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TENANT MANAGEMENT
-- ----------------------------------------------------------------------------

CREATE TABLE public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  api_key TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- USER PROFILES & AUTH
-- ----------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  mobile TEXT NOT NULL UNIQUE,
  country_code TEXT NOT NULL DEFAULT '+1',
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  date_of_birth DATE,
  address TEXT,
  household_income TEXT,
  personal_income TEXT,
  ethnicity TEXT,
  sec TEXT CHECK (sec IN ('A', 'B', 'C1', 'C2', 'D', 'E')),
  profile_complete BOOLEAN DEFAULT false,
  gps_enabled BOOLEAN DEFAULT false,
  badge_preview_mode BOOLEAN DEFAULT false,
  is_suspended BOOLEAN DEFAULT false,
  profile_level INTEGER DEFAULT 1 CHECK (profile_level IN (1, 2, 3)),
  profile_completeness_score INTEGER DEFAULT 0 CHECK (profile_completeness_score >= 0 AND profile_completeness_score <= 100),
  last_profile_update TIMESTAMPTZ DEFAULT now(),
  country_iso TEXT CHECK (country_iso IS NULL OR country_iso IN ('ZA', 'NG', 'KE', 'GB', 'IN')),
  short_id TEXT UNIQUE,
  must_change_password BOOLEAN DEFAULT false,
  invited_by UUID,
  invitation_sent_at TIMESTAMPTZ,
  temp_password_expires_at TIMESTAMPTZ,
  first_login_at TIMESTAMPTZ,
  user_type public.user_type DEFAULT 'looplly_user' CHECK (user_type IN ('looplly_user', 'client_user')),
  company_name TEXT,
  company_role TEXT,
  is_test_account BOOLEAN DEFAULT false,
  level_2_complete BOOLEAN DEFAULT false,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.profiles_team_backup (
  -- Backup table for team migration - same structure as profiles
  id UUID,
  user_id UUID,
  first_name TEXT,
  last_name TEXT,
  mobile TEXT,
  country_code TEXT,
  gender TEXT,
  date_of_birth DATE,
  address TEXT,
  household_income TEXT,
  ethnicity TEXT,
  sec TEXT,
  profile_complete BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  gps_enabled BOOLEAN,
  badge_preview_mode BOOLEAN,
  is_suspended BOOLEAN,
  profile_level INTEGER,
  profile_completeness_score INTEGER,
  last_profile_update TIMESTAMPTZ,
  country_iso TEXT,
  short_id TEXT,
  must_change_password BOOLEAN,
  invited_by UUID,
  invitation_sent_at TIMESTAMPTZ,
  temp_password_expires_at TIMESTAMPTZ,
  first_login_at TIMESTAMPTZ,
  user_type public.user_type,
  company_name TEXT,
  company_role TEXT,
  is_test_account BOOLEAN,
  level_2_complete BOOLEAN,
  personal_income TEXT,
  password_hash TEXT
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

CREATE TABLE public.communication_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  sms_enabled BOOLEAN DEFAULT false,
  whatsapp_enabled BOOLEAN DEFAULT false,
  push_enabled BOOLEAN DEFAULT false,
  email_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mobile TEXT NOT NULL,
  otp_code TEXT NOT NULL,
  verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.kyc_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE UNIQUE NOT NULL,
  verified BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'expired')),
  provider TEXT,
  verification_date TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.address_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  place_id TEXT,
  formatted_address TEXT NOT NULL,
  street_number TEXT,
  route TEXT,
  locality TEXT,
  administrative_area_level_1 TEXT,
  administrative_area_level_2 TEXT,
  country TEXT,
  postal_code TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  is_primary BOOLEAN DEFAULT true,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- TEAM PROFILES (B2B Users)
-- ----------------------------------------------------------------------------

CREATE TABLE public.team_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  company_role TEXT,
  is_active BOOLEAN DEFAULT true,
  must_change_password BOOLEAN DEFAULT false,
  temp_password_expires_at TIMESTAMPTZ,
  first_login_at TIMESTAMPTZ,
  invited_by UUID REFERENCES auth.users(id),
  invitation_sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  department TEXT,
  access_level TEXT DEFAULT 'standard',
  added_at TIMESTAMPTZ DEFAULT now(),
  added_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  notes TEXT
);

CREATE TABLE public.team_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_user_id UUID REFERENCES public.team_profiles(user_id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- PROFILING SYSTEM
-- ----------------------------------------------------------------------------

CREATE TABLE public.profile_decay_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  interval_type TEXT NOT NULL,
  interval_days INTEGER,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.profile_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  default_decay_config_key TEXT REFERENCES public.profile_decay_config(config_key),
  short_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.profile_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.profile_categories(id) ON DELETE CASCADE NOT NULL,
  question_key TEXT UNIQUE NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('text', 'select', 'multiselect', 'date', 'number', 'address', 'email', 'phone', 'boolean')),
  validation_rules JSONB DEFAULT '{}'::jsonb,
  options JSONB,
  placeholder TEXT,
  help_text TEXT,
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  is_required BOOLEAN DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  staleness_days INTEGER DEFAULT 365,
  is_immutable BOOLEAN NOT NULL DEFAULT false,
  decay_config_key TEXT REFERENCES public.profile_decay_config(config_key),
  applicability TEXT DEFAULT 'global' CHECK (applicability IN ('global', 'country_specific')),
  country_codes TEXT[],
  targeting_tags TEXT[],
  question_group TEXT,
  is_draft BOOLEAN NOT NULL DEFAULT false,
  short_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.question_answer_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  short_id TEXT UNIQUE NOT NULL,
  question_id UUID REFERENCES public.profile_questions(id) ON DELETE CASCADE NOT NULL,
  question_short_id TEXT NOT NULL,
  value TEXT NOT NULL,
  label TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(question_id, value)
);

CREATE TABLE public.profile_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.profile_questions(id) ON DELETE CASCADE NOT NULL,
  answer_value TEXT,
  answer_json JSONB,
  answer_normalized TEXT,
  selected_option_short_id TEXT,
  targeting_metadata JSONB DEFAULT '{}'::jsonb,
  is_verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id),
  last_updated TIMESTAMPTZ DEFAULT now(),
  is_stale BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, question_id)
);

CREATE TABLE public.country_question_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.profile_questions(id) ON DELETE CASCADE NOT NULL,
  country_code TEXT NOT NULL,
  options JSONB NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_fallback BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(question_id, country_code)
);

CREATE TABLE public.country_profiling_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT NOT NULL,
  country_iso TEXT NOT NULL,
  country_name TEXT NOT NULL,
  question_id UUID REFERENCES public.profile_questions(id) ON DELETE CASCADE NOT NULL,
  question_key TEXT NOT NULL,
  question_text TEXT NOT NULL,
  draft_options JSONB,
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  ai_metadata JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'processing')),
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  admin_feedback TEXT,
  detected_at TIMESTAMPTZ DEFAULT now(),
  generated_at TIMESTAMPTZ,
  tenant_id UUID REFERENCES public.tenants(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(country_code, question_id, tenant_id)
);

CREATE TABLE public.question_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.profile_questions(id) ON DELETE SET NULL,
  changed_by UUID REFERENCES auth.users(id),
  change_type TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  changed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.auto_approval_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_key TEXT NOT NULL,
  auto_approve_enabled BOOLEAN DEFAULT false,
  confidence_threshold INTEGER DEFAULT 90 CHECK (confidence_threshold >= 0 AND confidence_threshold <= 100),
  require_manual_review BOOLEAN DEFAULT true,
  tenant_id UUID REFERENCES public.tenants(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(question_key, tenant_id)
);

-- ----------------------------------------------------------------------------
-- COUNTRY/LEGAL CONFIG
-- ----------------------------------------------------------------------------

CREATE TABLE public.country_legal_age (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT UNIQUE NOT NULL,
  minimum_age INTEGER NOT NULL DEFAULT 18 CHECK (minimum_age >= 13 AND minimum_age <= 25),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.country_blocklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  country_code TEXT UNIQUE NOT NULL,
  country_name TEXT NOT NULL,
  dial_code TEXT NOT NULL,
  reason TEXT NOT NULL,
  blocked_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- FINANCIAL SYSTEM
-- ----------------------------------------------------------------------------

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earning', 'withdrawal', 'bonus', 'referral')),
  amount NUMERIC NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.user_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_earned NUMERIC NOT NULL DEFAULT 0.00,
  available_balance NUMERIC NOT NULL DEFAULT 0.00,
  pending_balance NUMERIC NOT NULL DEFAULT 0.00,
  lifetime_withdrawn NUMERIC NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.withdrawal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  method TEXT NOT NULL CHECK (method IN ('paypal', 'mpesa', 'bitcoin', 'usdt', 'airtime')),
  destination TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  transaction_id TEXT,
  fee_amount NUMERIC DEFAULT 0.00,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.earning_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('survey', 'video', 'task', 'app_download', 'game_play')),
  title TEXT NOT NULL,
  description TEXT,
  reward_amount NUMERIC NOT NULL CHECK (reward_amount > 0),
  time_estimate INTEGER,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'in_progress', 'completed', 'expired')),
  external_id TEXT,
  provider TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.earning_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_key TEXT UNIQUE NOT NULL,
  rule_name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  tenant_id UUID REFERENCES public.tenants(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- REFERRAL SYSTEM
-- ----------------------------------------------------------------------------

CREATE TABLE public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'qualified')),
  reward_amount NUMERIC DEFAULT 0.00,
  qualified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

CREATE TABLE public.user_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  referred_user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  referral_code TEXT,
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'joined', 'qualified', 'paid')),
  earnings NUMERIC DEFAULT 0.00 CHECK (earnings >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  qualified_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

CREATE TABLE public.user_referral_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE UNIQUE NOT NULL,
  invited_count INTEGER DEFAULT 0 CHECK (invited_count >= 0),
  joined_count INTEGER DEFAULT 0 CHECK (joined_count >= 0),
  qualified_count INTEGER DEFAULT 0 CHECK (qualified_count >= 0),
  total_earnings NUMERIC DEFAULT 0.00 CHECK (total_earnings >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- REPUTATION & GAMIFICATION
-- ----------------------------------------------------------------------------

CREATE TABLE public.user_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE UNIQUE NOT NULL,
  score INTEGER DEFAULT 0 CHECK (score >= 0),
  level TEXT DEFAULT 'Bronze Novice',
  tier TEXT DEFAULT 'Bronze',
  prestige INTEGER DEFAULT 0 CHECK (prestige >= 0),
  next_level_threshold INTEGER DEFAULT 100,
  history JSONB DEFAULT '[]'::jsonb,
  quality_metrics JSONB DEFAULT '{"averageTime": "0 min", "speedingRate": 0, "surveysRejected": 0, "consistencyScore": 0, "surveysCompleted": 0}'::jsonb,
  beta_cohort BOOLEAN DEFAULT true,
  cohort_joined_at TIMESTAMPTZ DEFAULT now(),
  beta_rep_cap INTEGER DEFAULT 1000,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.badge_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tier TEXT CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  rarity TEXT CHECK (rarity IN ('Common', 'Rare', 'Epic', 'Legendary')),
  category TEXT,
  icon_url TEXT,
  icon_name TEXT,
  shape TEXT CHECK (shape IN ('circle', 'hexagon', 'star', 'diamond')),
  rep_points INTEGER DEFAULT 0,
  requirement TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tenant_id, name)
);

CREATE TABLE public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE UNIQUE NOT NULL,
  current_streak INTEGER DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak INTEGER DEFAULT 0 CHECK (longest_streak >= 0),
  last_activity_date DATE,
  streak_started_at TIMESTAMPTZ,
  milestones JSONB DEFAULT '{"weekly": {"count": 0, "achieved": false}, "yearly": {"count": 0, "achieved": false}, "monthly": {"count": 0, "achieved": false}, "quarterly": {"count": 0, "achieved": false}}'::jsonb,
  unlocked_stages JSONB NOT NULL DEFAULT '{"stage1": true, "stage2": false}'::jsonb,
  stage_unlock_history JSONB DEFAULT '[]'::jsonb,
  consecutive_days_missed INTEGER NOT NULL DEFAULT 0,
  grace_period_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.streak_unlock_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stage INTEGER NOT NULL CHECK (stage >= 1 AND stage <= 4),
  config_key TEXT NOT NULL,
  config_value JSONB NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  tenant_id UUID REFERENCES public.tenants(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(stage, config_key, tenant_id)
);

-- ----------------------------------------------------------------------------
-- COMMUNITY FEATURES
-- ----------------------------------------------------------------------------

CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('tip', 'poll', 'suggestion')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  category TEXT,
  moderation_score JSONB,
  poll_options JSONB,
  reputation_impact INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.community_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- ----------------------------------------------------------------------------
-- DOCUMENTATION SYSTEM
-- ----------------------------------------------------------------------------

CREATE TABLE public.documentation (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] NOT NULL,
  description TEXT NOT NULL,
  audience TEXT NOT NULL,
  parent TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'coming_soon')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.documentation_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  section TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.documentation_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID REFERENCES public.documentation_questions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  answer TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  is_accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.documentation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating IN (1, -1)),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.documentation_reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  progress_percent INTEGER CHECK (progress_percent >= 0 AND progress_percent <= 100),
  last_position TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(document_id, user_id)
);

CREATE TABLE public.documentation_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  document_id TEXT,
  action TEXT NOT NULL CHECK (action IN ('view', 'search', 'download')),
  ip_address INET,
  user_agent TEXT,
  search_query TEXT,
  result_count INTEGER,
  clicked_result_id TEXT,
  accessed_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- AI AGENTS & AUTOMATION
-- ----------------------------------------------------------------------------

CREATE TABLE public.ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  purpose TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  status public.agent_status NOT NULL DEFAULT 'active',
  tenant_id UUID REFERENCES public.tenants(id),
  is_system BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE NOT NULL,
  config_key TEXT NOT NULL,
  config_value JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_secret BOOLEAN NOT NULL DEFAULT false,
  data_type public.config_data_type NOT NULL DEFAULT 'string',
  description TEXT,
  tenant_id UUID REFERENCES public.tenants(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agent_id, config_key, tenant_id)
);

CREATE TABLE public.agent_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE NOT NULL,
  dependent_agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE NOT NULL,
  dependency_type public.dependency_type NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(parent_agent_id, dependent_agent_id, dependency_type)
);

CREATE TABLE public.agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.ai_agents(id) ON DELETE CASCADE NOT NULL,
  execution_id TEXT UNIQUE NOT NULL,
  status public.execution_status NOT NULL,
  trigger_type TEXT NOT NULL,
  trigger_data JSONB DEFAULT '{}'::jsonb,
  response_time_ms INTEGER,
  api_calls_made INTEGER DEFAULT 0,
  api_cost_usd NUMERIC DEFAULT 0.00,
  error_type TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  tenant_id UUID REFERENCES public.tenants(id),
  user_id UUID,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- APP CONFIGURATION
-- ----------------------------------------------------------------------------

CREATE TABLE public.app_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  environment TEXT NOT NULL DEFAULT 'production' CHECK (environment IN ('production', 'staging', 'development')),
  tenant_id UUID REFERENCES public.tenants(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(key, environment, tenant_id)
);

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES public.tenants(id),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- SECTION 4: INDEXES (Including Missing Foreign Key Indexes)
-- ============================================================================

-- User & Profile Indexes
CREATE INDEX idx_profiles_mobile ON public.profiles(mobile) WHERE mobile IS NOT NULL;
CREATE INDEX idx_profiles_country_iso ON public.profiles(country_iso) WHERE country_iso IS NOT NULL;
CREATE INDEX idx_profiles_level ON public.profiles(profile_level);
CREATE INDEX idx_profiles_short_id ON public.profiles(short_id);
CREATE INDEX idx_profiles_test_account ON public.profiles(is_test_account) WHERE is_test_account = true;
CREATE INDEX idx_profiles_must_change_password ON public.profiles(must_change_password) WHERE must_change_password = true;
CREATE INDEX idx_profiles_company_name ON public.profiles(company_name);

-- Address Components
CREATE INDEX idx_address_components_user ON public.address_components(user_id);

-- KYC
CREATE INDEX idx_kyc_verifications_user_id ON public.kyc_verifications(user_id);

-- OTP (MISSING INDEX - PERFORMANCE FIX)
CREATE INDEX idx_otp_verifications_user_id ON public.otp_verifications(user_id);

-- Profile Questions & Answers
CREATE INDEX idx_profile_questions_category ON public.profile_questions(category_id);
CREATE INDEX idx_profile_questions_level ON public.profile_questions(level);
CREATE INDEX idx_profile_questions_short_id ON public.profile_questions(short_id);
CREATE INDEX idx_questions_applicability ON public.profile_questions(applicability);
CREATE INDEX idx_questions_country ON public.profile_questions USING GIN(country_codes);
CREATE INDEX idx_questions_group ON public.profile_questions(question_group);
CREATE INDEX idx_questions_targeting ON public.profile_questions USING GIN(targeting_tags);
CREATE INDEX idx_profile_questions_decay_config_key ON public.profile_questions(decay_config_key); -- MISSING INDEX

CREATE INDEX idx_profile_answers_user ON public.profile_answers(user_id);
CREATE INDEX idx_profile_answers_question ON public.profile_answers(question_id);
CREATE INDEX idx_profile_answers_stale ON public.profile_answers(is_stale);
CREATE INDEX idx_profile_answers_option_short_id ON public.profile_answers(selected_option_short_id);
CREATE INDEX idx_answers_user_question ON public.profile_answers(user_id, question_id);
CREATE INDEX idx_answers_normalized ON public.profile_answers(answer_normalized);
CREATE INDEX idx_answers_user_normalized ON public.profile_answers(user_id, answer_normalized);
CREATE INDEX idx_answers_targeting_metadata ON public.profile_answers USING GIN(targeting_metadata);
CREATE INDEX idx_profile_answers_verified_by ON public.profile_answers(verified_by); -- MISSING INDEX

-- Profile Categories
CREATE INDEX idx_profile_categories_short_id ON public.profile_categories(short_id);
CREATE INDEX idx_profile_categories_default_decay_config_key ON public.profile_categories(default_decay_config_key); -- MISSING INDEX

-- Question Answer Options
CREATE INDEX idx_answer_options_question ON public.question_answer_options(question_id);
CREATE INDEX idx_answer_options_question_short ON public.question_answer_options(question_short_id);
CREATE INDEX idx_answer_options_short_id ON public.question_answer_options(short_id);

-- Question Audit
CREATE INDEX idx_question_audit_log_question_id ON public.question_audit_log(question_id);
CREATE INDEX idx_question_audit_log_changed_by ON public.question_audit_log(changed_by);
CREATE INDEX idx_question_audit_log_changed_at ON public.question_audit_log(changed_at DESC);

-- Country Profiling
CREATE INDEX idx_country_options_question ON public.country_question_options(question_id);
CREATE INDEX idx_country_options_country ON public.country_question_options(country_code);

CREATE INDEX idx_gaps_country ON public.country_profiling_gaps(country_code);
CREATE INDEX idx_gaps_status ON public.country_profiling_gaps(status);
CREATE INDEX idx_gaps_confidence ON public.country_profiling_gaps(confidence_score);
CREATE INDEX idx_gaps_tenant ON public.country_profiling_gaps(tenant_id);
CREATE INDEX idx_country_profiling_gaps_question_id ON public.country_profiling_gaps(question_id); -- MISSING INDEX
CREATE INDEX idx_country_profiling_gaps_reviewed_by ON public.country_profiling_gaps(reviewed_by); -- MISSING INDEX

-- Country Blocklist
CREATE INDEX idx_country_blocklist_dial_code ON public.country_blocklist(dial_code);

-- Auto Approval Config (MISSING INDEX)
CREATE INDEX idx_auto_approval_config_tenant_id ON public.auto_approval_config(tenant_id);

-- Financial
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);

CREATE INDEX idx_earning_activities_user_id ON public.earning_activities(user_id);
CREATE INDEX idx_earning_activities_status ON public.earning_activities(status);

CREATE INDEX idx_withdrawal_requests_user_id ON public.withdrawal_requests(user_id);
CREATE INDEX idx_withdrawal_requests_status ON public.withdrawal_requests(status);

CREATE INDEX idx_earning_rules_tenant_id ON public.earning_rules(tenant_id); -- MISSING INDEX

-- Referrals
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON public.referrals(referred_id); -- MISSING INDEX

CREATE INDEX idx_user_referrals_referrer ON public.user_referrals(referrer_user_id);
CREATE INDEX idx_user_referrals_referred ON public.user_referrals(referred_user_id);
CREATE INDEX idx_user_referrals_status ON public.user_referrals(status);

CREATE INDEX idx_user_referral_stats_user_id ON public.user_referral_stats(user_id);

-- Reputation & Gamification
CREATE INDEX idx_user_reputation_user_id ON public.user_reputation(user_id);
CREATE INDEX idx_user_reputation_score ON public.user_reputation(score);
CREATE INDEX idx_user_reputation_beta_cohort ON public.user_reputation(beta_cohort);

CREATE INDEX idx_badge_catalog_tenant ON public.badge_catalog(tenant_id);
CREATE INDEX idx_badge_catalog_tier ON public.badge_catalog(tier);

CREATE INDEX idx_user_streaks_user_id ON public.user_streaks(user_id);

CREATE INDEX idx_streak_unlock_config_stage ON public.streak_unlock_config(stage);
CREATE INDEX idx_streak_unlock_config_active ON public.streak_unlock_config(is_active) WHERE is_active = true;
CREATE INDEX idx_streak_unlock_config_tenant_id ON public.streak_unlock_config(tenant_id); -- MISSING INDEX

-- Community
CREATE INDEX idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX idx_community_posts_status ON public.community_posts(status);
CREATE INDEX idx_community_posts_created_at ON public.community_posts(created_at DESC);

CREATE INDEX idx_community_votes_post_id ON public.community_votes(post_id);
CREATE INDEX idx_community_votes_user_id ON public.community_votes(user_id);

-- Documentation
CREATE INDEX idx_documentation_category ON public.documentation(category);
CREATE INDEX idx_documentation_audience ON public.documentation(audience);
CREATE INDEX idx_documentation_status ON public.documentation(status);

CREATE INDEX idx_documentation_questions_document_id ON public.documentation_questions(document_id);

CREATE INDEX idx_documentation_answers_question_id ON public.documentation_answers(question_id);

CREATE INDEX idx_documentation_feedback_document_id ON public.documentation_feedback(document_id);
CREATE INDEX idx_documentation_feedback_user_id ON public.documentation_feedback(user_id);

CREATE INDEX idx_documentation_reading_progress_user_id ON public.documentation_reading_progress(user_id);

CREATE INDEX idx_doc_access_user ON public.documentation_access_log(user_id);
CREATE INDEX idx_doc_access_time ON public.documentation_access_log(accessed_at DESC);

-- Team
CREATE INDEX idx_team_activity_log_team_user_id ON public.team_activity_log(team_user_id); -- MISSING INDEX

CREATE INDEX idx_team_members_added_by ON public.team_members(added_by); -- MISSING INDEX

CREATE INDEX idx_team_profiles_invited_by ON public.team_profiles(invited_by); -- MISSING INDEX

-- Tenants
CREATE INDEX idx_tenants_slug ON public.tenants(slug);
CREATE INDEX idx_tenants_api_key ON public.tenants(api_key);

-- AI Agents
CREATE INDEX idx_ai_agents_tenant_id ON public.ai_agents(tenant_id); -- MISSING INDEX

CREATE INDEX idx_agent_configs_agent_id ON public.agent_configs(agent_id);
CREATE INDEX idx_agent_configs_tenant_id ON public.agent_configs(tenant_id); -- MISSING INDEX

CREATE INDEX idx_agent_dependencies_parent ON public.agent_dependencies(parent_agent_id);
CREATE INDEX idx_agent_dependencies_dependent ON public.agent_dependencies(dependent_agent_id);

CREATE INDEX idx_agent_executions_agent_id ON public.agent_executions(agent_id);
CREATE INDEX idx_agent_executions_status ON public.agent_executions(status);
CREATE INDEX idx_agent_executions_created_at ON public.agent_executions(created_at DESC);
CREATE INDEX idx_agent_executions_tenant_id ON public.agent_executions(tenant_id); -- MISSING INDEX

-- App Configuration
CREATE INDEX idx_app_secrets_key ON public.app_secrets(key);
CREATE INDEX idx_app_secrets_environment ON public.app_secrets(environment);
CREATE INDEX idx_app_secrets_public ON public.app_secrets(is_public);
CREATE INDEX idx_app_secrets_tenant ON public.app_secrets(tenant_id);

CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_tenant ON public.audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);

-- ============================================================================
-- SECTION 5: FUNCTIONS (With Security Fixes)
-- ============================================================================

-- Utility: Update timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Utility: Update profile timestamp
CREATE OR REPLACE FUNCTION public.update_profile_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Role checking functions
CREATE OR REPLACE FUNCTION public.has_role(required_role public.app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = required_role
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.has_role_or_higher(required_role public.app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role_level INTEGER;
  required_level INTEGER;
BEGIN
  SELECT CASE role
    WHEN 'super_admin' THEN 4
    WHEN 'admin' THEN 3
    WHEN 'tester' THEN 2
    WHEN 'user' THEN 1
  END INTO user_role_level
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY CASE role
    WHEN 'super_admin' THEN 4
    WHEN 'admin' THEN 3
    WHEN 'tester' THEN 2
    WHEN 'user' THEN 1
  END DESC
  LIMIT 1;

  required_level := CASE required_role
    WHEN 'super_admin' THEN 4
    WHEN 'admin' THEN 3
    WHEN 'tester' THEN 2
    WHEN 'user' THEN 1
  END;

  RETURN COALESCE(user_role_level, 0) >= required_level;
END;
$$;

-- Team member check
CREATE OR REPLACE FUNCTION public.is_team_member()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.team_profiles
    WHERE user_id = auth.uid() AND is_active = true
  );
END;
$$;

-- Profile viewing permission
CREATE OR REPLACE FUNCTION public.can_view_user_profile(target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  viewer_role public.app_role;
  target_user_type public.user_type;
  viewer_is_team BOOLEAN;
BEGIN
  -- Own profile
  IF auth.uid() = target_user_id THEN
    RETURN TRUE;
  END IF;

  -- Get viewer role
  SELECT role INTO viewer_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY CASE role
    WHEN 'super_admin' THEN 4
    WHEN 'admin' THEN 3
    WHEN 'tester' THEN 2
    WHEN 'user' THEN 1
  END DESC
  LIMIT 1;

  -- Super admin sees all
  IF viewer_role = 'super_admin' THEN
    RETURN TRUE;
  END IF;

  -- Get target user type
  SELECT user_type INTO target_user_type
  FROM public.profiles
  WHERE user_id = target_user_id;

  -- Check if viewer is team member
  viewer_is_team := EXISTS (
    SELECT 1 FROM public.team_profiles
    WHERE user_id = auth.uid() AND is_active = true
  );

  -- Admins can see looplly users
  IF viewer_role = 'admin' AND target_user_type = 'looplly_user' THEN
    RETURN TRUE;
  END IF;

  -- Team members can see client users
  IF viewer_is_team AND target_user_type = 'client_user' THEN
    RETURN TRUE;
  END IF;

  -- Testers can see test accounts
  IF viewer_role = 'tester' THEN
    RETURN EXISTS (
      SELECT 1 FROM public.profiles
      WHERE user_id = target_user_id AND is_test_account = true
    );
  END IF;

  RETURN FALSE;
END;
$$;

-- Balance initialization
CREATE OR REPLACE FUNCTION public.initialize_user_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_balances (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Transaction balance update
CREATE OR REPLACE FUNCTION public.update_user_balance_on_transaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' THEN
    IF NEW.type = 'earning' OR NEW.type = 'bonus' OR NEW.type = 'referral' THEN
      UPDATE public.user_balances
      SET
        total_earned = total_earned + NEW.amount,
        available_balance = available_balance + NEW.amount
      WHERE user_id = NEW.user_id;
    ELSIF NEW.type = 'withdrawal' THEN
      UPDATE public.user_balances
      SET
        available_balance = available_balance - NEW.amount,
        lifetime_withdrawn = lifetime_withdrawn + NEW.amount
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Mobile normalization
CREATE OR REPLACE FUNCTION public.normalize_mobile_number(mobile_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN regexp_replace(mobile_input, '[^0-9+]', '', 'g');
END;
$$;

CREATE OR REPLACE FUNCTION public.normalize_profile_mobile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.mobile IS NOT NULL THEN
    NEW.mobile := normalize_mobile_number(NEW.mobile);
  END IF;
  RETURN NEW;
END;
$$;

-- Country ISO synchronization
CREATE OR REPLACE FUNCTION public.get_country_iso_from_dial_code(dial_code_input TEXT)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN CASE dial_code_input
    WHEN '+27' THEN 'ZA'
    WHEN '+234' THEN 'NG'
    WHEN '+254' THEN 'KE'
    WHEN '+44' THEN 'GB'
    WHEN '+91' THEN 'IN'
    ELSE NULL
  END;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_country_iso()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.country_code IS NOT NULL THEN
    NEW.country_iso := get_country_iso_from_dial_code(NEW.country_code);
  END IF;
  RETURN NEW;
END;
$$;

-- Age validation
CREATE OR REPLACE FUNCTION public.validate_user_age(user_id_input UUID, date_of_birth_input DATE)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  user_country TEXT;
  min_age INTEGER;
  user_age INTEGER;
BEGIN
  SELECT country_iso INTO user_country
  FROM public.profiles
  WHERE user_id = user_id_input;

  SELECT minimum_age INTO min_age
  FROM public.country_legal_age
  WHERE country_code = user_country;

  IF min_age IS NULL THEN
    min_age := 18; -- Default
  END IF;

  user_age := EXTRACT(YEAR FROM age(date_of_birth_input));

  RETURN user_age >= min_age;
END;
$$;

CREATE OR REPLACE FUNCTION public.check_age_before_save()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  question_key_val TEXT;
  dob DATE;
BEGIN
  SELECT question_key INTO question_key_val
  FROM public.profile_questions
  WHERE id = NEW.question_id;

  IF question_key_val = 'date_of_birth' THEN
    BEGIN
      dob := NEW.answer_value::DATE;
      IF NOT validate_user_age(NEW.user_id, dob) THEN
        RAISE EXCEPTION 'User does not meet minimum age requirement for their country';
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE EXCEPTION 'Invalid date format for date of birth';
    END;
  END IF;

  RETURN NEW;
END;
$$;

-- Targeting metadata computation
CREATE OR REPLACE FUNCTION public.compute_targeting_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  question_tags TEXT[];
  normalized_value TEXT;
BEGIN
  SELECT targeting_tags INTO question_tags
  FROM public.profile_questions
  WHERE id = NEW.question_id;

  IF question_tags IS NOT NULL AND array_length(question_tags, 1) > 0 THEN
    normalized_value := lower(trim(NEW.answer_value));
    NEW.answer_normalized := normalized_value;
    NEW.targeting_metadata := jsonb_build_object('tags', question_tags, 'value', normalized_value);
  END IF;

  RETURN NEW;
END;
$$;

-- Reputation initialization
CREATE OR REPLACE FUNCTION public.handle_new_user_reputation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_reputation (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Admin reputation adjustment
CREATE OR REPLACE FUNCTION public.admin_adjust_reputation(
  target_user_id UUID,
  points_to_add INTEGER,
  reason TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_user_id UUID;
BEGIN
  admin_user_id := auth.uid();
  
  IF NOT has_role_or_higher('admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can adjust reputation';
  END IF;

  UPDATE public.user_reputation
  SET
    score = score + points_to_add,
    history = history || jsonb_build_object(
      'timestamp', now(),
      'points', points_to_add,
      'reason', reason,
      'adjusted_by', admin_user_id
    )
  WHERE user_id = target_user_id;
END;
$$;

-- Level 1 question audit
CREATE OR REPLACE FUNCTION public.audit_level_1_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.level = 1 AND NEW.level = 1) OR 
     (TG_OP = 'INSERT' AND NEW.level = 1) OR
     (TG_OP = 'DELETE' AND OLD.level = 1) THEN
    
    INSERT INTO public.question_audit_log (
      question_id,
      changed_by,
      change_type,
      old_values,
      new_values
    ) VALUES (
      COALESCE(NEW.id, OLD.id),
      auth.uid(),
      TG_OP,
      CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE NULL END,
      CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE NULL END
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Targeting query helper
CREATE OR REPLACE FUNCTION public.get_targeting_values_by_question(question_key_input TEXT)
RETURNS TABLE(value TEXT, count BIGINT)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pa.answer_normalized AS value,
    COUNT(*) AS count
  FROM public.profile_answers pa
  JOIN public.profile_questions pq ON pa.question_id = pq.id
  WHERE pq.question_key = question_key_input
    AND pa.answer_normalized IS NOT NULL
  GROUP BY pa.answer_normalized
  ORDER BY count DESC;
END;
$$;

-- User search
CREATE OR REPLACE FUNCTION public.find_users_by_criteria(search_criteria JSONB)
RETURNS TABLE(user_id UUID, profile_data JSONB)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.user_id,
    jsonb_build_object(
      'user_id', p.user_id,
      'first_name', p.first_name,
      'last_name', p.last_name,
      'mobile', p.mobile,
      'country_iso', p.country_iso,
      'profile_level', p.profile_level
    ) AS profile_data
  FROM public.profiles p
  WHERE
    CASE
      WHEN search_criteria ? 'country_iso' THEN p.country_iso = search_criteria->>'country_iso'
      ELSE TRUE
    END
    AND CASE
      WHEN search_criteria ? 'profile_level' THEN p.profile_level = (search_criteria->>'profile_level')::INTEGER
      ELSE TRUE
    END
    AND CASE
      WHEN search_criteria ? 'is_test_account' THEN p.is_test_account = (search_criteria->>'is_test_account')::BOOLEAN
      ELSE TRUE
    END;
END;
$$;

-- Secret management
CREATE OR REPLACE FUNCTION public.get_public_app_secrets()
RETURNS TABLE(key TEXT, value TEXT, environment TEXT)
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT s.key, s.value, s.environment
  FROM public.app_secrets s
  WHERE s.is_public = true
    AND s.environment = current_setting('app.environment', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_app_secrets(secret_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  secret_value TEXT;
BEGIN
  IF NOT has_role_or_higher('admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can retrieve app secrets';
  END IF;

  SELECT value INTO secret_value
  FROM public.app_secrets
  WHERE key = secret_key
    AND environment = current_setting('app.environment', true);

  RETURN secret_value;
END;
$$;

-- User email retrieval
CREATE OR REPLACE FUNCTION public.get_user_email(user_id_input UUID)
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_id_input;

  RETURN user_email;
END;
$$;

-- Team profile retrieval
CREATE OR REPLACE FUNCTION public.get_team_profile(user_id_input UUID)
RETURNS TABLE(
  user_id UUID,
  email TEXT,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  company_role TEXT,
  is_active BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tp.user_id,
    tp.email,
    tp.first_name,
    tp.last_name,
    tp.company_name,
    tp.company_role,
    tp.is_active
  FROM public.team_profiles tp
  WHERE tp.user_id = user_id_input;
END;
$$;

-- Auth users with phone (admin only)
CREATE OR REPLACE FUNCTION public.get_auth_users_with_phones()
RETURNS TABLE(
  id UUID,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role_or_higher('admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can retrieve auth user data';
  END IF;

  RETURN QUERY
  SELECT
    u.id,
    u.phone,
    u.email,
    u.created_at
  FROM auth.users u
  WHERE u.phone IS NOT NULL;
END;
$$;

-- Journey reset (for testing/admin)
CREATE OR REPLACE FUNCTION public.reset_user_journey(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role_or_higher('admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can reset user journey';
  END IF;

  -- Reset profile level
  UPDATE public.profiles
  SET
    profile_level = 1,
    profile_completeness_score = 0,
    level_2_complete = false,
    last_profile_update = now()
  WHERE user_id = target_user_id;

  -- Delete answers
  DELETE FROM public.profile_answers
  WHERE user_id = target_user_id;

  -- Reset reputation
  UPDATE public.user_reputation
  SET
    score = 0,
    level = 'Bronze Novice',
    tier = 'Bronze',
    prestige = 0,
    history = '[]'::jsonb
  WHERE user_id = target_user_id;

  -- Reset streaks
  UPDATE public.user_streaks
  SET
    current_streak = 0,
    longest_streak = 0,
    last_activity_date = NULL,
    unlocked_stages = '{"stage1": true, "stage2": false}'::jsonb
  WHERE user_id = target_user_id;
END;
$$;

-- Profile insert trigger function
CREATE OR REPLACE FUNCTION public.insert_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Initialize related records
  INSERT INTO public.user_reputation (user_id) VALUES (NEW.user_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.user_streaks (user_id) VALUES (NEW.user_id) ON CONFLICT DO NOTHING;
  INSERT INTO public.user_balances (user_id) VALUES (NEW.user_id) ON CONFLICT DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- ============================================================================
-- SECTION 6: TRIGGERS
-- ============================================================================

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communication_preferences_updated_at BEFORE UPDATE ON public.communication_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kyc_verifications_updated_at BEFORE UPDATE ON public.kyc_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_country_legal_age_updated_at BEFORE UPDATE ON public.country_legal_age FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profile_categories_timestamp BEFORE UPDATE ON public.profile_categories FOR EACH ROW EXECUTE FUNCTION update_profile_timestamp();
CREATE TRIGGER update_profile_decay_config_updated_at BEFORE UPDATE ON public.profile_decay_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profile_questions_timestamp BEFORE UPDATE ON public.profile_questions FOR EACH ROW EXECUTE FUNCTION update_profile_timestamp();
CREATE TRIGGER update_answer_options_updated_at BEFORE UPDATE ON public.question_answer_options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_country_question_options_updated_at BEFORE UPDATE ON public.country_question_options FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_country_profiling_gaps_updated_at BEFORE UPDATE ON public.country_profiling_gaps FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_auto_approval_config_updated_at BEFORE UPDATE ON public.auto_approval_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_balances_updated_at BEFORE UPDATE ON public.user_balances FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_earning_activities_updated_at BEFORE UPDATE ON public.earning_activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_earning_rules_updated_at BEFORE UPDATE ON public.earning_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_referrals_updated_at BEFORE UPDATE ON public.referrals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_referral_stats_updated_at BEFORE UPDATE ON public.user_referral_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_reputation_updated_at BEFORE UPDATE ON public.user_reputation FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_badge_catalog_updated_at BEFORE UPDATE ON public.badge_catalog FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_streaks_updated_at BEFORE UPDATE ON public.user_streaks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_streak_unlock_config_updated_at BEFORE UPDATE ON public.streak_unlock_config FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_withdrawal_requests_updated_at BEFORE UPDATE ON public.withdrawal_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_profiles_updated_at BEFORE UPDATE ON public.team_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_agents_updated_at BEFORE UPDATE ON public.ai_agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agent_configs_updated_at BEFORE UPDATE ON public.agent_configs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.documentation FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_address_components_timestamp BEFORE UPDATE ON public.address_components FOR EACH ROW EXECUTE FUNCTION update_profile_timestamp();

-- Profile triggers
CREATE TRIGGER normalize_mobile_on_save BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION normalize_profile_mobile();
CREATE TRIGGER sync_country_iso_trigger BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION sync_country_iso();
CREATE TRIGGER on_profile_created_reputation AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_new_user_reputation();
CREATE TRIGGER create_user_balance_on_profile AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION initialize_user_balance();

-- Profile answer triggers
CREATE TRIGGER validate_age_on_answer BEFORE INSERT OR UPDATE ON public.profile_answers FOR EACH ROW EXECUTE FUNCTION check_age_before_save();
CREATE TRIGGER compute_targeting_trigger BEFORE INSERT OR UPDATE ON public.profile_answers FOR EACH ROW EXECUTE FUNCTION compute_targeting_metadata();

-- Question audit triggers
CREATE TRIGGER audit_level_1_question_changes AFTER INSERT OR UPDATE OR DELETE ON public.profile_questions FOR EACH ROW EXECUTE FUNCTION audit_level_1_changes();

-- Transaction trigger
CREATE TRIGGER update_balance_on_transaction AFTER INSERT OR UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_user_balance_on_transaction();

-- ============================================================================
-- SECTION 7: RLS POLICIES (Optimized for Performance)
-- ============================================================================
-- Note: Using (SELECT auth.uid()) instead of auth.uid() to prevent per-row re-evaluation
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles_team_backup ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.address_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_decay_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_answer_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_profiling_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auto_approval_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_legal_age ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.country_blocklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earning_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.earning_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_referral_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badge_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streak_unlock_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentation_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentation_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentation_reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentation_access_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- TENANTS: Public read for system, admin manage
-- ============================================================================

CREATE POLICY "Public can view active tenants"
ON public.tenants FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage tenants"
ON public.tenants FOR ALL
USING (has_role_or_higher('admin'));

-- ============================================================================
-- PROFILES: User own, admin view/edit with restrictions
-- ============================================================================

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins and super admins can view permitted profiles"
ON public.profiles FOR SELECT
USING (can_view_user_profile((SELECT auth.uid())));

CREATE POLICY "Admins and super admins can update permitted profiles"
ON public.profiles FOR UPDATE
USING (can_view_user_profile((SELECT auth.uid())));

CREATE POLICY "Testers can view test accounts"
ON public.profiles FOR SELECT
USING (
  has_role('tester') AND is_test_account = true
);

CREATE POLICY "Super admins can view team backup"
ON public.profiles_team_backup FOR SELECT
USING (has_role('super_admin'));

-- ============================================================================
-- USER ROLES: Self view, admin manage
-- ============================================================================

CREATE POLICY "Users can view own roles"
ON public.user_roles FOR SELECT
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can manage roles"
ON public.user_roles FOR ALL
USING (has_role_or_higher('admin'));

-- ============================================================================
-- COMMUNICATION PREFERENCES: User own data
-- ============================================================================

CREATE POLICY "Users can view their own communication preferences"
ON public.communication_preferences FOR SELECT
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own communication preferences"
ON public.communication_preferences FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own communication preferences"
ON public.communication_preferences FOR UPDATE
USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- OTP VERIFICATIONS: User own data
-- ============================================================================

CREATE POLICY "Users can view their own OTP verifications"
ON public.otp_verifications FOR SELECT
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own OTP verifications"
ON public.otp_verifications FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own OTP verifications"
ON public.otp_verifications FOR UPDATE
USING ((SELECT auth.uid()) = user_id);

-- ============================================================================
-- KYC VERIFICATIONS: User own, admin manage
-- ============================================================================

CREATE POLICY "Users can view own kyc"
ON public.kyc_verifications FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.user_id = kyc_verifications.user_id
    AND profiles.user_id = (SELECT auth.uid())
));

CREATE POLICY "Users can insert own kyc"
ON public.kyc_verifications FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.user_id = kyc_verifications.user_id
    AND profiles.user_id = (SELECT auth.uid())
));

CREATE POLICY "Users can update own kyc"
ON public.kyc_verifications FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.user_id = kyc_verifications.user_id
    AND profiles.user_id = (SELECT auth.uid())
));

CREATE POLICY "Admins can view all kyc"
ON public.kyc_verifications FOR SELECT
USING (has_role_or_higher('admin'));

CREATE POLICY "Admins can update all kyc"
ON public.kyc_verifications FOR UPDATE
USING (has_role_or_higher('admin'));

-- ============================================================================
-- ADDRESS COMPONENTS: User own, admin view
-- ============================================================================

CREATE POLICY "Users can view own addresses"
ON public.address_components FOR SELECT
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own addresses"
ON public.address_components FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own addresses"
ON public.address_components FOR UPDATE
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can view all addresses"
ON public.address_components FOR SELECT
USING (has_role_or_higher('admin'));

-- ============================================================================
-- TEAM PROFILES & MEMBERS: Team/admin only
-- ============================================================================

CREATE POLICY "Team members can view own profile"
ON public.team_profiles FOR SELECT
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can manage team profiles"
ON public.team_profiles FOR ALL
USING (has_role_or_higher('admin'));

CREATE POLICY "Only super admins can manage team members"
ON public.team_members FOR ALL
USING (has_role('super_admin'));

CREATE POLICY "Admins can view team activity"
ON public.team_activity_log FOR SELECT
USING (has_role_or_higher('admin'));

CREATE POLICY "Team users can insert activity"
ON public.team_activity_log FOR INSERT
WITH CHECK (is_team_member());

-- ============================================================================
-- PROFILING SYSTEM: Public read active, admin manage
-- ============================================================================

CREATE POLICY "Everyone can view decay configs"
ON public.profile_decay_config FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage decay configs"
ON public.profile_decay_config FOR ALL
USING (has_role_or_higher('admin'));

CREATE POLICY "Everyone can view active categories"
ON public.profile_categories FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage categories"
ON public.profile_categories FOR ALL
USING (has_role_or_higher('admin'));

CREATE POLICY "everyone_can_view_active_questions"
ON public.profile_questions FOR SELECT
USING (is_active = true AND is_draft = false);

CREATE POLICY "super_admins_manage_all_questions"
ON public.profile_questions FOR ALL
USING (has_role('super_admin'));

CREATE POLICY "admins_manage_level_2_3_questions"
ON public.profile_questions FOR ALL
USING (has_role_or_higher('admin') AND level IN (2, 3));

CREATE POLICY "Authenticated users can view active options"
ON public.question_answer_options FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage answer options"
ON public.question_answer_options FOR ALL
USING (has_role_or_higher('admin'));

-- Profile Answers
CREATE POLICY "Users can view own answers"
ON public.profile_answers FOR SELECT
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own answers"
ON public.profile_answers FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own answers"
ON public.profile_answers FOR UPDATE
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can view all answers"
ON public.profile_answers FOR SELECT
USING (has_role_or_higher('admin'));

CREATE POLICY "Admins can manage answers"
ON public.profile_answers FOR ALL
USING (has_role_or_higher('admin'));

-- Country Question Options
CREATE POLICY "Authenticated users can view country options"
ON public.country_question_options FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Admins can manage country options"
ON public.country_question_options FOR ALL
USING (has_role_or_higher('admin'));

-- Country Profiling Gaps
CREATE POLICY "Admins can view all gaps"
ON public.country_profiling_gaps FOR SELECT
USING (has_role_or_higher('admin'));

CREATE POLICY "Admins can manage gaps"
ON public.country_profiling_gaps FOR ALL
USING (has_role_or_higher('admin'));

-- Question Audit Log
CREATE POLICY "super_admins_view_audit_logs"
ON public.question_audit_log FOR SELECT
USING (has_role('super_admin'));

-- Auto Approval Config
CREATE POLICY "Admins can view config"
ON public.auto_approval_config FOR SELECT
USING (has_role_or_higher('admin'));

CREATE POLICY "Admins can manage config"
ON public.auto_approval_config FOR ALL
USING (has_role_or_higher('admin'));

-- ============================================================================
-- COUNTRY/LEGAL CONFIG: Public read, admin manage
-- ============================================================================

CREATE POLICY "Everyone can view legal ages"
ON public.country_legal_age FOR SELECT
USING (true);

CREATE POLICY "Admins can manage legal ages"
ON public.country_legal_age FOR ALL
USING (has_role_or_higher('admin'));

CREATE POLICY "Everyone can view blocklist"
ON public.country_blocklist FOR SELECT
USING (true);

CREATE POLICY "Staff can manage blocklist"
ON public.country_blocklist FOR ALL
USING (has_role_or_higher('admin'));

-- ============================================================================
-- FINANCIAL: User own data, admin oversight
-- ============================================================================

CREATE POLICY "Users can view own transactions"
ON public.transactions FOR SELECT
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own transactions"
ON public.transactions FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can view all transactions"
ON public.transactions FOR SELECT
USING (has_role_or_higher('admin'));

CREATE POLICY "Users can view own balance"
ON public.user_balances FOR SELECT
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can view all balances"
ON public.user_balances FOR SELECT
USING (has_role_or_higher('admin'));

CREATE POLICY "Users can view own withdrawal requests"
ON public.withdrawal_requests FOR SELECT
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can create withdrawal requests"
ON public.withdrawal_requests FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can manage withdrawals"
ON public.withdrawal_requests FOR ALL
USING (has_role_or_higher('admin'));

CREATE POLICY "Users can view their own earning activities"
ON public.earning_activities FOR SELECT
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert their own earning activities"
ON public.earning_activities FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update their own earning activities"
ON public.earning_activities FOR UPDATE
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can view earning rules"
ON public.earning_rules FOR SELECT
USING (has_role_or_higher('admin'));

CREATE POLICY "Admins can manage earning rules"
ON public.earning_rules FOR ALL
USING (has_role_or_higher('admin'));

-- ============================================================================
-- REFERRALS: User view own, insert own
-- ============================================================================

CREATE POLICY "Users can view referrals they made or received"
ON public.referrals FOR SELECT
USING ((SELECT auth.uid()) IN (referrer_id, referred_id));

CREATE POLICY "Users can insert referrals they made"
ON public.referrals FOR INSERT
WITH CHECK ((SELECT auth.uid()) = referrer_id);

CREATE POLICY "Users can update referrals they made"
ON public.referrals FOR UPDATE
USING ((SELECT auth.uid()) = referrer_id);

CREATE POLICY "Users can view own referrals"
ON public.user_referrals FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.user_id = (SELECT auth.uid())
    AND (profiles.user_id = user_referrals.referrer_user_id OR profiles.user_id = user_referrals.referred_user_id)
));

CREATE POLICY "Users can insert own referrals"
ON public.user_referrals FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.user_id = (SELECT auth.uid())
    AND profiles.user_id = user_referrals.referrer_user_id
));

CREATE POLICY "Users can view own referral stats"
ON public.user_referral_stats FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.user_id = user_referral_stats.user_id
    AND profiles.user_id = (SELECT auth.uid())
));

-- ============================================================================
-- REPUTATION & GAMIFICATION: User own read, system write
-- ============================================================================

CREATE POLICY "Users can view own reputation"
ON public.user_reputation FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.user_id = user_reputation.user_id
    AND profiles.user_id = (SELECT auth.uid())
));

CREATE POLICY "Admins can view all reputation"
ON public.user_reputation FOR SELECT
USING (has_role_or_higher('admin'));

CREATE POLICY "Everyone can view badge catalog"
ON public.badge_catalog FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage badge catalog"
ON public.badge_catalog FOR ALL
USING (has_role_or_higher('admin'));

CREATE POLICY "Users can view own streaks"
ON public.user_streaks FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.user_id = user_streaks.user_id
    AND profiles.user_id = (SELECT auth.uid())
));

CREATE POLICY "Authenticated users can view configs"
ON public.streak_unlock_config FOR SELECT
TO authenticated
USING (is_active = true);

CREATE POLICY "Admins can manage configs"
ON public.streak_unlock_config FOR ALL
USING (has_role_or_higher('admin'));

-- ============================================================================
-- COMMUNITY: Authenticated view approved, user manage own
-- ============================================================================

CREATE POLICY "All authenticated users can view approved posts"
ON public.community_posts FOR SELECT
TO authenticated
USING (status = 'approved');

CREATE POLICY "Users can insert own posts"
ON public.community_posts FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.user_id = community_posts.user_id
    AND profiles.user_id = (SELECT auth.uid())
));

CREATE POLICY "Users can update own posts"
ON public.community_posts FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.user_id = community_posts.user_id
    AND profiles.user_id = (SELECT auth.uid())
));

CREATE POLICY "Users can delete own posts"
ON public.community_posts FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.user_id = community_posts.user_id
    AND profiles.user_id = (SELECT auth.uid())
));

CREATE POLICY "Admins can manage all posts"
ON public.community_posts FOR ALL
USING (has_role_or_higher('admin'));

CREATE POLICY "All authenticated users can view votes"
ON public.community_votes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can insert own votes"
ON public.community_votes FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.user_id = community_votes.user_id
    AND profiles.user_id = (SELECT auth.uid())
));

CREATE POLICY "Users can update own votes"
ON public.community_votes FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.user_id = community_votes.user_id
    AND profiles.user_id = (SELECT auth.uid())
));

CREATE POLICY "Users can delete own votes"
ON public.community_votes FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.profiles
  WHERE profiles.user_id = community_votes.user_id
    AND profiles.user_id = (SELECT auth.uid())
));

-- ============================================================================
-- DOCUMENTATION: Team/admin write, authenticated read published
-- ============================================================================

CREATE POLICY "Team members and admins can read docs"
ON public.documentation FOR SELECT
TO authenticated
USING (is_team_member() OR has_role_or_higher('admin') OR status = 'published');

CREATE POLICY "Admins can manage docs"
ON public.documentation FOR ALL
USING (has_role_or_higher('admin'));

CREATE POLICY "Authenticated users can view questions"
ON public.documentation_questions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create questions"
ON public.documentation_questions FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own questions"
ON public.documentation_questions FOR UPDATE
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Authenticated users can view answers"
ON public.documentation_answers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create answers"
ON public.documentation_answers FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own answers"
ON public.documentation_answers FOR UPDATE
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Authenticated users can view feedback"
ON public.documentation_feedback FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create feedback"
ON public.documentation_feedback FOR INSERT
TO authenticated
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can view all feedback"
ON public.documentation_feedback FOR SELECT
USING (has_role_or_higher('admin'));

CREATE POLICY "Users can view own progress"
ON public.documentation_reading_progress FOR SELECT
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own progress"
ON public.documentation_reading_progress FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can update own progress"
ON public.documentation_reading_progress FOR UPDATE
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Users can insert own access logs"
ON public.documentation_access_log FOR INSERT
WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can view access logs"
ON public.documentation_access_log FOR SELECT
USING (has_role_or_higher('admin'));

-- ============================================================================
-- AI AGENTS: Admin manage, system read
-- ============================================================================

CREATE POLICY "Everyone can view active agents"
ON public.ai_agents FOR SELECT
USING (status = 'active');

CREATE POLICY "Admins can manage agents"
ON public.ai_agents FOR ALL
USING (has_role_or_higher('admin'));

CREATE POLICY "Admins can view configs"
ON public.agent_configs FOR SELECT
USING (has_role_or_higher('admin'));

CREATE POLICY "Admins can manage configs"
ON public.agent_configs FOR ALL
USING (has_role_or_higher('admin'));

CREATE POLICY "Admins can view dependencies"
ON public.agent_dependencies FOR SELECT
USING (has_role_or_higher('admin'));

CREATE POLICY "Admins can manage dependencies"
ON public.agent_dependencies FOR ALL
USING (has_role_or_higher('admin'));

CREATE POLICY "Users can view own executions"
ON public.agent_executions FOR SELECT
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can view all executions"
ON public.agent_executions FOR SELECT
USING (has_role_or_higher('admin'));

-- ============================================================================
-- APP CONFIGURATION: Admin only
-- ============================================================================

CREATE POLICY "Admins can view app secrets"
ON public.app_secrets FOR SELECT
USING (has_role_or_higher('admin'));

CREATE POLICY "Admins can manage app secrets"
ON public.app_secrets FOR ALL
USING (has_role_or_higher('admin'));

CREATE POLICY "Users can view own audit logs"
ON public.audit_logs FOR SELECT
USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "Admins can view all audit logs"
ON public.audit_logs FOR SELECT
USING (has_role_or_higher('admin'));

-- ============================================================================
-- END OF CONSOLIDATED MIGRATION
-- ============================================================================
