-- Migration: Allow NULL values for first_name and last_name in profiles
-- Reason: Registration form may not always capture these fields immediately
-- Users can complete their profile later

-- Make first_name and last_name nullable
ALTER TABLE public.profiles 
  ALTER COLUMN first_name DROP NOT NULL,
  ALTER COLUMN last_name DROP NOT NULL;

-- Update the handle_new_user trigger to handle missing fields gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
    COALESCE(NEW.raw_user_meta_data->>'mobile', ''),
    COALESCE(NEW.raw_user_meta_data->>'country_code', '+1'),
    NULLIF(COALESCE(NEW.raw_user_meta_data->>'first_name', ''), ''),
    NULLIF(COALESCE(NEW.raw_user_meta_data->>'last_name', ''), ''),
    CASE 
      WHEN NEW.raw_user_meta_data->>'date_of_birth' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'date_of_birth')::DATE 
      ELSE NULL 
    END,
    COALESCE((NEW.raw_user_meta_data->>'gps_enabled')::BOOLEAN, false),
    NEW.email,
    1, 
    -- Calculate initial profile completeness based on what was provided
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

-- Add comment explaining the change
COMMENT ON COLUMN public.profiles.first_name IS 'User first name - can be null if not provided during registration';
COMMENT ON COLUMN public.profiles.last_name IS 'User last name - can be null if not provided during registration';