BEGIN;

-- Replace exact-match admin policy with hierarchy-aware staff policy
DROP POLICY IF EXISTS "Admins can manage blocklist" ON public.country_blocklist;

CREATE POLICY "Staff can manage blocklist"
ON public.country_blocklist
FOR ALL
TO authenticated
USING (public.has_role_or_higher(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role_or_higher(auth.uid(), 'admin'::app_role));

COMMIT;