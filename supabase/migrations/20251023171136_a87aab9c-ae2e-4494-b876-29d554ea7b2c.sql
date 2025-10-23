-- Add unique constraint on email for profiles table
ALTER TABLE profiles 
ADD CONSTRAINT profiles_email_key UNIQUE (email);