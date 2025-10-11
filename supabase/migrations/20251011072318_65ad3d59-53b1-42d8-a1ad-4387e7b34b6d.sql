-- Add badge preview mode column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN badge_preview_mode boolean DEFAULT false;

COMMENT ON COLUMN public.profiles.badge_preview_mode IS 'Admin-only: When enabled, shows all badges as earned in preview mode';