-- Fix test users with 11-character numbers: +274XXXXXXX → +277XXXXXXX
-- Pattern: +274 followed by 7 digits, missing the leading '7' after country code
UPDATE profiles
SET mobile = '+277' || substring(mobile from 4)
WHERE is_test_account = true
  AND mobile ~ '^\+274\d{7}$'
  AND length(mobile) = 11
  AND country_code = '+27';

-- Fix test users with 12-character numbers: +27XXXXXXXXX → +277XXXXXXXX
-- Pattern: +27 + 9 digits, need to insert '7' after +27 and keep last digit
-- Example: +27823093955 → +27 + 7 + 8230939 + 5 = +27782309395
UPDATE profiles
SET mobile = '+277' || substring(mobile from 4 for 7) || substring(mobile from 12 for 1)
WHERE is_test_account = true
  AND mobile ~ '^\+27[^67]\d{8}$'
  AND length(mobile) = 12
  AND country_code = '+27';

-- Verify results
SELECT 
  first_name, 
  last_name, 
  mobile,
  length(mobile) as len,
  CASE 
    WHEN mobile ~ '^\+27[67]\d{8}$' THEN 'VALID'
    ELSE 'INVALID'
  END as status
FROM profiles
WHERE is_test_account = true
ORDER BY first_name;