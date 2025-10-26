-- Function to normalize mobile on profile save
CREATE OR REPLACE FUNCTION normalize_profile_mobile()
RETURNS TRIGGER AS $$
BEGIN
  -- Only normalize if mobile and country_code exist
  IF NEW.mobile IS NOT NULL AND NEW.country_code IS NOT NULL THEN
    NEW.mobile := normalize_mobile_number(NEW.mobile, NEW.country_code);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-normalize on save
CREATE TRIGGER normalize_mobile_on_save
  BEFORE INSERT OR UPDATE OF mobile, country_code
  ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION normalize_profile_mobile();

-- One-time fix: Correct test users with 8-digit numbers (missing leading 7)
UPDATE profiles
SET mobile = '+27' || substring(mobile from 4)
WHERE is_test_account = true
  AND mobile ~ '^\+274\d{8}$'
  AND length(mobile) = 12
  AND country_code = '+27';