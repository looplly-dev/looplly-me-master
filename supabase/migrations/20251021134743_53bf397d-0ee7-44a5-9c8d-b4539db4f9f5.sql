-- ============================================
-- Secure Role-Based Visibility System
-- ============================================

-- 1. Create security definer function to check if viewer can see target user
CREATE OR REPLACE FUNCTION public.can_view_user_profile(_viewer_id UUID, _target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  viewer_role app_role;
  target_role app_role;
BEGIN
  -- Get viewer's role (default to 'user' if none)
  SELECT role INTO viewer_role
  FROM public.user_roles
  WHERE user_id = _viewer_id
  LIMIT 1;
  
  IF viewer_role IS NULL THEN
    viewer_role := 'user';
  END IF;
  
  -- If viewer is viewing themselves, always allow
  IF _viewer_id = _target_user_id THEN
    RETURN TRUE;
  END IF;
  
  -- Super admins can see everyone
  IF viewer_role = 'super_admin' THEN
    RETURN TRUE;
  END IF;
  
  -- Get target user's role
  SELECT role INTO target_role
  FROM public.user_roles
  WHERE user_id = _target_user_id
  LIMIT 1;
  
  IF target_role IS NULL THEN
    target_role := 'user';
  END IF;
  
  -- Admins can only see regular users (not other admins or super admins)
  IF viewer_role = 'admin' AND target_role = 'user' THEN
    RETURN TRUE;
  END IF;
  
  -- Default deny
  RETURN FALSE;
END;
$$;

-- 2. Update profiles SELECT policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Admins and super admins can view permitted profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.can_view_user_profile(auth.uid(), user_id));

-- 3. Update profiles UPDATE policy (for suspension and other admin updates)
DROP POLICY IF EXISTS "Admins can suspend users" ON public.profiles;

CREATE POLICY "Admins and super admins can update permitted profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.can_view_user_profile(auth.uid(), user_id))
WITH CHECK (public.can_view_user_profile(auth.uid(), user_id));

-- 4. Refactor user_roles policies for proper role management
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Super admins can manage all roles
CREATE POLICY "Super admins can manage all roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'super_admin'))
WITH CHECK (public.has_role(auth.uid(), 'super_admin'));

-- Admins can only manage regular user roles (not admin or super_admin)
CREATE POLICY "Admins can manage user roles only"
ON public.user_roles
FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') 
  AND role = 'user'
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') 
  AND role = 'user'
);