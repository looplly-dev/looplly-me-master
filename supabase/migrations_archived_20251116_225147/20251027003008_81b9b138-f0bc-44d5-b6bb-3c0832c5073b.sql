-- Fix user_roles foreign key to support team members
-- Team members are in team_profiles, not profiles table

-- Drop existing foreign key constraint on user_roles
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

-- Drop existing unique constraint if it exists
ALTER TABLE public.user_roles 
DROP CONSTRAINT IF EXISTS user_roles_user_id_key;

-- Add new foreign key to auth.users (allows both regular users and team members)
ALTER TABLE public.user_roles 
ADD CONSTRAINT user_roles_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES auth.users(id) 
ON DELETE CASCADE;

-- Add unique constraint to prevent duplicate role assignments
ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_user_id_role_key 
UNIQUE (user_id, role);

-- Bootstrap super_admin roles for existing team members
INSERT INTO public.user_roles (user_id, role)
SELECT 
  tp.user_id,
  'super_admin'::app_role
FROM public.team_profiles tp
WHERE tp.is_active = true
ON CONFLICT (user_id, role) DO NOTHING;

-- Comment to document the architecture
COMMENT ON TABLE public.user_roles IS 'Stores role assignments for authorization. user_id references auth.users to support both regular users (in profiles) and team members (in team_profiles).';
