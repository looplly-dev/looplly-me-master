-- Add is_test_account flag to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_test_account BOOLEAN DEFAULT false;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_profiles_test_account 
ON profiles(is_test_account) WHERE is_test_account = true;

-- Add comment for documentation
COMMENT ON COLUMN profiles.is_test_account IS 
'Flags test accounts used in Journey Simulator. Test accounts are isolated from production users and can be reset to different journey stages.';