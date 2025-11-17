-- Migration: Simplify Authentication to Standard Supabase Auth
-- Description: Remove custom JWT authentication and use standard Supabase Auth
-- Date: 2025-11-16

-- ============================================================================
-- PHASE 1: Remove Custom Auth Infrastructure
-- ============================================================================

-- 1.1 Drop custom auth mapping table if it exists
DROP TABLE IF EXISTS public.looplly_user_auth_mapping CASCADE;

-- 1.2 Remove password_hash column from profiles (now handled by auth.users)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS password_hash CASCADE;

-- ============================================================================
-- PHASE 2: Update Profiles Table for Standard Auth
-- ============================================================================

-- 2.1 Add email column to profiles for convenience (if not exists)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2.2 Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2.3 Ensure mobile index exists (for mobile-to-email lookup)
CREATE INDEX IF NOT EXISTS idx_profiles_mobile ON public.profiles(mobile);

-- ============================================================================
-- PHASE 3: Update Helper Function for Mobile Login
-- ============================================================================

-- 3.1 Drop existing function and recreate (parameter name was different)
DROP FUNCTION IF EXISTS public.get_user_email(UUID);

-- 3.2 Function to get email from user_id (enables mobile-based login)
CREATE OR REPLACE FUNCTION public.get_user_email(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Get email from auth.users table
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = user_uuid;
  
  RETURN user_email;
END;
$$;

-- 3.3 Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION public.get_user_email(UUID) TO authenticated, anon;

-- 3.3 Add comment for documentation
COMMENT ON FUNCTION public.get_user_email(UUID) IS 
'Returns the email address for a given user UUID. Used for mobile-based login lookup.';

-- ============================================================================
-- PHASE 4: Update Profile Creation Trigger
-- ============================================================================

-- 4.1 Create/update function to handle new auth.users insertions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create profile entry when auth.users record is created
  INSERT INTO public.profiles (
    user_id,
    mobile,
    country_code,
    first_name,
    last_name,
    date_of_birth,
    gps_enabled,
    email,
    profile_level,
    profile_completeness_score,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'mobile',
    NEW.raw_user_meta_data->>'country_code',
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    (NEW.raw_user_meta_data->>'date_of_birth')::DATE,
    COALESCE((NEW.raw_user_meta_data->>'gps_enabled')::BOOLEAN, false),
    NEW.email,
    1, -- Default profile level
    40, -- Default completeness score
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- 4.2 Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4.3 Add comment for documentation
COMMENT ON FUNCTION public.handle_new_user() IS 
'Automatically creates a profile entry when a new auth.users record is inserted. Handles standard Supabase Auth signUp flow.';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================