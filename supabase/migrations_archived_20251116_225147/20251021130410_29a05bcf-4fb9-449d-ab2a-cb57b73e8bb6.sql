-- Phase 1: Add super_admin to enum and create hierarchy function

-- Step 1: Add super_admin value to existing app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

COMMENT ON TYPE public.app_role IS '3-tier role hierarchy: super_admin > admin > user';

-- Step 2: Create role hierarchy function
CREATE OR REPLACE FUNCTION public.has_role_or_higher(_user_id uuid, _required_role app_role)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
  role_hierarchy jsonb := '{
    "super_admin": 3,
    "admin": 2,
    "user": 1
  }';
BEGIN
  -- Get user's role from user_roles table
  SELECT role INTO user_role
  FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1;
  
  -- If no role found, default to 'user'
  IF user_role IS NULL THEN
    user_role := 'user';
  END IF;
  
  -- Compare role levels
  RETURN (role_hierarchy->>user_role::text)::int >= (role_hierarchy->>_required_role::text)::int;
END;
$$;

COMMENT ON FUNCTION public.has_role_or_higher IS 
'Checks if user has the specified role or higher. Hierarchy: super_admin (3) > admin (2) > user (1)';

-- Step 3: Update critical RLS policies to use hierarchy function
DROP POLICY IF EXISTS "Admins can manage questions" ON profile_questions;
CREATE POLICY "Admins can manage questions"
ON profile_questions
FOR ALL
TO authenticated
USING (public.has_role_or_higher(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
CREATE POLICY "Admins can manage roles"
ON user_roles
FOR ALL
TO authenticated
USING (public.has_role_or_higher(auth.uid(), 'admin'));