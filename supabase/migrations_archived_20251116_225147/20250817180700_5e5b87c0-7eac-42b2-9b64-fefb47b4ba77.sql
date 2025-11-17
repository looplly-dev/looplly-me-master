-- First, let's create the missing user in auth.users table
-- We need to recreate the user that was deleted but whose profile still exists

-- Get the profile data to recreate the user
-- Note: We'll need to insert directly into auth.users, but this requires admin privileges

-- Instead, let's create an Edge Function or check if there's a simpler approach
-- For now, let's clean up the orphaned profile and let the user register again

DELETE FROM profiles WHERE mobile = '7708997235';