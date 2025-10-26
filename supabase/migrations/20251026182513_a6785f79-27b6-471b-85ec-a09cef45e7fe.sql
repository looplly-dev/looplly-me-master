-- Add password hash column for custom Looplly authentication
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Ensure mobile is unique (primary identifier for Looplly users)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_mobile_unique_idx 
ON profiles(mobile) WHERE mobile IS NOT NULL;

-- Add comment to document the design
COMMENT ON COLUMN profiles.password_hash IS 'bcrypt hashed password for Looplly users (not stored in auth.users)';
COMMENT ON COLUMN profiles.user_id IS 'Primary key UUID - NOT a foreign key to auth.users for Looplly users';