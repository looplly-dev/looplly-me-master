-- Add missing profile fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS household_income text,
ADD COLUMN IF NOT EXISTS ethnicity text,
ADD COLUMN IF NOT EXISTS gps_enabled boolean DEFAULT false;