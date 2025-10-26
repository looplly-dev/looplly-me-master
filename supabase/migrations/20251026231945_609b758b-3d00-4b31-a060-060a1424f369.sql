-- Fix RLS on backup table created by previous migration
ALTER TABLE profiles_team_backup ENABLE ROW LEVEL SECURITY;

-- Add policy so only super admins can view the backup
CREATE POLICY "Super admins can view team backup"
ON profiles_team_backup
FOR SELECT
USING (has_role(auth.uid(), 'super_admin'::text));