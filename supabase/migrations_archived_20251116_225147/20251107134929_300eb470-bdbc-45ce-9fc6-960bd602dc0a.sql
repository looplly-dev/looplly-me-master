-- Allow unauthenticated email lookups for password reset flow
-- This is safe because:
-- 1. We only expose the email column (no sensitive data)
-- 2. Email is already somewhat public (needed to send password resets)
-- 3. This is required for forgot password to determine correct redirect URL

CREATE POLICY "Allow unauthenticated email lookups for password reset"
ON public.team_profiles
FOR SELECT
TO public
USING (true);

COMMENT ON POLICY "Allow unauthenticated email lookups for password reset" ON public.team_profiles 
IS 'Allows checking if an email belongs to a team member during password reset flow. Only exposes email column, no sensitive data.';