-- ============================================================================
-- REMOVE UNUSED TEAM INVITATION FIELDS
-- ============================================================================
-- Remove invitation_sent_at, invited_by, and first_login_at from team_profiles
-- These were part of the old team member invitation system and are no longer needed
-- ============================================================================

ALTER TABLE public.team_profiles
  DROP COLUMN IF EXISTS invitation_sent_at,
  DROP COLUMN IF EXISTS invited_by,
  DROP COLUMN IF EXISTS first_login_at;
