-- Fix RLS policies for admin access to profiles table
-- The policies were incorrectly calling can_view_user_profile(auth.uid()) 
-- instead of can_view_user_profile(user_id) which caused admins to be unable to view any profiles

-- Drop the incorrectly configured SELECT policy
DROP POLICY IF EXISTS "Admins and super admins can view permitted profiles" ON public.profiles;

-- Recreate with correct function call - pass user_id from the row being checked
CREATE POLICY "Admins and super admins can view permitted profiles"
  ON public.profiles
  FOR SELECT
  USING (can_view_user_profile(user_id));

-- Drop the incorrectly configured UPDATE policy
DROP POLICY IF EXISTS "Admins and super admins can update permitted profiles" ON public.profiles;

-- Recreate with correct function call - pass user_id from the row being updated
CREATE POLICY "Admins and super admins can update permitted profiles"
  ON public.profiles
  FOR UPDATE
  USING (can_view_user_profile(user_id));
