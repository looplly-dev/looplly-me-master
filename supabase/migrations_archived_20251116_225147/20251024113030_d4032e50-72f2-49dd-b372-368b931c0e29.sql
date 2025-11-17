-- ============================================
-- Phase 3: Grandfather Existing Users
-- Note: is_verified column doesn't exist in profiles table, skipping
-- ============================================

-- is_verified column doesn't exist, commenting out
-- UPDATE profiles
-- SET is_verified = true
-- WHERE created_at < NOW()
--   AND is_verified = false;

-- COMMENT ON COLUMN profiles.is_verified IS 
-- 'Mobile verification status. Grandfathered users (pre-Phase 3) are set to true by default.';
