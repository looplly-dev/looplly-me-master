-- Migration: Backfill missing country_code from mobile numbers
-- Description: Extract country code from mobile numbers for profiles where country_code is NULL
-- Date: 2025-11-09
-- Issue: Users with NULL country_code cannot complete address questions

-- This migration fixes profiles that have mobile numbers but no country_code set.
-- Mobile numbers are stored in E.164 format (e.g., "+27821234567"), so we can extract the dial code.

DO $$
DECLARE
  affected_count INTEGER;
  profile_record RECORD;
  extracted_code TEXT;
BEGIN
  -- Log start of migration
  RAISE NOTICE 'Starting country_code backfill migration...';
  
  -- Count profiles that need fixing
  SELECT COUNT(*) INTO affected_count
  FROM profiles
  WHERE country_code IS NULL 
    AND mobile IS NOT NULL 
    AND mobile ~ '^\+\d{1,4}';
  
  RAISE NOTICE 'Found % profiles with NULL country_code but valid mobile numbers', affected_count;
  
  -- Update profiles by extracting country code from mobile
  -- Match country code pattern: + followed by 1-4 digits
  UPDATE profiles
  SET 
    country_code = substring(mobile from '^\+\d{1,4}'),
    updated_at = NOW()
  WHERE 
    country_code IS NULL 
    AND mobile IS NOT NULL 
    AND mobile ~ '^\+\d{1,4}';
  
  -- Log results
  GET DIAGNOSTICS affected_count = ROW_COUNT;
  RAISE NOTICE 'Successfully updated % profiles with extracted country codes', affected_count;
  
  -- Verify the update
  FOR profile_record IN 
    SELECT 
      user_id,
      mobile,
      country_code,
      first_name,
      last_name
    FROM profiles
    WHERE country_code IS NOT NULL 
      AND mobile IS NOT NULL
    ORDER BY updated_at DESC
    LIMIT 5
  LOOP
    RAISE NOTICE 'Sample: User % (% %) - mobile: %, country_code: %',
      profile_record.user_id,
      profile_record.first_name,
      profile_record.last_name,
      profile_record.mobile,
      profile_record.country_code;
  END LOOP;
  
  -- Check for any remaining NULL country_codes
  SELECT COUNT(*) INTO affected_count
  FROM profiles
  WHERE country_code IS NULL 
    AND mobile IS NOT NULL;
  
  IF affected_count > 0 THEN
    RAISE WARNING 'Still have % profiles with NULL country_code - may need manual intervention', affected_count;
    
    -- Log details of problematic profiles
    FOR profile_record IN 
      SELECT 
        user_id,
        mobile,
        first_name,
        last_name
      FROM profiles
      WHERE country_code IS NULL 
        AND mobile IS NOT NULL
      LIMIT 10
    LOOP
      RAISE WARNING 'Needs manual fix: User % (% %) - mobile: %',
        profile_record.user_id,
        profile_record.first_name,
        profile_record.last_name,
        profile_record.mobile;
    END LOOP;
  ELSE
    RAISE NOTICE 'All profiles with mobile numbers now have country_code set!';
  END IF;
  
END $$;

-- Add a comment to the migration for future reference
COMMENT ON COLUMN profiles.country_code IS 'User country dial code (e.g., +27). Should always be set when mobile is present. Extracted from mobile number in E.164 format.';

-- Create an index on country_code for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_country_code ON profiles(country_code);

-- Optional: Add a check constraint to prevent future NULL country_codes when mobile is set
-- Uncomment if you want to enforce this at the database level
-- ALTER TABLE profiles 
--   ADD CONSTRAINT check_country_code_when_mobile_set 
--   CHECK (
--     (mobile IS NULL) OR 
--     (mobile IS NOT NULL AND country_code IS NOT NULL)
--   );

COMMENT ON TABLE profiles IS 'User profiles table. The country_code should always be populated when mobile is set, as it is extracted from the E.164 formatted mobile number.';
