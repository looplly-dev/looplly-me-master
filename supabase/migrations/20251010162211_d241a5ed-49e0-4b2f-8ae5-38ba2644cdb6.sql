-- Fix audit_logs RLS - allow service role and authenticated users to insert
CREATE POLICY "Allow service role to insert audit logs"
ON public.audit_logs
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert audit logs"
ON public.audit_logs
FOR INSERT
TO authenticated
WITH CHECK (true);