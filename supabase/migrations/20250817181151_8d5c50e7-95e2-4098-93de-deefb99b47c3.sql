-- Delete all traces of user with mobile 7708997235 from all tables
DELETE FROM communication_preferences WHERE user_id IN (
  SELECT user_id FROM profiles WHERE mobile = '7708997235'
);

DELETE FROM otp_verifications WHERE mobile = '7708997235';

DELETE FROM profiles WHERE mobile = '7708997235';

-- Also delete any auth users that might have this phone number
-- Note: We can't directly delete from auth.users via SQL, but we can clean up any orphaned data