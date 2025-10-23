-- =====================================================
-- User Type Classification Fix - Step 2
-- Migrate data and rename enum value
-- =====================================================

-- Migrate existing 'office_user' records to 'looplly_team_user'
UPDATE public.profiles
SET user_type = 'looplly_team_user'
WHERE user_type = 'office_user';

-- Rename 'office_user' to 'client_user' in enum
ALTER TYPE public.user_type RENAME VALUE 'office_user' TO 'client_user';

-- Add helper function for checking team membership
CREATE OR REPLACE FUNCTION public.is_looplly_team_member(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id
      AND user_type = 'looplly_team_user'
  )
$$;

-- Update column comments for clarity
COMMENT ON COLUMN public.profiles.user_type IS 
'User classification:
- looplly_user: Regular users (main user base, no admin access)
- looplly_team_user: Looplly staff (admin portal access, assigned roles in user_roles table)
- client_user: B2B clients (future - companies using Looplly services)';

COMMENT ON COLUMN public.profiles.company_name IS 
'For looplly_team_user: Internal team name (e.g., "Looplly Core Team")
For client_user (future): Client company name (e.g., "Acme Corp")';

COMMENT ON COLUMN public.profiles.company_role IS 
'For looplly_team_user: Job title at Looplly (e.g., "Product Manager")
For client_user (future): Role at client company (e.g., "HR Director")';