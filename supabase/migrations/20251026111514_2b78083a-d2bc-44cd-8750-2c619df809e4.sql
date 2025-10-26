-- Drop the overly restrictive policy
DROP POLICY IF EXISTS "Only super admins can view team members" ON public.team_members;

-- Allow team members to view their own active record
CREATE POLICY "Team members can view own record"
ON public.team_members
FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND is_active = true);

-- Ensure super admins retain full management access
CREATE POLICY "Super admins can manage all team members"
ON public.team_members
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'super_admin'))
WITH CHECK (has_role(auth.uid(), 'super_admin'));