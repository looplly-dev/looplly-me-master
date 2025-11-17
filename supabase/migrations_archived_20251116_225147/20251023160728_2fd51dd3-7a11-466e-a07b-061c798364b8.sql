-- Phase 1: Add B2B Invitation System Columns

-- Add invitation tracking columns to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS must_change_password boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS invited_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS invitation_sent_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS temp_password_expires_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS first_login_at timestamp with time zone;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.must_change_password IS 'Forces user to reset password on next login';
COMMENT ON COLUMN public.profiles.invited_by IS 'Super admin who invited this user';
COMMENT ON COLUMN public.profiles.temp_password_expires_at IS 'Expiry time for temporary password (default 7 days)';
COMMENT ON COLUMN public.profiles.first_login_at IS 'Timestamp of first successful login';

-- Create user type enum
DO $$ BEGIN
    CREATE TYPE public.user_type AS ENUM ('looplly_user', 'office_user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add user_type column to profiles
DO $$ BEGIN
    ALTER TABLE public.profiles ADD COLUMN user_type public.user_type DEFAULT 'looplly_user';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Add B2B specific fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS company_name text,
ADD COLUMN IF NOT EXISTS company_role text;

-- Add index for company queries
CREATE INDEX IF NOT EXISTS idx_profiles_company_name ON public.profiles(company_name);

-- Add index for must_change_password for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_must_change_password ON public.profiles(must_change_password) WHERE must_change_password = true;