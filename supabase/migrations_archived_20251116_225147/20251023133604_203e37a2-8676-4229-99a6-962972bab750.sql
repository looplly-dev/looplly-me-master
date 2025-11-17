-- Bootstrap initial super_admin
-- This temporarily bypasses RLS to create the first super admin

-- Create bootstrap function with SECURITY DEFINER to bypass RLS
CREATE OR REPLACE FUNCTION public.bootstrap_super_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only bootstrap if no super_admins exist
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'super_admin'::app_role) THEN
    -- Make the first user a super_admin
    INSERT INTO public.user_roles (user_id, role)
    SELECT user_id, 'super_admin'::app_role
    FROM public.profiles
    ORDER BY created_at ASC
    LIMIT 1
    ON CONFLICT DO NOTHING;
  END IF;
END;
$$;

-- Execute the bootstrap
SELECT public.bootstrap_super_admin();

-- Drop the bootstrap function (one-time use only)
DROP FUNCTION public.bootstrap_super_admin();