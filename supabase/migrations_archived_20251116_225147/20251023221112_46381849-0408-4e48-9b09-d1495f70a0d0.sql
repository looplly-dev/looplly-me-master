-- =====================================================
-- PHASE 1: CREATE TEAM-ONLY TABLES
-- =====================================================

-- Create team_profiles table for looplly_team_user only
CREATE TABLE IF NOT EXISTS public.team_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text,
  last_name text,
  mobile text,
  country_code text,
  company_name text,
  company_role text,
  is_active boolean DEFAULT true,
  must_change_password boolean DEFAULT false,
  temp_password_expires_at timestamptz,
  first_login_at timestamptz,
  invited_by uuid REFERENCES auth.users(id),
  invitation_sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on team_profiles
ALTER TABLE public.team_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_profiles
CREATE POLICY "Team members can view own profile"
  ON public.team_profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Team members can update own profile"
  ON public.team_profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all team profiles"
  ON public.team_profiles FOR SELECT
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can insert team profiles"
  ON public.team_profiles FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update team profiles"
  ON public.team_profiles FOR UPDATE
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete team profiles"
  ON public.team_profiles FOR DELETE
  USING (has_role(auth.uid(), 'super_admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_team_profiles_updated_at
  BEFORE UPDATE ON public.team_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create team_activity_log table
CREATE TABLE IF NOT EXISTS public.team_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_user_id uuid NOT NULL REFERENCES public.team_profiles(user_id) ON DELETE CASCADE,
  action text NOT NULL,
  resource_type text,
  resource_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on team_activity_log
ALTER TABLE public.team_activity_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_activity_log
CREATE POLICY "Admins can view team activity"
  ON public.team_activity_log FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert team activity"
  ON public.team_activity_log FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- PHASE 2: MIGRATE EXISTING TEAM USER DATA
-- =====================================================

-- Copy existing team users to team_profiles
-- Note: email column doesn't exist in profiles, will need to be added separately
INSERT INTO public.team_profiles (
  user_id,
  email,
  first_name,
  last_name,
  mobile,
  country_code,
  company_name,
  company_role,
  created_at,
  updated_at
)
SELECT 
  user_id,
  'team@looplly.me' as email,  -- Placeholder email since column doesn't exist in source
  first_name,
  last_name,
  mobile,
  country_code,
  company_name,
  company_role,
  created_at,
  updated_at
FROM public.profiles
WHERE user_type = 'looplly_team_user'
ON CONFLICT (user_id) DO NOTHING;

-- Clean up team user profiling data from profiles table
-- Note: is_verified column doesn't exist, removed from UPDATE
UPDATE public.profiles
SET
  profile_complete = false,
  profile_level = NULL,
  profile_completeness_score = NULL,
  date_of_birth = NULL,
  gender = NULL,
  sec = NULL,
  address = NULL,
  household_income = NULL,
  ethnicity = NULL,
  gps_enabled = false
WHERE user_type = 'looplly_team_user';

-- =====================================================
-- PHASE 3: CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get team profile by user_id
CREATE OR REPLACE FUNCTION public.get_team_profile(p_user_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  email text,
  first_name text,
  last_name text,
  mobile text,
  country_code text,
  company_name text,
  company_role text,
  is_active boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    id,
    user_id,
    email,
    first_name,
    last_name,
    mobile,
    country_code,
    company_name,
    company_role,
    is_active,
    created_at
  FROM public.team_profiles
  WHERE team_profiles.user_id = p_user_id;
$$;

-- Function to check if user is team member
CREATE OR REPLACE FUNCTION public.is_team_member(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_profiles
    WHERE user_id = p_user_id
      AND is_active = true
  )
$$;