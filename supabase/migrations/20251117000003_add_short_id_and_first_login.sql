-- Migration: Add short_id generation and first_login_at tracking
-- Description: Auto-generate unique short IDs for profiles and track first login
-- Date: 2025-11-17

-- ============================================================================
-- PART 1: Function to Generate Short ID
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_short_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Avoid confusing chars like 0,O,1,I
  result TEXT := '';
  i INTEGER;
BEGIN
  -- Generate 8-character short ID
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$;

COMMENT ON FUNCTION generate_short_id() IS 
'Generates a random 8-character alphanumeric short ID (excludes confusing characters like 0, O, 1, I)';

-- ============================================================================
-- PART 2: Update handle_new_user to Generate Short ID
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_short_id TEXT;
  max_attempts INTEGER := 10;
  attempt INTEGER := 0;
BEGIN
  -- Generate unique short_id with retry logic
  LOOP
    new_short_id := generate_short_id();
    
    -- Check if short_id already exists
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE short_id = new_short_id) THEN
      EXIT; -- Found unique ID
    END IF;
    
    attempt := attempt + 1;
    IF attempt >= max_attempts THEN
      RAISE EXCEPTION 'Failed to generate unique short_id after % attempts', max_attempts;
    END IF;
  END LOOP;

  -- Create profile entry when auth.users record is created
  INSERT INTO public.profiles (
    user_id,
    short_id,
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
    new_short_id,
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
Generates unique short_id and extracts data from raw_user_meta_data including mobile, GPS coordinates, and consent timestamps.';

-- ============================================================================
-- PART 3: Backfill Short IDs for Existing Users
-- ============================================================================

-- Generate short_ids for existing profiles that don't have one
DO $$
DECLARE
  profile_record RECORD;
  new_short_id TEXT;
  max_attempts INTEGER := 10;
  attempt INTEGER;
BEGIN
  FOR profile_record IN SELECT user_id FROM public.profiles WHERE short_id IS NULL LOOP
    attempt := 0;
    
    -- Generate unique short_id with retry logic
    LOOP
      new_short_id := generate_short_id();
      
      -- Check if short_id already exists
      IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE short_id = new_short_id) THEN
        EXIT; -- Found unique ID
      END IF;
      
      attempt := attempt + 1;
      IF attempt >= max_attempts THEN
        RAISE EXCEPTION 'Failed to generate unique short_id for user_id: %', profile_record.user_id;
      END IF;
    END LOOP;
    
    -- Update profile with new short_id
    UPDATE public.profiles 
    SET short_id = new_short_id 
    WHERE user_id = profile_record.user_id;
  END LOOP;
END;
$$;

-- ============================================================================
-- PART 4: Function to Track First Login
-- ============================================================================

CREATE OR REPLACE FUNCTION public.track_first_login(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only update if first_login_at is NULL (meaning this is the first login)
  UPDATE public.profiles
  SET first_login_at = NOW()
  WHERE user_id = p_user_id
    AND first_login_at IS NULL;
END;
$$;

COMMENT ON FUNCTION public.track_first_login(UUID) IS 
'Tracks the first login timestamp for a user. Should be called after successful authentication.
Only sets the timestamp if it has not been set before.';

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.track_first_login(UUID) TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Summary:
-- ✅ Added generate_short_id() function for creating unique IDs
-- ✅ Updated handle_new_user() trigger to auto-generate short_id
-- ✅ Backfilled short_id for existing users
-- ✅ Added track_first_login() function (call this after login in frontend)
-- ✅ first_login_at remains NULL until user logs in for the first time
