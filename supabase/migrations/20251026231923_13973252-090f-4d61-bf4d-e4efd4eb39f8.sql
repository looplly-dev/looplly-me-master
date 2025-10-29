-- =====================================================
-- ENFORCE TABLE SEPARATION: TEAM USERS vs REGULAR USERS
-- Per TABLE_ARCHITECTURE.md
-- =====================================================

-- 1. Verify team users exist in team_profiles (should already be there)
-- If not, this will copy them over
-- Email column does not exist in profiles table, using placeholder
INSERT INTO team_profiles (
  user_id, email, first_name, last_name, company_name, 
  company_role, is_active, created_at, updated_at
)
SELECT 
  user_id,
  COALESCE(first_name, 'team') || '@looplly.me' as email,  -- Generate placeholder email
  first_name,
  last_name,
  company_name,
  company_role,
  true,
  created_at,
  updated_at
FROM profiles
WHERE user_type = 'looplly_team_user'
ON CONFLICT (user_id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  company_name = EXCLUDED.company_name,
  company_role = EXCLUDED.company_role,
  updated_at = now();

-- 2. Create backup before deletion (safety measure)
CREATE TABLE IF NOT EXISTS profiles_team_backup AS 
SELECT * FROM profiles WHERE user_type = 'looplly_team_user';

-- 3. Delete team users from profiles table
DELETE FROM profiles WHERE user_type = 'looplly_team_user';

-- 4. Add CHECK constraint to prevent future violations
ALTER TABLE profiles
ADD CONSTRAINT profiles_no_team_users
CHECK (user_type IN ('looplly_user', 'client_user'));

-- 5. Add comment documenting the architecture
COMMENT ON CONSTRAINT profiles_no_team_users ON profiles IS 
'Enforces table separation per TABLE_ARCHITECTURE.md: profiles table is exclusively for looplly_user and client_user. Team users (looplly_team_user) must only exist in team_profiles table.';

-- 6. Verification queries
DO $$
DECLARE
  team_in_profiles INT;
  team_in_team_profiles INT;
BEGIN
  SELECT COUNT(*) INTO team_in_profiles FROM profiles WHERE user_type = 'looplly_team_user';
  SELECT COUNT(*) INTO team_in_team_profiles FROM team_profiles;
  
  RAISE NOTICE 'Team users in profiles table: % (should be 0)', team_in_profiles;
  RAISE NOTICE 'Team users in team_profiles table: % (should be 3+)', team_in_team_profiles;
  
  IF team_in_profiles > 0 THEN
    RAISE EXCEPTION 'Table separation failed: % team users still in profiles', team_in_profiles;
  END IF;
END $$;