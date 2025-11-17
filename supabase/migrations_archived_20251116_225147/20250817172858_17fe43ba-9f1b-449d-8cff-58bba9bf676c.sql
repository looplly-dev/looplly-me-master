-- Remove email for user with mobile 7708997235
UPDATE auth.users 
SET email = NULL, email_confirmed_at = NULL, raw_user_meta_data = raw_user_meta_data - 'email'
WHERE phone = '7708997235';