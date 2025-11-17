-- Remove foreign key constraint from profiles table
-- This allows the mock registration system to create profiles without auth.users entries

ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Add a comment explaining this is for custom auth
COMMENT ON COLUMN public.profiles.user_id IS 'User ID - can be custom generated for mock auth system';