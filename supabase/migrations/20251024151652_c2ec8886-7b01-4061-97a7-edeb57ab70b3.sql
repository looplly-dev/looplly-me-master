-- PHASE 1: CRITICAL SECURITY HARDENING FOR KNOWLEDGE CENTRE
-- Create dedicated team_members table as single source of truth

-- Step 1: Create team_members table with strict RLS
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  department TEXT,
  access_level TEXT DEFAULT 'standard',
  added_at TIMESTAMPTZ DEFAULT now(),
  added_by uuid REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- CRITICAL: Only super_admins can see and manage this table
CREATE POLICY "Only super admins can view team members"
ON public.team_members
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Only super admins can manage team members"
ON public.team_members
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));

-- Step 2: Drop existing team member check functions
DROP FUNCTION IF EXISTS public.is_looplly_team_member(uuid);
DROP FUNCTION IF EXISTS public.is_team_member(uuid);

-- Create new secure function to check team membership
CREATE OR REPLACE FUNCTION public.is_team_member(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE user_id = _user_id
      AND is_active = true
  )
$$;

-- Step 3: Update Documentation RLS policies to use secure function
DROP POLICY IF EXISTS "Team members can read docs" ON documentation;

CREATE POLICY "Team members can read docs"
ON documentation
FOR SELECT
TO authenticated
USING (public.is_team_member(auth.uid()));

-- Update history table policy
-- Note: documentation_history table doesn't exist, skipping
-- DROP POLICY IF EXISTS "Team members can read version history" ON documentation_history;

-- CREATE POLICY "Team members can read version history"
-- ON documentation_history
-- FOR SELECT
-- TO authenticated
-- USING (public.is_team_member(auth.uid()));

-- Step 4: Migrate existing team members from profiles table
INSERT INTO public.team_members (user_id, department, added_at, is_active)
SELECT 
  user_id,
  company_name as department,
  created_at as added_at,
  true as is_active
FROM public.profiles
WHERE user_type = 'looplly_team_user'
ON CONFLICT (user_id) DO NOTHING;

-- Step 5: Add comment to deprecate user_type column
COMMENT ON COLUMN profiles.user_type IS 'DEPRECATED: Use team_members table instead for team membership checks. Maintained for backward compatibility only.';