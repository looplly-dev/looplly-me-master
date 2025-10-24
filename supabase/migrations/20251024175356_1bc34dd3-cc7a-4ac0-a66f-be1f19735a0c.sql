-- Update RLS policy on documentation table to allow admins and team members to read
DROP POLICY IF EXISTS "Team members can read docs" ON documentation;

CREATE POLICY "Team members and admins can read docs"
  ON documentation
  FOR SELECT
  USING (is_team_member(auth.uid()) OR has_role(auth.uid(), 'admin'));