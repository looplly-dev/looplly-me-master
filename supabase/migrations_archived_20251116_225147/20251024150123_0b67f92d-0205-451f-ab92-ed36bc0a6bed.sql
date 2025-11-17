-- CRITICAL SECURITY FIX: Restrict documentation access to team members only

-- Drop the insecure "Authenticated users can read docs" policy
DROP POLICY IF EXISTS "Authenticated users can read docs" ON documentation;

-- Create new team-member-only read policy
CREATE POLICY "Team members can read docs"
ON documentation
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.user_type = 'looplly_team_user'
  )
);

-- Ensure admin management policy is secure
DROP POLICY IF EXISTS "Admins can manage docs" ON documentation;

CREATE POLICY "Admins can manage docs"
ON documentation
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- SECURE DOCUMENTATION HISTORY TABLE
-- Note: Skipping documentation_history (table doesn't exist)

-- Enable RLS on documentation_history if not already enabled
-- ALTER TABLE documentation_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them securely
-- DROP POLICY IF EXISTS "Admins can view history" ON documentation_history;
-- DROP POLICY IF EXISTS "System can insert history" ON documentation_history;

-- Team members can read version history
-- CREATE POLICY "Team members can read version history"
-- ON documentation_history
-- FOR SELECT
-- TO authenticated
-- USING (
--   EXISTS (
--     SELECT 1 
--     FROM profiles 
--     WHERE profiles.user_id = auth.uid() 
--     AND profiles.user_type = 'looplly_team_user'
--   )
-- );

-- Only system/admins can create version history entries
-- CREATE POLICY "System can insert version history"
-- ON documentation_history
-- FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   has_role(auth.uid(), 'admin') OR auth.uid() IS NOT NULL
-- );
