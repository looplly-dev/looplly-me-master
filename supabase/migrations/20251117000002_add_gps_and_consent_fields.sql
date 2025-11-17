-- Migration: Add GPS coordinates and consent timestamps to profiles
-- Description: Adds missing fields from registration form
-- Date: 2025-11-17

-- ============================================================================
-- PART 1: Add GPS Coordinate Columns
-- ============================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

CREATE INDEX IF NOT EXISTS idx_profiles_location ON public.profiles(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

COMMENT ON COLUMN public.profiles.latitude IS 'GPS latitude coordinate (captured during registration if GPS enabled)';
COMMENT ON COLUMN public.profiles.longitude IS 'GPS longitude coordinate (captured during registration if GPS enabled)';

-- ============================================================================
-- PART 2: Add Consent Timestamp Columns
-- ============================================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS privacy_policy_accepted_at TIMESTAMPTZ;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age_verified_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_privacy_accepted ON public.profiles(privacy_policy_accepted_at);
CREATE INDEX IF NOT EXISTS idx_profiles_age_verified ON public.profiles(age_verified_at);

COMMENT ON COLUMN public.profiles.privacy_policy_accepted_at IS 'Timestamp when user accepted privacy policy during registration';
COMMENT ON COLUMN public.profiles.age_verified_at IS 'Timestamp when user confirmed they are 18+ during registration';

-- ============================================================================
-- PART 3: Update Trigger to Extract GPS and Consent Data
-- ============================================================================

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
    latitude,
    longitude,
    email,
    privacy_policy_accepted_at,
    age_verified_at,
    profile_level,
    profile_completeness_score,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'mobile',
    NEW.raw_user_meta_data->>'country_code',
    NULLIF(COALESCE(NEW.raw_user_meta_data->>'first_name', ''), ''),
    NULLIF(COALESCE(NEW.raw_user_meta_data->>'last_name', ''), ''),
    CASE
      WHEN NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL
      THEN (NEW.raw_user_meta_data->>'date_of_birth')::DATE
      ELSE NULL
    END,
    COALESCE((NEW.raw_user_meta_data->>'gps_enabled')::BOOLEAN, false),
    CASE
      WHEN NEW.raw_user_meta_data->>'latitude' IS NOT NULL
      THEN (NEW.raw_user_meta_data->>'latitude')::DECIMAL
      ELSE NULL
    END,
    CASE
      WHEN NEW.raw_user_meta_data->>'longitude' IS NOT NULL
      THEN (NEW.raw_user_meta_data->>'longitude')::DECIMAL
      ELSE NULL
    END,
    NEW.email,
    CASE
      WHEN NEW.raw_user_meta_data->>'privacy_policy_accepted_at' IS NOT NULL
      THEN (NEW.raw_user_meta_data->>'privacy_policy_accepted_at')::TIMESTAMPTZ
      ELSE NULL
    END,
    CASE
      WHEN NEW.raw_user_meta_data->>'age_verified_at' IS NOT NULL
      THEN (NEW.raw_user_meta_data->>'age_verified_at')::TIMESTAMPTZ
      ELSE NULL
    END,
    1, -- Default profile level
    CASE
      WHEN NEW.raw_user_meta_data->>'first_name' IS NOT NULL
        AND NEW.raw_user_meta_data->>'last_name' IS NOT NULL
        AND NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL
      THEN 60  -- Basic info provided
      ELSE 40  -- Minimal info
    END,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS 
'Automatically creates a profile entry when a new auth.users record is inserted. 
Extracts data from raw_user_meta_data including mobile, GPS coordinates, and consent timestamps.';

-- ============================================================================
-- PART 4: Backfill Existing Users
-- ============================================================================

-- Update existing users to extract GPS coordinates from metadata
UPDATE public.profiles p
SET 
  latitude = (
    SELECT (au.raw_user_meta_data->>'latitude')::DECIMAL
    FROM auth.users au
    WHERE au.id = p.user_id
    AND au.raw_user_meta_data->>'latitude' IS NOT NULL
  ),
  longitude = (
    SELECT (au.raw_user_meta_data->>'longitude')::DECIMAL
    FROM auth.users au
    WHERE au.id = p.user_id
    AND au.raw_user_meta_data->>'longitude' IS NOT NULL
  ),
  privacy_policy_accepted_at = (
    SELECT (au.raw_user_meta_data->>'privacy_policy_accepted_at')::TIMESTAMPTZ
    FROM auth.users au
    WHERE au.id = p.user_id
    AND au.raw_user_meta_data->>'privacy_policy_accepted_at' IS NOT NULL
  ),
  age_verified_at = (
    SELECT (au.raw_user_meta_data->>'age_verified_at')::TIMESTAMPTZ
    FROM auth.users au
    WHERE au.id = p.user_id
    AND au.raw_user_meta_data->>'age_verified_at' IS NOT NULL
  )
WHERE p.latitude IS NULL OR p.privacy_policy_accepted_at IS NULL;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
