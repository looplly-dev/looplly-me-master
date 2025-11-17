-- =====================================================
-- User Type Classification Fix - Step 1
-- Add new enum value (must be its own migration)
-- =====================================================

-- Add new enum value 'looplly_team_user'
-- This must be committed before it can be used anywhere
ALTER TYPE public.user_type ADD VALUE IF NOT EXISTS 'looplly_team_user';