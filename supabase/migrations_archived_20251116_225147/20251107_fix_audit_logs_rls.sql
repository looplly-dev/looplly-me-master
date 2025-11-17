-- Fix audit_logs RLS policies to allow authenticated users to insert
-- This fixes the 401 Unauthorized errors when flushing audit logs

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow service role to insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow authenticated users to insert audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow admins to view all audit logs" ON public.audit_logs;

-- Recreate policies with correct permissions
CREATE POLICY "Allow service role full access to audit logs"
ON public.audit_logs
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert their own audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);  -- Allow any authenticated user to insert audit logs

CREATE POLICY "Allow admins to view all audit logs"
ON public.audit_logs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('admin', 'super_admin')
  )
);