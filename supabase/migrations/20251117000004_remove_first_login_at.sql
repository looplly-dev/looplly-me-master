-- Migration: Remove first_login_at field
-- Description: Drop first_login_at column and related function as it's not being used
-- Date: 2025-11-17

-- Drop the function first (if it exists)
DROP FUNCTION IF EXISTS public.track_first_login(UUID);

-- Drop the column from profiles table
ALTER TABLE public.profiles DROP COLUMN IF EXISTS first_login_at;

-- Summary: Removed unused first_login_at tracking functionality
