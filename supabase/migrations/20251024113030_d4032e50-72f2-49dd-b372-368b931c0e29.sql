-- ============================================
-- Phase 3: Grandfather Existing Users
-- Set is_verified = true for users created before Phase 3
-- ============================================

-- Set is_verified = true for all existing users
UPDATE profiles
SET is_verified = true
WHERE created_at < NOW()
  AND is_verified = false;

COMMENT ON COLUMN profiles.is_verified IS 
'Mobile verification status. Grandfathered users (pre-Phase 3) are set to true by default.';