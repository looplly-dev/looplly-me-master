-- ============================================
-- PHASE 2A: Remove Mobile from Team Profiles
-- ============================================
-- Team members use email-only authentication
-- Mobile numbers are only for User Portal (looplly_user)

ALTER TABLE team_profiles 
DROP COLUMN IF EXISTS mobile,
DROP COLUMN IF EXISTS country_code;

COMMENT ON TABLE team_profiles IS 'Team member profiles for Admin Portal. Uses email-only authentication. Separate from User Portal profiles which use mobile authentication.';

-- ============================================
-- PHASE 2B: Add Mobile Uniqueness & Migrate Test Users
-- ============================================

-- Step 1: Migrate existing test users to new mobile range (+274129900X)
-- This prevents conflicts with real users who may use +274123400X range
-- Note: Removed email column reference (doesn't exist in profiles)
WITH test_user_numbers AS (
  SELECT 
    user_id,
    ROW_NUMBER() OVER (ORDER BY created_at) as row_num
  FROM profiles
  WHERE is_test_account = true
)
UPDATE profiles
SET mobile = CONCAT('+274129900', LPAD(test_user_numbers.row_num::TEXT, 1, '0'))
FROM test_user_numbers
WHERE profiles.user_id = test_user_numbers.user_id;

-- Step 2: Add UNIQUE constraint on mobile
ALTER TABLE profiles 
ADD CONSTRAINT profiles_mobile_unique UNIQUE (mobile);

-- Step 3: Add partial UNIQUE constraint on email (allow multiple NULLs, but unique values)
-- Note: Email column doesn't exist in profiles, skipping index creation
-- CREATE UNIQUE INDEX profiles_email_unique_idx 
-- ON profiles (email) 
-- WHERE email IS NOT NULL;

-- Step 4: Add performance index for mobile (only if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON profiles(mobile) WHERE mobile IS NOT NULL;

-- Add helpful comments
COMMENT ON CONSTRAINT profiles_mobile_unique ON profiles IS 
'Mobile numbers must be unique across all users. Mobile is the primary identifier for User Portal authentication.';

-- Email index comment removed (index doesn't exist)
-- COMMENT ON INDEX profiles_email_unique_idx IS 
-- 'Emails must be unique if provided, but multiple users can have NULL emails (email is optional for User Portal).';

-- Verification check
DO $$
DECLARE
  test_count INTEGER;
  conflicting_count INTEGER;
BEGIN
  -- Count test users
  SELECT COUNT(*) INTO test_count
  FROM profiles
  WHERE is_test_account = true;
  
  -- Check for any conflicts with real users in old range
  SELECT COUNT(*) INTO conflicting_count
  FROM profiles
  WHERE mobile LIKE '+274123%' AND is_test_account = true;
  
  IF conflicting_count > 0 THEN
    RAISE EXCEPTION 'Migration failed: % test users still have conflicting mobile numbers', conflicting_count;
  END IF;
  
  RAISE NOTICE 'Phase 2 migration successful: % test users migrated to +274129900X range', test_count;
END $$;